# AlphaMind

AlphaMind is an AI-first, self-reinforcing algorithmic trading platform designed to autonomously execute, learn, and compound returns.

## Architecture & Infrastructure
The project is organized efficiently via `docker-compose.yml`, deploying services including:
* Next.js Frontend
* FastAPI Backend
* PyTorch AI Engine
* Managed backing services: TimescaleDB, Redis, Kafka, MLflow, MinIO, Grafana, and Prometheus.

## Setup Instructions

1.  Copy `.env.example` to `.env.local`:
    ```bash
    cp .env.example .env.local
    ```
2.  Populate your environment variables in `.env.local`. Ensure your broker keys and AWS keys are validated.
3.  Start the development environment:
    ```bash
    make dev
    ```
4.  Run database migrations (on first start):
    ```bash
    make migrate
    ```

## Available Makefile Commands
* `make dev`: Start all services in watch mode
* `make test`: Run all tests (frontend + backend)
* `make migrate`: Run database migrations
* `make logs`: Tail all service logs
* `make clean`: Remove containers and cache
* `make build`: Build docker images

## Branch Protection Rules
For production reliability:
- Require pull request reviews before merging to `main`.
- Require status checks (CI) and test suite to pass before merging.
- No direct commits to `main` branch.
