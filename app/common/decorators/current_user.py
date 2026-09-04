from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.models.user import User
from app.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Get current authenticated user from JWT token."""
    from app.auth.jwt_handler import decode_token
    
    token = credentials.credentials
    payload = decode_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    
    from app.services.user_service import UserService
    user_service = UserService(db)
    user = await user_service.find_by_id(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is not active"
        )
    
    # Attach view-as context to the user object if present in token
    if payload.get("view_as_user_id"):
        # Store view-as context as attributes on the user object
        user.view_as_user_id = payload.get("view_as_user_id")
        user.view_as_role = payload.get("view_as_role")
        user.view_as_email = payload.get("view_as_email")
        user.view_as_name = payload.get("view_as_name")
    else:
        user.view_as_user_id = None
        user.view_as_role = None
        user.view_as_email = None
        user.view_as_name = None
    
    return user


async def get_effective_user(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Get the effective user for data scoping - either the real user or the view-as target user."""
    # If admin is viewing as another user, return the target user for data scoping
    if hasattr(current_user, 'view_as_user_id') and current_user.view_as_user_id:
        from app.services.user_service import UserService
        user_service = UserService(db)
        target_user = await user_service.find_by_id(current_user.view_as_user_id)
        
        if not target_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="View-as target user not found"
            )

        if not target_user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="View-as target account is not active"
            )
        
        # Preserve the real admin context on the target user
        target_user.real_admin_id = current_user.id
        target_user.real_admin_email = current_user.email
        target_user.is_view_as_mode = True
        
        return target_user
    
    # No view-as context, return the real user
    current_user.is_view_as_mode = False
    return current_user


CurrentUser = User  # Simplified type hint for dependency injection
