module.exports = {
  apps: [
    {
      name: "alphamind-backend",
      cwd: "./backend",
      interpreter: "none",
      script: "../.venv/Scripts/python.exe",
      args: "-m uvicorn app.main:app --port 8000",
      watch: false,
      env: {
        APP_ENV: "development",
      }
    },
    {
      name: "alphamind-frontend",
      cwd: "./frontend",
      interpreter: "none",
      script: "npm.cmd",
      args: "run dev",
      watch: false,
      env: {
        NODE_ENV: "development"
      }
    }
  ]
};
