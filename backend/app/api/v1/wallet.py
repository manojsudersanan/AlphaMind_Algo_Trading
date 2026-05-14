from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from decimal import Decimal

from app.api.dependencies import get_db, get_current_user
from app.repositories.wallet_repo import WalletRepository
from app.schemas.wallet import WalletResponse, TransactionCreate, TransactionResponse
from app.models.user import User

router = APIRouter()

@router.get("/debug")
async def debug_get_wallet(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    try:
        wallet_repo = WalletRepository()
        wallet = await wallet_repo.get_by_user_id(db, current_user.id)
        if not wallet:
            wallet = await wallet_repo.create(db, {"user_id": current_user.id})
        return {"id": str(wallet.id), "balance": float(getattr(wallet, "balance", 0))}
    except Exception as e:
        import traceback
        return {"error_detail": str(e), "trace": traceback.format_exc()}

@router.get("/", response_model=WalletResponse)
async def get_wallet(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Get current user's wallet balances."""
    try:
        wallet_repo = WalletRepository()
        wallet = await wallet_repo.get_by_user_id(db, current_user.id)
        if not wallet:
            wallet = await wallet_repo.create(db, {"user_id": current_user.id})
        return wallet
    except Exception as e:
        import traceback
        return {"error_detail": str(e), "trace": traceback.format_exc()}

@router.post("/deposit")
async def deposit_funds(
    transaction_in: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Simulate depositing funds into the wallet via a mock payment gateway."""
    try:
        if transaction_in.amount <= 0:
            raise HTTPException(status_code=400, detail="Deposit amount must be positive")
        
        wallet_repo = WalletRepository()
        wallet = await wallet_repo.get_by_user_id(db, current_user.id)
        if not wallet:
            wallet = await wallet_repo.create(db, {"user_id": current_user.id})
            
        transaction_in.type = "deposit"
        from app.models.wallet import TransactionType
        transaction = await wallet_repo.add_transaction(db, wallet.id, transaction_in.amount, TransactionType.DEPOSIT, transaction_in.description or "")
        await wallet_repo.update_balance_atomic(db, wallet.id, transaction_in.amount)
        
        return {"status": "success", "amount": float(transaction_in.amount), "type": "deposit"}
    except Exception as e:
        import traceback
        return {"error_detail": str(e), "trace": traceback.format_exc()}

@router.post("/withdraw")
async def withdraw_funds(
    transaction_in: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Withdraw funds from the withdrawable balance."""
    if transaction_in.amount <= 0:
        raise HTTPException(status_code=400, detail="Withdrawal amount must be positive")
        
    wallet_repo = WalletRepository()
    wallet = await wallet_repo.get_by_user_id(db, current_user.id)
    
    # Wait, the native base model doesn't have withdrawable_balance yet, we use balance
    balance = wallet.balance if wallet else Decimal("0.0")
    if not wallet or balance < transaction_in.amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Insufficient withdrawable balance"
        )
        
    transaction_in.type = "withdrawal"
    from app.models.wallet import TransactionType
    transaction = await wallet_repo.add_transaction(db, wallet.id, transaction_in.amount, TransactionType.WITHDRAWAL, transaction_in.description or "")
    await wallet_repo.update_balance_atomic(db, wallet.id, -transaction_in.amount)
    
    return {"status": "success", "amount": transaction_in.amount, "type": "withdrawal"}

@router.get("/transactions", response_model=List[TransactionResponse])
async def get_transactions(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Get transaction history."""
    wallet_repo = WalletRepository()
    wallet = await wallet_repo.get_by_user_id(db, current_user.id)
    if not wallet:
        return []
        
    transactions = await wallet_repo.get_transactions(db, wallet.id, limit)
    return transactions
