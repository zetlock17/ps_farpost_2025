from functools import wraps
from http.client import HTTPException

from fastapi import logger

from backend.core.common.common_exceptions import (
    IntervalServerErrorHttpException,
)


def exception_handler(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except HTTPException as e:
            logger.error(
                f"Произошла ошибка в эндпоинте {func.__name__}: {e}",
                exc_info=True,
            )
            raise e
        except Exception as e:
            logger.error(
                f"Произошла ошибка в эндпоинте {func.__name__}: {e}",
                exc_info=True,
            )
            raise IntervalServerErrorHttpException(msg=str(e))

    return wrapper
