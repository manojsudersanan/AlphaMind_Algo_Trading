Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "AlphaMind Automated Setup & Run Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Setup Backend Environment
Write-Host "`n[1/5] Setting up Backend Virtual Environment..." -ForegroundColor Yellow
if (!(Test-Path -Path ".venv")) {
    python -m venv .venv
}
.\.venv\Scripts\python.exe -m pip install -U pip
.\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt

# 2. Initialize Database
Write-Host "`n[2/5] Initializing Database..." -ForegroundColor Yellow
.\.venv\Scripts\python.exe backend\init_db.py

# 3. Setup Frontend Environment
Write-Host "`n[3/5] Installing Frontend Dependencies..." -ForegroundColor Yellow
cd frontend
npm install
cd ..

# 4. Start Services
Write-Host "`n[4/5] Launching Background Services..." -ForegroundColor Yellow
Write-Host "-> Starting FastAPI Backend on Port 8000..." -ForegroundColor Green
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd backend; ..\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000"

Write-Host "-> Starting Next.js Frontend on Port 3000..." -ForegroundColor Green
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "`n[5/5] Success!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "AlphaMind Native Stack is now running."
Write-Host "Dashboard: http://localhost:3000"
Write-Host "API Swagger: http://localhost:8000/docs"
Write-Host "==========================================" -ForegroundColor Cyan
