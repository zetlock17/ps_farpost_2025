from fastapi import HTTPException


class IntervalServerErrorHttpException(HTTPException):
    def __init__(
        self,
        msg: str = "",
    ):
        if msg in [None, ""]:
            msg = "internal server error"
        super().__init__(status_code=500, detail=msg)
