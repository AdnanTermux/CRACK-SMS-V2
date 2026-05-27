"""Numbers Search and Access System"""
from fastapi import APIRouter, Request, HTTPException, Query
from database import get_db
from auth import verify_token, extract_token
from typing import Optional

router = APIRouter(prefix="/api/search-access", tags=["search-access"])

def _auth(request: Request):
    token = extract_token(request.headers.get('Authorization'))
    return verify_token(token) if token else None

@router.get("/services")
async def search_by_service(
    request: Request,
    q: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1)
):
    _auth(request)
    with get_db() as conn:
        where = "service LIKE ?" if q else "1=1"
        params = [f"%{q}%"] if q else []

        rows = conn.execute(
            f"SELECT service, COUNT(*) as count FROM numbers WHERE {where} GROUP BY service ORDER BY count DESC LIMIT ? OFFSET ?",
            params + [limit, (page - 1) * limit]
        ).fetchall()

        return {"data": [dict(r) for r in rows]}

@router.get("/ranges")
async def search_by_range(
    request: Request,
    q: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1)
):
    _auth(request)
    with get_db() as conn:
        where = "name LIKE ? OR country_name LIKE ?" if q else "1=1"
        params = [f"%{q}%", f"%{q}%"] if q else []

        rows = conn.execute(
            f"SELECT * FROM ranges WHERE {where} ORDER BY created_at DESC LIMIT ? OFFSET ?",
            params + [limit, (page - 1) * limit]
        ).fetchall()

        return {"data": [dict(r) for r in rows]}

@router.get("/top-ranges")
async def top_ranges(request: Request):
    _auth(request)
    with get_db() as conn:
        rows = conn.execute(
            "SELECT name, country_name, total_numbers, total_sms FROM ranges ORDER BY total_sms DESC LIMIT 10"
        ).fetchall()
        return {"data": [dict(r) for r in rows]}
