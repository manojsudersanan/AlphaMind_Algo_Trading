import httpx
import asyncio

async def run():
    async with httpx.AsyncClient() as c:
        r1 = await c.post('http://127.0.0.1:8000/api/v1/auth/login', data={'username':'test@alphamind.com', 'password':'password123'})
        print('Login:', r1.status_code)
        
        if r1.status_code != 200:
            print(r1.text)
            return

        t = r1.json().get('access_token')
        print('Token:', t)
        
        r2 = await c.get('http://127.0.0.1:8000/api/v1/wallet/', headers={'Authorization': f'Bearer {t}'})
        print('Wallet:', r2.status_code, r2.text[:200])
        
        r3 = await c.get('http://127.0.0.1:8000/api/v1/trading/config', headers={'Authorization': f'Bearer {t}'})
        print('Trading:', r3.status_code, r3.text[:200])

asyncio.run(run())
