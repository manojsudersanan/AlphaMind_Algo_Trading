Write-Host "Starting AlphaMind Native Engine..." -ForegroundColor Cyan

# Start Backend
Write-Host "1. Launching FastAPI Backend on Port 8000..." -ForegroundColor Green
Start-Process -NoNewWindow -FilePath "powershell.exe" -ArgumentList "-Command `"cd backend; ..\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000`""

# Start Frontend
Write-Host "2. Launching Next.js Frontend on Port 3000..." -ForegroundColor Green
Start-Process -NoNewWindow -FilePath "powershell.exe" -ArgumentList "-Command `"cd frontend; npm run dev`""

# Wait for frontend to start and open default system browser
Write-Host "3. Waiting for Next.js dev server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
Write-Host "4. Automatically launching default system web browser to dashboard..." -ForegroundColor Green
Start-Process "http://localhost:3000"

# Note: Celery/AI tasks will run concurrently inside FastAPI's internal Event Loop BackgroundTasks in this native setup.

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "AlphaMind Native Stack is running in the background."
Write-Host "Dashboard: http://localhost:3000"
Write-Host "API Swagger: http://localhost:8000/docs"
Write-Host "Press Ctrl+C to terminate this console (Note: Background processes will remain alive. Close their specific terminal windows to stop them)."
Write-Host "==========================================" -ForegroundColor Cyan
