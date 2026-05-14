import asyncio
import httpx

async def test_deposit():
    async with httpx.AsyncClient() as client:
        # 1. Login to get token
        login_res = await client.post("http://127.0.0.1:8000/api/v1/auth/login", data={"username": "test@alphamind.com", "password": "password123"})
        if login_res.status_code != 200:
            # Register
            reg_res = await client.post("http://127.0.0.1:8000/api/v1/auth/register", json={"email": "test@alphamind.com", "password": "password123", "name": "Test"})
            login_res = await client.post("http://127.0.0.1:8000/api/v1/auth/login", data={"username": "test@alphamind.com", "password": "password123"})
            
        token = login_res.json()["access_token"]
        
        # 2. Deposit
        dep_res = await client.post("http://127.0.0.1:8000/api/v1/wallet/deposit", json={"amount": 1000, "type": "deposit", "description": "test"}, headers={"Authorization": f"Bearer {token}"})
        print("Deposit:", dep_res.json())
        
        wallet_res = await client.get("http://127.0.0.1:8000/api/v1/wallet/", headers={"Authorization": f"Bearer {token}"})
        print("Wallet:", wallet_res.json())

if __name__ == "__main__":
    asyncio.run(test_deposit())
