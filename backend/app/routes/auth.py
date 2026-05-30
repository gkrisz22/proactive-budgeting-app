from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.core.security import hash_password, verify_password, hash_token, create_access_token, create_refresh_token, decode_token
from app.schemas.auth import RegisterRequest, LoginRequest, RefreshRequest, TokenResponse, UserResponse, UpdateMeRequest

router = APIRouter()


def _set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    access_max_age = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    refresh_max_age = settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60

    response.set_cookie(
        key=settings.ACCESS_COOKIE_NAME,
        value=access_token,
        max_age=access_max_age,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        domain=settings.COOKIE_DOMAIN,
        path="/",
    )
    response.set_cookie(
        key=settings.REFRESH_COOKIE_NAME,
        value=refresh_token,
        max_age=refresh_max_age,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        domain=settings.COOKIE_DOMAIN,
        path="/",
    )


def _clear_auth_cookies(response: Response) -> None:
    response.delete_cookie(key=settings.ACCESS_COOKIE_NAME, domain=settings.COOKIE_DOMAIN, path="/")
    response.delete_cookie(key=settings.REFRESH_COOKIE_NAME, domain=settings.COOKIE_DOMAIN, path="/")


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Email already registered",
        )

    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        display_name=data.display_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    access_token = create_access_token({"sub": user.id})
    refresh_token = create_refresh_token({"sub": user.id})

    user.refresh_token = hash_token(refresh_token)
    db.commit()

    _set_auth_cookies(response, access_token, refresh_token)

    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(data: RefreshRequest, request: Request, response: Response, db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired refresh token",
    )

    incoming_refresh_token = data.refresh_token or request.cookies.get(settings.REFRESH_COOKIE_NAME)
    if not incoming_refresh_token:
        raise credentials_exception

    payload = decode_token(incoming_refresh_token)
    if payload is None or payload.get("type") != "refresh":
        raise credentials_exception

    user_id: str = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if user is None or user.refresh_token != hash_token(incoming_refresh_token):
        raise credentials_exception

    new_access_token = create_access_token({"sub": user.id})
    new_refresh_token = create_refresh_token({"sub": user.id})

    user.refresh_token = hash_token(new_refresh_token)
    db.commit()

    _set_auth_cookies(response, new_access_token, new_refresh_token)

    return TokenResponse(access_token=new_access_token, refresh_token=new_refresh_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response, request: Request, db: Session = Depends(get_db)):
    # Invalidate the stored refresh token so the old cookie can never be reused.
    incoming = request.cookies.get(settings.REFRESH_COOKIE_NAME)
    if incoming:
        payload = decode_token(incoming)
        if payload:
            user = db.query(User).filter(User.id == payload.get("sub")).first()
            if user:
                user.refresh_token = None
                db.commit()
    _clear_auth_cookies(response)
    # Return None (not a new Response object) so FastAPI applies the
    # injected `response` headers (delete-cookie) to the final 204 reply.


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserResponse)
def update_me(
    data: UpdateMeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if data.display_name is not None:
        current_user.display_name = data.display_name
        db.commit()
        db.refresh(current_user)
    return current_user
