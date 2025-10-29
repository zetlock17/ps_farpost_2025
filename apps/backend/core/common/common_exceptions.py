from fastapi import HTTPException


class IntervalServerErrorHttpException(HTTPException):
    def __init__(
        self,
        msg: str = "",
    ):
        if msg in [None, ""]:
            msg = "internal server error"
        super().__init__(status_code=500, detail=msg)

class NotFoundHttpException(HTTPException):
    def __init__(
        self,
        name,
    ):
        message = f'объект "{name}" не найден'
        super().__init__(status_code=404, detail=message)
