"""SIGMAPANEL - SMS OTP Management System v3"""
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
import os

from database import init_db
from routes.auth import router as auth_router
from routes.webhook import router as webhook_router
from routes.sms import router as sms_router
from routes.numbers import router as numbers_router
from routes.ranges import router as ranges_router
from routes.users import router as users_router
from routes.dashboard import router as dashboard_router
from routes.settings import router as settings_router
from routes.providers import router as providers_router
from routes.transactions import router as transactions_router
from routes.numbers_ext import router as numbers_ext_router
from routes.api_management import router as api_management_router
from routes.notifications import router as notifications_router
from routes.search_access import router as search_access_router

from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
import time

app = FastAPI(title="SIGMAPANEL", version="3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response

app.add_middleware(SecurityHeadersMiddleware)

@app.on_event("startup")
async def startup():
    init_db()
    try:
        from smpp_service import smpp_manager
        smpp_manager.start_all()
    except Exception as e:
        print(f"Failed to start SMPP manager: {e}")

app.include_router(auth_router)
app.include_router(webhook_router)
app.include_router(sms_router)
app.include_router(numbers_router)
app.include_router(ranges_router)
app.include_router(users_router)
app.include_router(dashboard_router)
app.include_router(settings_router)
app.include_router(providers_router)
app.include_router(transactions_router)
app.include_router(numbers_ext_router)
app.include_router(api_management_router)
app.include_router(notifications_router)
app.include_router(search_access_router)

static_dir = os.path.join(os.path.dirname(__file__), "static")
app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/{path:path}")
async def spa(path: str):
    if path.startswith("api/"):
        return JSONResponse(status_code=404, content={"detail": "Endpoint not found"})
    return FileResponse(os.path.join(static_dir, "index.html"))
