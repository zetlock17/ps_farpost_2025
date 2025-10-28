from pathlib import Path
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.ext.declarative import declarative_base

ROOT_DIR = Path(__file__).parent.parent.parent.parent.parent

DB_PATH = ROOT_DIR / "databases" / "dataset.db"

DATABASE_URL = f"sqlite+aiosqlite:///{DB_PATH}"

WEATHER_DB_PATH = ROOT_DIR / "databases" / "weather.db"

WEATHER_DATABASE_URL = f"sqlite+aiosqlite:///{WEATHER_DB_PATH}"

engine = create_async_engine(DATABASE_URL)
async_session_maker = async_sessionmaker(engine, expire_on_commit=False)

weather_engine = create_async_engine(WEATHER_DATABASE_URL)
weather_async_session_maker = async_sessionmaker(weather_engine, expire_on_commit=False)

base = declarative_base()


async def get_session_obj() -> AsyncGenerator[AsyncSession, None]:
    session = async_session_maker()
    async with session.begin():
        yield session
    await session.close()

async def get_session_weather_obj() -> AsyncGenerator[AsyncSession, None]:
    session = weather_async_session_maker()
    async with session.begin():
        yield session
    await session.close()