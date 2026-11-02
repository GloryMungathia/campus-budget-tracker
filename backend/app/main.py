from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text

from app.config import get_settings
from app.database import Base, engine
from app.routers import auth, budgets, transactions


def add_missing_columns(bind) -> None:
    columns = {c["name"] for c in inspect(bind).get_columns("users")}
    if "avatar" not in columns:
        with bind.begin() as conn:
            conn.execute(text("ALTER TABLE users ADD COLUMN avatar TEXT"))


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    add_missing_columns(engine)
    yield


app = FastAPI(title="TumaTrack API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_settings().origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(auth.router)
app.include_router(transactions.router)
app.include_router(budgets.router)


@app.get("/api/health", tags=["health"])
def health():
    return {"status": "ok"}
