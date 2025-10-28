from api.api import api_controller
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.settings import WEB_URL

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[WEB_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_controller, prefix="/api")
