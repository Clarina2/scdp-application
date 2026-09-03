"""
Application Service
===================
Manages Marketer Registration Application workflows for the SCDP Platform.

Flows:
1. `create_application`: Prospective marketer submits application.
   - Validates no pending/approved application or existing user account exists.
   - Creates `MarketerApplication` in `PENDING` state.
   - Sends notification to ADMIN role.
   - Sends confirmation email to applicant.

2. `track_application`: Public endpoint for applicants to check application status by email.

3. `find_all_applications`: Admin view of applications with optional status filter and pagination.

4. `update_application_status`: Admin approves or rejects application.
   - On APPROVED:
     * Sets application status to APPROVED.
     * Creates inactive `User` account (`is_active=False`, `role=MARKETER`).
     * Generates `ACCOUNT_VERIFICATION` OTP code via `OtpService`.
     * Sends approval email with OTP via `EmailService`.
     * Sends notification to the newly created user.
   - On REJECTED:
     * Validates rejection_reason presence.
     * Sets application status to REJECTED and saves reason.
     * Sends rejection email via `EmailService`.
"""

import logging, random, string, bcrypt
from typing import Optional, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_

from app.models.marketer_application import MarketerApplication, MarketerApplicationStatus
from app.models.user import User, Role
from app.models.otp import OtpType
from app.services.email_service import EmailService
from app.services.otp_service import OtpService
from app.services.notification_service import NotificationService
from app.common.exceptions.custom import (
    NotFoundException,
    ConflictException,
    BadRequestException,
)

logger = logging.getLogger(__name__)


class ApplicationService:
    """Async service handling marketer applications and approval lifecycles."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.email_service = EmailService()
        self.otp_service = OtpService(db, email_service=self.email_service)
        self.notification_service = NotificationService(db)

    async def create_application(
        self, name: str, email: str, company_name: str
    ) -> MarketerApplication:
        """Submit a new marketer application."""
        # 1. Check for active application (PENDING or APPROVED)
        app_result = await self.db.execute(
            select(MarketerApplication).where(
                and_(
                    MarketerApplication.email == email,
                    MarketerApplication.status.in_(
                        [MarketerApplicationStatus.PENDING, MarketerApplicationStatus.APPROVED]
                    ),
                )
            )
        )
        if app_result.scalar_one_or_none():
            raise ConflictException(
                "An active marketer application already exists for this email address."
            )

        # 2. Check if user account already exists
        user_result = await self.db.execute(select(User).where(User.email == email))
        if user_result.scalar_one_or_none():
            raise ConflictException("A user account with this email address already exists.")

        # 3. Persist application
        application = MarketerApplication(
            name=name,
            email=email,
            company_name=company_name,
            status=MarketerApplicationStatus.PENDING,
        )
        self.db.add(application)
        await self.db.commit()
        await self.db.refresh(application)

        # 4. Notify Administrators
        await self.notification_service.create_notification(
            title="New Marketer Application",
            message=f"A new marketer application has been submitted by {name} ({company_name}, {email}).",
            role=Role.ADMIN,
        )

        # 5. Send Email to applicant
        await self.email_service.send_application_submitted_email(email, name)

        return application

    async def track_application(self, email: str) -> MarketerApplication:
        """Track latest application by email address."""
        result = await self.db.execute(
            select(MarketerApplication)
            .where(MarketerApplication.email == email)
            .order_by(MarketerApplication.created_at.desc())
        )
        application = result.scalar_one_or_none()
        if not application:
            raise NotFoundException(f"No marketer application found for email address: {email}")
        return application

    async def find_all_applications(
        self,
        status: Optional[MarketerApplicationStatus] = None,
        page: int = 1,
        limit: int = 10,
    ) -> Tuple[List[MarketerApplication], int]:
        """List all marketer applications with optional status filter and pagination."""
        skip = (page - 1) * limit
        conditions = []
        if status:
            conditions.append(MarketerApplication.status == status)

        where_clause = and_(*conditions) if conditions else True

        # Total count
        count_query = select(func.count()).select_from(MarketerApplication).where(where_clause)
        total_res = await self.db.execute(count_query)
        total = total_res.scalar() or 0

        # Query items
        query = (
            select(MarketerApplication)
            .where(where_clause)
            .order_by(MarketerApplication.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(query)
        items = list(result.scalars().all())

        return items, total

    async def update_application_status(
        self,
        application_id: str,
        new_status: MarketerApplicationStatus,
        rejection_reason: Optional[str] = None,
    ) -> MarketerApplication:
        """Approve or reject a marketer application."""
        result = await self.db.execute(
            select(MarketerApplication).where(MarketerApplication.id == application_id)
        )
        application = result.scalar_one_or_none()
        if not application:
            raise NotFoundException("Marketer application not found")

        if new_status == MarketerApplicationStatus.APPROVED:
            # 1. Update application status
            application.status = MarketerApplicationStatus.APPROVED
            application.rejection_reason = None

            # 2. Find or create user account (inactive until password setup)
            u_res = await self.db.execute(select(User).where(User.email == application.email))
            user = u_res.scalar_one_or_none()

            if not user:
                # Generate random temporary password hash
                rand_str = "".join(random.choices(string.ascii_letters + string.digits, k=16))
                dummy_hash = bcrypt.hashpw(rand_str.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
                user = User(
                    name=application.name,
                    email=application.email,
                    password_hash=dummy_hash,
                    role=Role.MARKETER,
                    is_active=False,
                )
                self.db.add(user)

            await self.db.commit()
            await self.db.refresh(application)
            await self.db.refresh(user)

            # 3. Generate OTP for verification and account activation
            otp_code = await self.otp_service.generate_and_send_otp(
                email=application.email,
                otp_type=OtpType.ACCOUNT_VERIFICATION,
            )

            # 4. Send Approval Email with OTP
            await self.email_service.send_application_approved_email(
                email=application.email,
                name=application.name,
                otp_code=otp_code,
            )

            # 5. Notify Marketer User
            await self.notification_service.create_notification(
                user_id=user.id,
                title="Application Approved",
                message="Your marketer application has been approved. Please verify your OTP to set up your password.",
            )

            return application

        elif new_status == MarketerApplicationStatus.REJECTED:
            if not rejection_reason:
                raise BadRequestException(
                    "Rejection reason is required when rejecting an application."
                )

            application.status = MarketerApplicationStatus.REJECTED
            application.rejection_reason = rejection_reason

            await self.db.commit()
            await self.db.refresh(application)

            # Send rejection email
            await self.email_service.send_application_rejected_email(
                email=application.email,
                name=application.name,
                reason=rejection_reason,
            )

            return application

        else:
            raise BadRequestException("Invalid status update value")
