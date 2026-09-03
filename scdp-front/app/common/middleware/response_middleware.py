from fastapi import Request, Response
from fastapi.responses import JSONResponse
import json
import logging

logger = logging.getLogger(__name__)


async def response_middleware(request: Request, call_next):
    """Middleware to standardize API responses."""
    try:
        response = await call_next(request)
        
        # If the response is already a JSONResponse, don't modify it
        if isinstance(response, JSONResponse):
            return response
        
        # For non-JSON responses, return as-is
        return response
        
    except Exception as e:
        logger.error(f"Middleware error: {e}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": "Internal server error",
                "error": str(e)
            }
        )
