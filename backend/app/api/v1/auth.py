from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any

from app.api.dependencies import get_db, get_current_user
from app.core.security import verify_password, get_password_hash, create_access_token
from app.repositories.user_repo import UserRepository
from app.schemas.user import UserCreate, UserResponse, Token, UserUpdate
from app.models.user import User
from app.core.config import settings

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register(
    user_in: UserCreate, db: AsyncSession = Depends(get_db)
) -> Any:
    """Create a new user."""
    user_repo = UserRepository()
    user = await user_repo.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    
    hashed_password = get_password_hash(user_in.password)
    user = await user_repo.create(db, {
        "email": user_in.email, 
        "hashed_password": hashed_password, 
        "full_name": user_in.full_name
    })
    return user

@router.post("/login", response_model=Token)
async def login(
    db: AsyncSession = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends(),
) -> Any:
    """OAuth2 compatible token login, get an access token for future requests."""
    user_repo = UserRepository()
    user = await user_repo.get_by_email(db, email=form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password",
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
        
    return {
        "access_token": create_access_token(user.id),
        "token_type": "bearer",
    }

@router.get("/me", response_model=UserResponse)
async def read_users_me(
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get current user."""
    return current_user

@router.put("/update", response_model=UserResponse)
async def update_user_profile(
    user_in: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Update current user credentials."""
    user_repo = UserRepository()
    update_data = {}
    
    if user_in.email and user_in.email != current_user.email:
        existing_user = await user_repo.get_by_email(db, email=user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="This email/username is already taken.",
            )
        update_data["email"] = user_in.email
        
    if user_in.password:
        if not user_in.current_password or not verify_password(user_in.current_password, current_user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect current password provided.",
            )
        update_data["hashed_password"] = get_password_hash(user_in.password)
        
    if not update_data:
        return current_user
        
    updated_user = await user_repo.update(db, current_user.id, update_data)
    return updated_user

