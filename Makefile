.PHONY: dev test test-fe test-be migrate migrate-down seed train build clean logs shell-be shell-db format lint typecheck

dev:
	docker-compose up --build

test: test-be test-fe

test-fe:
	cd frontend && npm run test

test-be:
	docker-compose exec backend pytest

migrate:
	docker-compose exec backend alembic upgrade head

migrate-down:
	docker-compose exec backend alembic downgrade -1

seed:
	docker-compose exec backend python -m scripts.seed_data

train:
	docker-compose exec ai_engine python -m alphamind_ai.scripts.train_initial_model

build:
	docker-compose build

clean:
	docker-compose down -v --remove-orphans
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete

logs:
	docker-compose logs -f

shell-be:
	docker-compose exec backend bash

shell-db:
	docker-compose exec db psql -U alphamind -d alphamind

format:
	docker-compose exec backend black .
	docker-compose exec backend isort .
	cd frontend && npm run format

lint:
	docker-compose exec backend ruff check .
	cd frontend && npm run lint

typecheck:
	docker-compose exec backend mypy .
	cd frontend && npm run typecheck
