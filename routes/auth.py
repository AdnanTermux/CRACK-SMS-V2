"""Authentication routes - Login and Me"""
from datetime import datetime, timedelta
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from database import get_db
from auth import hash_password, verify_password, generate_token, verify_token, extract_token, generate_id

router = APIRouter(prefix="/api/auth", tags=["auth"])

import os
import shutil
from fastapi import File, UploadFile, Form

class LoginRequest(BaseModel):
    username: str
    password: str

MAX_FAILED_ATTEMPTS = 5
LOCKOUT_MINUTES = 15

@router.post("/signup")
async def signup(
    username: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    phone: str = Form(None),
    country: str = Form(None),
    profession: str = Form(None),
    paymentMethod: str = Form(None),
    paymentDetail: str = Form(None),
    proof: UploadFile = File(...)
):
    try:
        req_id = generate_id()
        os.makedirs("uploads/proofs", exist_ok=True)
        proof_path = f"uploads/proofs/{req_id}_{proof.filename}"

        with open(proof_path, "wb") as buffer:
            shutil.copyfileobj(proof.file, buffer)

        hashed_pw = hash_password(password)

        with get_db() as conn:
            # Check existing
            existing = conn.execute("SELECT id FROM users WHERE username = ? OR email = ?", (username, email)).fetchone()
            if existing:
                raise HTTPException(status_code=400, detail="Username or email already exists")

            conn.execute(
                """INSERT INTO registration_requests
                   (id, username, email, password, phone, country, profession, payment_method, payment_detail, proof_path)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (req_id, username, email, hashed_pw, phone, country, profession, paymentMethod, paymentDetail, proof_path)
            )

        return {"status": "success", "message": "Registration request submitted", "requestId": req_id}
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/login")
async def login(request: Request, body: LoginRequest):
    try:
        with get_db() as conn:
            # Seed admin user if no users exist
            user_count = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
            if user_count == 0:
                admin_pw = hash_password('admin123')
                admin_id = generate_id()
                conn.execute(
                    """INSERT INTO users (id, username, password, role, status, full_name)
                       VALUES (?, ?, ?, 'admin', 'active', 'Administrator')""",
                    (admin_id, 'admin', admin_pw)
                )

            # Find user
            user = conn.execute(
                "SELECT * FROM users WHERE username = ?",
                (body.username.strip().lower(),)
            ).fetchone()

            if not user:
                raise HTTPException(status_code=401, detail="Invalid username or password")

            # Check lockout
            if user['locked_until']:
                locked_until = datetime.fromisoformat(user['locked_until'])
                if locked_until > datetime.utcnow():
                    remaining_min = int((locked_until - datetime.utcnow()).total_seconds() / 60) + 1
                    raise HTTPException(
                        status_code=423,
                        detail=f"Account is locked. Try again in {remaining_min} minutes."
                    )

            # Check blocked
            if user['status'] == 'blocked':
                raise HTTPException(status_code=403, detail="Account is blocked. Contact administrator.")

            # Verify password
            if not verify_password(body.password, user['password']):
                new_failed = user['failed_login_attempts'] + 1
                locked_until = None
                if new_failed >= MAX_FAILED_ATTEMPTS:
                    locked_until = (datetime.utcnow() + timedelta(minutes=LOCKOUT_MINUTES)).isoformat()

                conn.execute(
                    "UPDATE users SET failed_login_attempts = ?, locked_until = ? WHERE id = ?",
                    (new_failed, locked_until, user['id'])
                )
                raise HTTPException(status_code=401, detail="Invalid username or password")

            # Reset failed attempts
            now = datetime.utcnow().isoformat()
            conn.execute(
                "UPDATE users SET failed_login_attempts = 0, locked_until = NULL, last_login = ? WHERE id = ?",
                (now, user['id'])
            )

            # Generate token
            token = generate_token(user['id'], user['username'], user['role'])

            user_dict = dict(user)
            del user_dict['password']

            return JSONResponse(content={"token": token, "user": user_dict})

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/me")
async def get_me(request: Request):
    auth_header = request.headers.get('Authorization')
    token = extract_token(auth_header)
    if not token:
        raise HTTPException(status_code=401, detail="Authentication required")

    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    with get_db() as conn:
        user = conn.execute(
            """SELECT id, username, email, role, status, full_name, balance, credit_limit,
                      phone, country, timezone, language, parent_id, last_login, created_at, updated_at
               FROM users WHERE id = ?""",
            (payload['userId'],)
        ).fetchone()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if user['status'] == 'blocked':
            raise HTTPException(status_code=403, detail="Account is blocked")

        return {"user": dict(user)}
