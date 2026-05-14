Write-Output "Initializing AlphaMind Native Environment..."

Write-Output "1. Creating Python Virtual Environment..."
python -m venv .venv

Write-Output "2. Installing Backend Dependencies..."
.\.venv\Scripts\python.exe -m pip install -U pip
.\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt

Write-Output "3. Initializing Next.js 14 Frontend..."
if (!(Test-Path -Path "frontend")) {
    npx.cmd -y create-next-app@14 frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
} else {
    Write-Output "Frontend directory already exists. Skipping scaffolding."
}

Write-Output "Setup Complete!"
