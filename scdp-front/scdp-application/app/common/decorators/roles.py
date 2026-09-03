from fastapi import HTTPException, status
from functools import wraps
from typing import List, Callable
from app.models.user import User, Role


def require_roles(allowed_roles: List[Role]):
    """Decorator to require specific user roles."""
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, current_user: User, **kwargs):
            if current_user.role not in allowed_roles:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Insufficient permissions"
                )
            return await func(*args, current_user=current_user, **kwargs)
        return wrapper
    return decorator
