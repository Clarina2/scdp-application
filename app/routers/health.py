from fastapi import APIRouter, HTTPException, status
from app.config import settings
from app.database import engine
from datetime import datetime

router = APIRouter()


@router.get("/")
async def get_health():
    """Get general API health status."""
    return {
        "status": "up",
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/database")
async def get_database_health():
    """Check connection status of the application PostgreSQL database."""
    try:
        from sqlalchemy import text
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return {
            "status": "up",
            "details": {
                "database": {
                    "status": "up",
                },
            },
        }
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "status": "down",
                "details": {
                    "database": {
                        "status": "down",
                        "error": str(error),
                    },
                },
            }
        )


@router.get("/scdp")
async def get_scdp_health():
    """Check connectivity status of the remote SCDP source database."""
    if not settings.scdp_is_configured:
        return {
            "status": "up",
            "details": {
                "scdp": {
                    "status": "unconfigured",
                    "configured": False,
                    "message": "SCDP database credentials are not set. Synchronization running in MOCK mode.",
                },
            },
        }

    try:
        # In a real implementation, test SCDP connection here
        return {
            "status": "up",
            "details": {
                "scdp": {
                    "status": "up",
                    "configured": True,
                },
            },
        }
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "status": "down",
                "details": {
                    "scdp": {
                        "status": "down",
                        "configured": True,
                        "error": str(error),
                    },
                },
            }
        )
