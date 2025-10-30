import logging
from functools import wraps
from http.client import HTTPException

from core.common.common_exceptions import IntervalServerErrorHttpException

logger = logging.getLogger("uvicorn")


def exception_handler(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except HTTPException as e:
            logger.error(
                f"Произошла HTTPException в эндпоинте {func.__name__}: {e}",
                exc_info=True,
            )
            raise e
        except Exception as e:
            logger.error(
                f"Произошла общая ошибка в эндпоинте {func.__name__}: {e}",
                exc_info=True,
            )
            raise IntervalServerErrorHttpException(msg=str(e))

    return wrapper
