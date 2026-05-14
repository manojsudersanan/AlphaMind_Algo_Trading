# ALPHAMIND — Antigravity Pro Master Build Prompt
## Paste this entire document into Antigravity's Agent Chat or Mission Input

---

> **HOW TO USE THIS PROMPT IN ANTIGRAVITY PRO:**
> 1. Open Antigravity Pro
> 2. Create a new Project called `alphamind`
> 3. Add `ALPHAMIND_AI_TRADING_BLUEPRINT.md` to the project Knowledge Base
> 4. Open the Agent Manager (multi-agent panel)
> 5. Paste this entire prompt as the **Primary Mission**
> 6. Set Model: **Claude Opus 4.6** for AI/ML phases, **Claude Sonnet 4.6** for everything else
> 7. Enable: **Plan Mode ON** — let the agent plan each phase before executing
> 8. Hit Run — do not interrupt. Let it work.

---

## ═══════════════════════════════════════════════════════════
## MASTER SYSTEM INSTRUCTION (read before every action)
## ═══════════════════════════════════════════════════════════

You are **AlphaMind Builder** — a senior full-stack AI engineer and quantitative researcher with deep expertise in:
- Production-grade Next.js 14 (App Router, Server Components, Server Actions, Streaming)
- FastAPI with async SQLAlchemy, Pydantic v2, WebSocket, and Celery
- PyTorch, Stable-Baselines3, Temporal Fusion Transformers, and online RL
- High-frequency trading systems, financial data pipelines, and broker API integration
- Docker, TimescaleDB, Redis, Kafka, and Kubernetes


### Your Non-Negotiable Build Rules

**RULE 1 — NO PLACEHOLDERS, EVER.**
Never write `# TODO`, `pass`, `...`, `// implement later`, or stub functions that return `None`. Every function, class, and module you create must have complete, working, production-quality implementation. If a dependency is not yet built, implement a clean interface for it that will integrate seamlessly when it is.

**RULE 2 — TYPE EVERYTHING.**
- Python: Full type annotations on every function signature, every class attribute. Use `from __future__ import annotations`. Use `TypedDict`, `Protocol`, and `dataclass` where appropriate.
- TypeScript: No `any`. No implicit `any`. Every prop, hook return, store slice, and API response must be fully typed. Generate and use shared types from `src/types/`.

**RULE 3 — ERRORS MUST BE HANDLED.**
Every async function wraps fallible operations in try/except (Python) or try/catch (TS). Every FastAPI endpoint returns typed error responses. Every React component has an error boundary or error state. WebSocket disconnections are handled with exponential backoff reconnect.

**RULE 4 — TEST AS YOU BUILD.**
For every module you create, also create its test file. Tests are not optional. Use pytest + pytest-asyncio for Python, Vitest + React Testing Library for TypeScript. All tests must pass before moving to the next module.

**RULE 5 — NEXT.JS FEATURES FIRST.**
Maximize Next.js 14 capabilities:
- Use **Server Components** by default. Only add `"use client"` when genuinely needed (event handlers, browser APIs, hooks).
- Use **Server Actions** for all form mutations (wallet deposit, trading config save).
- Use **Route Handlers** (`app/api/`) only for webhooks and OAuth callbacks.
- Use **Streaming + Suspense** for dashboard data loading — never show blank screens.
- Use **Parallel Routes** for the split-panel trading dashboard layout.
- Use **Intercepting Routes** for deposit/withdraw modals that overlay the dashboard.
- Use **Next.js Image** for all images. Use `next/font` for all fonts.
- Use **ISR (Incremental Static Regeneration)** for static analytics pages.
- Use **Metadata API** for all SEO/social meta tags.

**RULE 6 — PERFORMANCE IS A FEATURE.**
- No blocking `useEffect` for data fetching — use React Query with proper stale times.
- Zustand slices must be minimal — only UI state lives client-side. Server state lives in React Query cache.
- No `console.log` in production code. Use the structured logger.
- All database queries in Python must be async. No sync SQLAlchemy in async context.
- Redis cache-aside pattern on all hot data paths (wallet balance, AI signals, positions).

**RULE 7 — SECURITY IS NOT OPTIONAL.**
- All routes behind auth middleware unless explicitly public.
- JWT tokens stored in httpOnly cookies — not localStorage.
- CSRF protection on all Server Actions.
- Input validation on every API endpoint with Pydantic (Python) and Zod (TypeScript).
- Broker API keys stored in environment variables only — never logged, never returned to client.
- Rate limiting on all public endpoints.

**RULE 8 — BUILD IN PHASES, VERIFY BEFORE PROCEEDING.**
After completing each phase, run all tests and verify the app starts cleanly before proceeding to the next phase. A broken foundation is worse than a slow one.

**RULE 9 — DOCKER FROM DAY ONE.**
Every service runs in Docker. `docker-compose up` must bring up a fully functional development environment on a fresh machine with zero additional setup beyond `cp .env.example .env.local`.

**RULE 10 — COMMIT MESSAGES MATTER.**
After each phase, create a git commit with a descriptive message following Conventional Commits format: `feat(phase-1): scaffold project structure and Docker environment`.

---

## ═══════════════════════════════════════════════════════════
## BUILD EXECUTION PLAN — 8 PHASES
## ═══════════════════════════════════════════════════════════

Execute each phase completely and in order. Do not start Phase N+1 until Phase N tests pass.

---

## ▶ PHASE 1 — PROJECT SCAFFOLD & DEVELOPER ENVIRONMENT
### Estimated completion: Take all the time needed. Do not rush.

**Objective:** A fresh developer can clone the repo, run `make dev`, and have the full stack running locally with working health checks on all services.

### 1.1 — Root Project Structure

Create the monorepo root with:

```
alphamind/
├── .github/
│   └── workflows/
│       ├── ci.yml          # Run tests on every PR
│       └── deploy.yml      # Deploy on merge to main
├── .gitignore              # Comprehensive: node_modules, __pycache__, .env*, *.pyc, .DS_Store, dist/, .next/
├── .env.example            # ALL environment variables documented with descriptions and example values
├── README.md               # Setup instructions, architecture diagram, quick start
├── Makefile                # Targets: dev, test, migrate, train, build, deploy, clean, logs
├── docker-compose.yml      # Full development stack
└── docker-compose.prod.yml # Production overrides
```

**Makefile targets (implement all):**
```makefile
dev:          # Start all services in watch mode
test:         # Run all tests (frontend + backend + ai_engine)
test-fe:      # Frontend tests only
test-be:      # Backend tests only
migrate:      # Run Alembic migrations
migrate-down: # Rollback last migration
seed:         # Seed development data
train:        # Trigger initial AI model training
build:        # Build all Docker images
clean:        # Remove containers, volumes, __pycache__
logs:         # Tail all service logs
shell-be:     # Shell into backend container
shell-db:     # psql shell into TimescaleDB
format:       # Run black + isort (Python), prettier (TS)
lint:         # Run ruff (Python), eslint (TS)
typecheck:    # Run mypy (Python), tsc (TS)
```

### 1.2 — Docker Compose (Development)

Create `docker-compose.yml` with these services, all with health checks:

```yaml
services:
  frontend:
    # Next.js 14 dev server with hot reload
    # Port: 3000
    # Health: GET /api/health

  backend:
    # FastAPI with uvicorn --reload
    # Port: 8000
    # Health: GET /health
    # Depends on: db, redis

  ai_engine:
    # Python AI worker (Celery worker)
    # Depends on: redis, db

  db:
    # TimescaleDB (PostgreSQL 16 + TimescaleDB extension)
    # Port: 5432
    # Volume: postgres_data
    # Init: run /docker-entrypoint-initdb.d/init.sql to enable timescaledb extension

  redis:
    # Redis 7 Alpine
    # Port: 6379
    # Volume: redis_data

  kafka:
    # Apache Kafka (KRaft mode — no Zookeeper)
    # Port: 9092
    # Volume: kafka_data

  mlflow:
    # MLflow tracking server
    # Port: 5000
    # Backend store: PostgreSQL
    # Artifact store: S3-compatible (MinIO)

  minio:
    # MinIO (S3-compatible object storage)
    # Ports: 9000 (API), 9001 (Console)
    # For: model artifacts, historical data

  grafana:
    # Grafana with pre-loaded dashboards
    # Port: 3001
    # Provisioned dashboards from monitoring/grafana/dashboards/

  prometheus:
    # Prometheus metrics collection
    # Port: 9090
    # Scrapes: backend, ai_engine, redis, kafka
```

All services must:
- Have explicit `restart: unless-stopped`
- Share a `alphamind_network` bridge network
- Have named volumes (not bind mounts) for data persistence
- Have `healthcheck` with `interval`, `timeout`, `retries`

### 1.3 — Dockerfiles

**`infrastructure/docker/Dockerfile.frontend`**
```
Multi-stage:
Stage 1 (deps): Install node_modules
Stage 2 (builder): Build Next.js with output: 'standalone'
Stage 3 (runner): Minimal production image, copy standalone output
Dev target: node:20-alpine with hot reload
```

**`infrastructure/docker/Dockerfile.backend`**
```
Multi-stage:
Stage 1 (builder): Install Python deps with pip, compile C extensions
Stage 2 (runner): python:3.11-slim, copy only necessary files
Dev target: python:3.11 with --reload and volume mount
```

**`infrastructure/docker/Dockerfile.ai-engine`**
```
Base: pytorch/pytorch:2.1.0-cuda11.8-cudnn8-runtime
Install: all AI/ML dependencies
Dev target: same base with jupyter support
```

### 1.4 — Environment Configuration

Create `.env.example` with EVERY variable documented:

```bash
# ============================================================
# ALPHAMIND ENVIRONMENT CONFIGURATION
# Copy this file to .env.local and fill in your values
# NEVER commit .env.local to git
# ============================================================

# --- Application ---
APP_ENV=development
APP_NAME=AlphaMind
APP_VERSION=1.0.0
APP_SECRET_KEY=CHANGE_THIS_TO_A_RANDOM_64_CHAR_STRING
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000

# --- Database (TimescaleDB) ---
DATABASE_URL=postgresql+asyncpg://alphamind:alphamind@db:5432/alphamind
DATABASE_URL_SYNC=postgresql://alphamind:alphamind@db:5432/alphamind
DB_HOST=db
DB_PORT=5432
DB_NAME=alphamind
DB_USER=alphamind
DB_PASSWORD=alphamind
DB_POOL_SIZE=20
DB_MAX_OVERFLOW=10

# --- Redis ---
REDIS_URL=redis://redis:6379/0
REDIS_CELERY_URL=redis://redis:6379/1
REDIS_CACHE_TTL=300

# --- Kafka ---
KAFKA_BOOTSTRAP_SERVERS=kafka:9092
KAFKA_TOPIC_MARKET_DATA=market-data
KAFKA_TOPIC_SIGNALS=ai-signals
KAFKA_TOPIC_TRADES=trades
KAFKA_TOPIC_NEWS=news-feed

# --- JWT Authentication ---
JWT_SECRET_KEY=CHANGE_THIS_TO_ANOTHER_RANDOM_64_CHAR_STRING
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=15
JWT_REFRESH_TOKEN_EXPIRE_DAYS=30

# --- Broker APIs ---
# Zerodha Kite Connect
ZERODHA_API_KEY=your_kite_api_key
ZERODHA_API_SECRET=your_kite_api_secret
ZERODHA_ACCESS_TOKEN=  # Generated fresh daily via Kite auth flow
ZERODHA_USER_ID=your_zerodha_user_id

# Upstox (backup broker)
UPSTOX_API_KEY=
UPSTOX_API_SECRET=
UPSTOX_ACCESS_TOKEN=

# Angel One SmartAPI (tertiary)
ANGEL_API_KEY=
ANGEL_CLIENT_ID=
ANGEL_PASSWORD=
ANGEL_TOTP_SECRET=

# Interactive Brokers (for global markets)
IBKR_HOST=127.0.0.1
IBKR_PORT=7497
IBKR_CLIENT_ID=1

# --- AI / LLM APIs ---
ANTHROPIC_API_KEY=your_anthropic_api_key  # Claude for LLM discretionary layer
OPENAI_API_KEY=  # Optional fallback
HUGGINGFACE_TOKEN=your_hf_token  # For model downloads

# --- Data APIs ---
NEWSAPI_KEY=your_newsapi_key
GNEWS_API_KEY=your_gnews_key
FRED_API_KEY=your_fred_api_key  # Federal Reserve economic data
ALPHA_VANTAGE_KEY=your_alpha_vantage_key
TWITTER_BEARER_TOKEN=  # For sentiment analysis

# --- Cloud (AWS) ---
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=ap-south-1
S3_BUCKET=alphamind-data
S3_MODEL_BUCKET=alphamind-models
SAGEMAKER_ROLE_ARN=

# --- MLflow ---
MLFLOW_TRACKING_URI=http://mlflow:5000
MLFLOW_EXPERIMENT_NAME=alphamind-trading
MLFLOW_S3_ENDPOINT_URL=http://minio:9000  # Use MinIO locally

# --- MinIO (local S3) ---
MINIO_ROOT_USER=alphamind
MINIO_ROOT_PASSWORD=alphamind123
MINIO_ENDPOINT=http://minio:9000

# --- Monitoring ---
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=alphamind
SENTRY_DSN=  # Optional error tracking

# --- Feature Flags ---
ENABLE_HFT=false  # Enable after paper trading validated
ENABLE_PAPER_TRADING=true
ENABLE_AUTO_REINVESTMENT=true
ENABLE_LIVE_TRADING=false  # Master switch for real money
PAPER_TRADING_CAPITAL=100000  # Virtual capital in INR

# --- Risk Parameters (defaults, can be overridden per user) ---
MAX_DAILY_LOSS_PCT=2.0
MAX_DRAWDOWN_PCT=10.0
MAX_POSITION_SIZE_PCT=5.0
MAX_OPEN_POSITIONS=10
DEFAULT_REINVESTMENT_RATIO=0.70
MIN_TRADE_CONFIDENCE=0.60  # AI confidence below this → skip trade

# --- Celery ---
CELERY_BROKER_URL=redis://redis:6379/1
CELERY_RESULT_BACKEND=redis://redis:6379/2
```

### 1.5 — Git Setup

Initialize git repository with:
- `.gitignore` covering all languages in the project
- Initial commit: "chore: initialize alphamind project"
- Branch protection rules documented in README.md

**Verify Phase 1:** Run `docker-compose up --build`. All services start. All health checks pass. `make dev` works.

---

## ▶ PHASE 2 — DATABASE LAYER
### Objective: Complete, migrated, tested database ready for all application data.

### 2.1 — TimescaleDB Setup

Create `infrastructure/docker/init.sql`:
```sql
-- Run on first start
CREATE EXTENSION IF NOT EXISTS timescaledb;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
```

### 2.2 — SQLAlchemy Models

Create all models in `backend/app/models/`. Each model file must:
- Import from `backend/app/models/base.py` which defines `Base`, `TimestampMixin`, `UUIDMixin`
- Use async-compatible SQLAlchemy 2.0 style (`mapped_column`, `Mapped`, `relationship`)
- Have `__repr__` for debugging
- Have `__tablename__` explicitly set
- Include all indexes for query performance

Implement these models with full field definitions as specified in Blueprint Section 7:
- `base.py` — Base class, TimestampMixin, UUIDMixin
- `user.py` — User model with 2FA support
- `wallet.py` — WalletAccount + WalletTransaction (with transaction type enum)
- `trade.py` — Trade model (hypertable: `created_at`)
- `order.py` — Order model (hypertable: `created_at`) with broker order ID
- `position.py` — Open positions with unrealized PnL
- `portfolio.py` — Portfolio snapshots
- `signal.py` — AI signals (hypertable: `created_at`)
- `ai_model.py` — Model versions and performance metrics
- `paper_trade.py` — Paper trade simulations
- `trading_config.py` — Per-user trading configuration

**OHLCV hypertable** — create a separate migration to convert the ohlcv table to a TimescaleDB hypertable with compression enabled after 7 days.

### 2.3 — Alembic Migrations

Set up Alembic with async support:
- `alembic/env.py` must use `run_async_migrations()` pattern
- Create initial migration: `001_initial_schema.py` — all tables
- Create second migration: `002_timescale_hypertables.py` — convert to hypertables
- Create third migration: `003_indexes.py` — all performance indexes

### 2.4 — Repository Layer

Implement all repositories in `backend/app/repositories/`:

`base.py` — Generic async repository with:
```python
async def get_by_id(id: UUID) -> T | None
async def get_all(skip: int, limit: int) -> list[T]
async def create(obj: T) -> T
async def update(id: UUID, data: dict) -> T | None
async def delete(id: UUID) -> bool
async def exists(id: UUID) -> bool
```

`user_repo.py` — Additional: `get_by_email`, `update_last_login`
`wallet_repo.py` — Additional: `get_by_user_id`, `add_transaction`, `get_balance`, `update_balance_atomic` (using SELECT FOR UPDATE to prevent race conditions)
`trade_repo.py` — Additional: `get_trades_by_period`, `get_open_trades`, `calculate_pnl_summary`
`signal_repo.py` — Additional: `get_latest_signal`, `get_signals_by_symbol`, `mark_acted_on`
`order_repo.py` — Additional: `get_open_orders`, `get_by_broker_id`

### 2.5 — Pydantic Schemas

Create all schemas in `backend/app/schemas/` using Pydantic v2:
- `wallet.py` — WalletResponse, DepositRequest, WithdrawRequest, TransactionResponse
- `trading.py` — TradingConfigRequest, TradingConfigResponse, TradingStatus
- `auth.py` — RegisterRequest, LoginRequest, TokenResponse, UserResponse
- `portfolio.py` — PortfolioResponse, PositionResponse, PerformanceMetrics
- `ai.py` — SignalResponse, OptimalSettingsResponse, ModelStatusResponse, MarketOutlookResponse
- `analytics.py` — PnLResponse, DrawdownResponse, CompoundingProjectionResponse
- `paper_trading.py` — SimulationRequest, SimulationResponse, ForecastResponse

All schemas must:
- Have `model_config = ConfigDict(from_attributes=True)` for ORM compatibility
- Use `Annotated` types with Field validators for financial values (e.g., `Annotated[Decimal, Field(ge=0)]`)
- Have example values for Swagger documentation

**Verify Phase 2:** Run `make migrate`. All migrations apply cleanly. Run `make test-be` — all repository tests pass.

---

## ▶ PHASE 3 — FASTAPI BACKEND CORE
### Objective: Complete, documented, secured REST API and WebSocket server.

### 3.1 — Application Factory

`backend/app/main.py`:
```python
# Must implement:
# - lifespan context manager (startup: DB pool, Redis connection, Kafka producer)
# - CORS middleware (origins from env)
# - Request ID middleware (inject X-Request-ID header)
# - Structured logging middleware (log every request: method, path, status, duration)
# - Global exception handler (return consistent error JSON)
# - Prometheus metrics middleware
# - Rate limiting middleware (SlowAPI)
# - Mount API router at /api/v1
# - Mount WebSocket routes at /ws
# - Health check endpoint: GET /health (returns db, redis, kafka status)
# - OpenAPI docs at /docs (disable in production)
```

### 3.2 — Authentication System

`backend/app/core/security.py`:
- Password hashing: `bcrypt` via `passlib`
- JWT creation/verification with both access and refresh tokens
- TOTP-based 2FA: generate secret, verify code, backup codes
- Token blacklisting via Redis (for logout/revoke)

`backend/app/api/v1/auth.py` — Implement all endpoints:
```
POST /register     — validate email uniqueness, hash password, create user + wallet
POST /login        — verify credentials, check 2FA if enabled, return tokens in httpOnly cookies
POST /logout       — blacklist current token in Redis
POST /refresh      — validate refresh token, issue new access token
POST /2fa/setup    — generate TOTP secret, return QR code URL
POST /2fa/verify   — verify TOTP code, mark 2FA as enabled
POST /2fa/disable  — disable 2FA with password confirmation
GET  /me           — return current user profile
```

### 3.3 — All API Routers

Implement every endpoint from Blueprint Section 8, with:
- Dependency injection for: DB session, current user, cache client
- Input validation via Pydantic schemas
- Response models explicitly typed
- HTTP status codes correct (201 for creates, 404 for not found, 422 for validation)
- Docstrings on every endpoint (appear in Swagger)

**`wallet.py` endpoints:**
```
GET  /wallet                    → WalletResponse
POST /wallet/deposit            → WalletResponse (Server Action compatible)
POST /wallet/withdraw           → WalletResponse
GET  /wallet/transactions       → PaginatedResponse[TransactionResponse]
PUT  /wallet/reinvestment-ratio → WalletResponse
```
Wallet mutations must be atomic — use database transactions. Concurrent deposit/withdraw must not cause balance inconsistency.

**`trading.py` endpoints:**
```
GET  /trading/config            → TradingConfigResponse
POST /trading/config            → TradingConfigResponse
PUT  /trading/config/{id}       → TradingConfigResponse
POST /trading/start             → TradingStatus (triggers Celery task)
POST /trading/stop              → TradingStatus
GET  /trading/status            → TradingStatus
```

**`ai_signals.py` endpoints:**
```
GET  /ai/signals                → PaginatedResponse[SignalResponse]
GET  /ai/optimal-settings       → OptimalSettingsResponse
GET  /ai/market-outlook         → MarketOutlookResponse (calls LLM via Celery)
GET  /ai/model-status           → ModelStatusResponse
POST /ai/retrain                → TaskResponse (admin only)
```

**All remaining routers:** portfolio, analytics, paper_trading, settings — implement fully.

### 3.4 — WebSocket Manager

`backend/app/api/websockets/manager.py`:
```python
class ConnectionManager:
    # Manages per-user WebSocket connections via Redis pub/sub
    # Methods:
    #   connect(user_id, websocket) — register, subscribe to user channels
    #   disconnect(user_id) — cleanup, unsubscribe
    #   broadcast_to_user(user_id, message) — send to specific user
    #   broadcast_to_all(channel, message) — send to all subscribers
    #   handle_reconnect(websocket) — exponential backoff reconnect logic
```

`backend/app/api/websockets/price_feed.py`:
```python
# WebSocket endpoint: /ws/prices/{symbol}
# On connect: subscribe to Kafka topic for symbol
# On message: forward normalized OHLCV tick to client
# On disconnect: unsubscribe, cleanup
# Heartbeat: ping every 30 seconds, close on missed pong
```

`signal_feed.py`, `order_feed.py`, `portfolio_feed.py` — same pattern, different channels.

### 3.5 — Celery Tasks

`backend/app/tasks/celery_app.py` — Configure Celery with:
- Redis as broker and result backend
- Task serializer: JSON
- Beat schedule for recurring tasks:
  - `fetch_market_data`: every 1 minute during market hours (9:15-15:30 IST weekdays)
  - `run_ai_inference`: every 1 minute during market hours
  - `check_stop_losses`: every 30 seconds during market hours
  - `daily_model_update`: daily at 16:00 IST
  - `run_paper_simulation`: daily at 8:30 IST (pre-market)
  - `reinvestment_check`: every 5 minutes during market hours
  - `generate_daily_report`: daily at 16:30 IST

Implement all task files with full logic, error handling, and retry policies.

**Verify Phase 3:** All API endpoints return correct responses. Auth flow works end-to-end. WebSocket connections established and receive messages. Celery worker processes tasks. `make test-be` — 100% pass.

---

## ▶ PHASE 4 — NEXT.JS 14 FRONTEND
### Objective: Complete, pixel-perfect, performant trading UI using all Next.js 14 features.

### 4.1 — Project Setup

`frontend/package.json` — dependencies:
```json
{
  "dependencies": {
    "next": "14.x",
    "react": "18.x",
    "typescript": "5.x",
    "tailwindcss": "3.x",
    "@shadcn/ui": "latest",
    "zustand": "4.x",
    "@tanstack/react-query": "5.x",
    "socket.io-client": "4.x",
    "lightweight-charts": "4.x",
    "recharts": "2.x",
    "react-hook-form": "7.x",
    "zod": "3.x",
    "@hookform/resolvers": "3.x",
    "framer-motion": "11.x",
    "next-auth": "5.x",
    "axios": "1.x",
    "date-fns": "3.x",
    "clsx": "2.x",
    "tailwind-merge": "2.x",
    "lucide-react": "latest",
    "next-themes": "0.x"
  }
}
```

`frontend/tailwind.config.ts` — custom theme:
```typescript
// Dark trading theme:
// Background: deep navy #0A0E1A
// Surface: slightly lighter #0F1629
// Card: #141B2D
// Border: #1E2A3D
// Primary: electric blue #3B82F6
// Success/Long: emerald #10B981
// Danger/Short: rose #F43F5E
// Warning: amber #F59E0B
// Text primary: #E2E8F0
// Text muted: #64748B
// Accent: #8B5CF6 (AI/ML features)
// Gold: #F59E0B (AI optimal markers)
// Font: Inter (body), JetBrains Mono (numbers, code)
```

### 4.2 — Root Layout & Global Setup

`frontend/src/app/layout.tsx` — Root Server Component:
```typescript
// Must include:
// - next/font: Inter + JetBrains Mono, loaded server-side
// - ThemeProvider (next-themes, default: dark)
// - QueryClientProvider (React Query)
// - Metadata API: title template, description, OpenGraph
// - Viewport configuration
// - Global error boundary
```

`frontend/src/app/globals.css`:
```css
/* Tailwind directives */
/* CSS custom properties for the dark theme */
/* Custom scrollbar styles */
/* Trading-specific animations: pulse-green, pulse-red, slide-in */
/* Number formatting styles for financial figures */
```

### 4.3 — Authentication Pages

`(auth)/login/page.tsx` — Server Component page with client LoginForm child:
- Email + password fields with Zod validation
- "Remember me" checkbox
- 2FA code input (conditional, appears after first step)
- Link to register
- Error states with specific messages
- Redirect to dashboard on success

`(auth)/register/page.tsx` — Similar pattern

**Auth middleware** `middleware.ts` (root level):
```typescript
// Protected routes: /dashboard, /wallet, /trading, /analytics, /settings, /paper-trading
// Public routes: /, /login, /register, /api/auth
// Redirect unauthenticated users to /login
// Redirect authenticated users away from /login, /register
// Uses next-auth session
```

### 4.4 — Dashboard Page (Main)

`dashboard/page.tsx` — Server Component using Parallel Routes + Streaming:

```typescript
// Layout: Two-column on desktop, single column on mobile
// Left column (70%):
//   - MarketStatusBar (server component — checks NSE market hours)
//   - CandlestickChart (client component — TradingView Lightweight Charts)
//   - TradingSetup panel
// Right column (30%):
//   - WalletCard (server component with Suspense)
//   - TodayPnL (server component with Suspense)
//   - AIStatusPanel (server component with Suspense)
//   - AIInsightCard (streamed — LLM response)
//   - OpenPositions (client component — WebSocket updates)
```

Use `<Suspense>` with loading skeletons for every data-fetching section.
Use `loading.tsx` for page-level loading state.

### 4.5 — Trading Setup Page

`trading/page.tsx` + all sub-pages — implement full trading configuration UI:

**TradingTypeSelector component:**
```typescript
// 5 cards: Intraday (⚡HFT), F&O (Options/Futures), Weekly (Swing), Monthly (Position), Yearly (Long-term)
// Each card shows:
//   - Icon and label
//   - Typical holding period
//   - Risk level indicator (colored bar)
//   - Current AI confidence for this type (fetched from /api/v1/ai/optimal-settings)
// Selected state: glowing border in theme primary color
// Keyboard navigation support
// onChange triggers reload of optimal settings
```

**ReturnRateSlider component (most critical UI element):**
```typescript
// Custom ShadCN Slider with:
// - Range: 2% to 40%
// - Step: 0.5%
// - Current value shown above thumb
// - AI Optimal marker: gold diamond ◆ at the AI-suggested %
//   - Tooltip on hover: "AI recommends X% based on current market conditions and your risk profile"
//   - "Use AI Setting" button appears when user value differs from AI optimal
// - Color zones:
//   - 2-10%: green gradient (conservative)
//   - 10-25%: amber gradient (moderate)
//   - 25-40%: red gradient (aggressive)
// - Warning badge when above AI optimal: "Higher risk. AI suggests X%"
// - The AI optimal value is fetched from server and updates when trading type changes
```

**RiskSettings component:**
```typescript
// Collapsible panel with:
// - Max daily loss limit (slider, default from env)
// - Stop loss type: Fixed % / ATR-based / Trailing
// - Position sizing: Fixed / Kelly Criterion / AI-managed
// - Max concurrent positions (1-20)
// - Auto-reinvestment toggle + ratio slider
```

### 4.6 — Wallet Pages

`wallet/page.tsx` — Server Component:
- Wallet balance card (fetched server-side)
- Allocation breakdown pie chart (Recharts)
- Quick deposit/withdraw buttons that open intercepted route modals

`wallet/deposit/page.tsx` — **Intercepting Route** (`@modal/deposit`):
```typescript
// Deposit form as a modal overlay on the wallet page
// Server Action for form submission
// Fields: amount (INR), payment method (UPI/NEFT/IMPS)
// Real-time balance update after deposit via React Query invalidation
// Zod validation: amount must be positive number, max ₹10,00,000 per transaction
```

`wallet/history/page.tsx`:
- Paginated transaction table
- Filter by: type, date range, amount range
- Export to CSV (Server Action)

### 4.7 — Paper Trading Pages

`paper-trading/page.tsx`:
```typescript
// SimulationPanel: 
//   - Select trading type, capital amount, date range
//   - "Run Pre-Market Simulation" button
//   - Progress bar while simulation runs (polling /api/v1/paper-trading/results/{id})
// SimulationResults:
//   - PnL forecast chart (10th/50th/90th percentile curves)
//   - Expected trades list with entry/exit levels
//   - Comparison: Paper vs Actual (for past simulations)
//   - Accuracy score
```

### 4.8 — Analytics Pages

`analytics/page.tsx`:
- PnL equity curve (Recharts AreaChart)
- Returns heatmap (calendar view, green/red by day)
- Drawdown chart
- Key metrics grid: Sharpe, Sortino, Win Rate, Profit Factor, MDD

`analytics/ai-insights/page.tsx`:
- AI model performance over time
- Reward curve chart
- Prediction accuracy by symbol/type
- SHAP feature importance (when available)

### 4.9 — Zustand Stores

`store/walletStore.ts`:
```typescript
interface WalletState {
  balance: number
  tradingCapital: number
  withdrawableBalance: number
  reserveBalance: number
  reinvestmentRatio: number
  isLoading: boolean
  // Actions
  setWallet: (wallet: WalletData) => void
  updateBalance: (newBalance: number) => void
  setReinvestmentRatio: (ratio: number) => void
}
```

`store/tradingStore.ts`:
```typescript
interface TradingState {
  activeType: TradingType
  targetReturnRate: number
  aiOptimalRate: number
  isActive: boolean
  isPaperMode: boolean
  riskSettings: RiskSettings
  // Actions
  setTradingType: (type: TradingType) => void
  setReturnRate: (rate: number) => void
  useAIOptimal: () => void
  startTrading: () => Promise<void>
  stopTrading: () => Promise<void>
}
```

`store/aiStore.ts`, `store/portfolioStore.ts`, `store/uiStore.ts` — similar pattern.

### 4.10 — WebSocket Hooks

`hooks/useWebSocket.ts`:
```typescript
// Generic WebSocket hook with:
// - Auto-connect on mount
// - Exponential backoff reconnect (1s, 2s, 4s, 8s, max 30s)
// - Message type discrimination
// - Zustand store updates on message receipt
// - Cleanup on unmount
// - Connection status: 'connecting' | 'connected' | 'disconnected' | 'error'
```

`hooks/useAISignals.ts`, `hooks/useMarketData.ts`, `hooks/usePortfolio.ts` — built on top of useWebSocket.

### 4.11 — API Client

`lib/api.ts`:
```typescript
// Axios instance with:
// - Base URL from env
// - Request interceptor: attach JWT from cookie
// - Response interceptor: handle 401 (refresh token), 429 (rate limit backoff)
// - TypeScript generics: api.get<WalletResponse>('/wallet')
// - All API functions exported (not raw axios calls in components)
```

**Verify Phase 4:** `make dev` → open browser → login → dashboard loads without errors → wallet shows balance → trading type selector works → slider shows AI marker → paper trading runs simulation → analytics page shows charts. All TypeScript types compile. `make test-fe` passes.

---

## ▶ PHASE 5 — AI ENGINE FOUNDATION
### Objective: Working data pipeline, feature engineering, and initial RL environment.
### Use Claude Opus 4.6 for this phase.

### 5.1 — Data Fetchers

`ai_engine/alphamind_ai/data/market_data_fetcher.py`:
```python
class MarketDataFetcher:
    """
    Fetches OHLCV data from multiple sources with fallback.
    Primary: Zerodha Kite WebSocket (real-time ticks)
    Secondary: yfinance (historical, free)
    Tertiary: NSE India unofficial API
    
    Methods:
    - async fetch_historical(symbol, from_date, to_date, interval) -> pd.DataFrame
    - async fetch_live_tick(symbol) -> TickData
    - async subscribe_ticks(symbols, callback) -> None
    - async get_option_chain(symbol, expiry) -> OptionChain
    
    Data stored in TimescaleDB via repository layer.
    All OHLCV normalized to standard format: timestamp, open, high, low, close, volume
    """
```

`news_scraper.py`, `economic_data.py`, `social_sentiment.py` — full implementations.

### 5.2 — Feature Engineering

`ai_engine/alphamind_ai/features/technical_features.py`:
```python
class TechnicalFeatureEngine:
    """
    Computes all technical indicators using pandas-ta.
    
    Features computed (with correct look-back periods):
    - Trend: EMA(9,21,50,200), SMA(20,50,200), VWAP, Supertrend
    - Momentum: RSI(14), Stochastic(14,3), Williams%R, ROC, CCI
    - Volatility: ATR(14), Bollinger Bands(20,2), Keltner Channel, VIX
    - Volume: OBV, VWAP, MFI(14), CMF, Volume SMA ratio
    - MACD: (12,26,9) — line, signal, histogram
    - Ichimoku: tenkan, kijun, senkou_a, senkou_b, chikou
    
    All values normalized to [-1, 1] range for RL input.
    NaN handling: forward-fill then zero-fill (not drop — preserves shape).
    Returns np.ndarray for RL, pd.DataFrame for analysis.
    """
```

Implement all feature files with full computation logic.

### 5.3 — RL Trading Environment

`ai_engine/alphamind_ai/models/rl/trading_env.py`:

This is the most critical file in the entire project. Implement the full Gymnasium environment:

```python
class AlphaMindTradingEnv(gym.Env):
    """
    Full implementation required.
    
    __init__:
    - Accept: data (pd.DataFrame), config (EnvConfig)
    - Define observation_space: Box(-inf, inf, shape=(320,), dtype=np.float32)
    - Define action_space: Box([-1,-1,0.5,1.0], [1,1,3.0,5.0], shape=(4,), dtype=np.float32)
    - Initialize: position tracker, P&L tracker, trade log
    
    reset(seed=None):
    - Reset to start of episode (random start in training, fixed in eval)
    - Return (observation, info)
    
    step(action):
    - Parse action: direction, size, sl_dist, tp_dist
    - Apply systematic risk checks BEFORE executing
    - Simulate order execution with slippage (bid-ask spread model)
    - Update position, compute unrealized PnL
    - Handle stop-loss and take-profit hits
    - Compute multi-objective reward (Sharpe + PnL - DD - Costs)
    - Return (observation, reward, terminated, truncated, info)
    
    _get_observation():
    - Concatenate all feature arrays into single np.float32 vector
    - Include account state (capital_pct, position_size, unrealized_pnl_pct)
    
    _compute_reward():
    - Sharpe contribution: rolling 30-trade Sharpe ratio change
    - PnL normalized: trade PnL / initial capital
    - Drawdown penalty: -abs(current_drawdown / max_allowed_drawdown)
    - Trade cost penalty: -abs(brokerage + STT + slippage) / capital
    
    render(mode='human'):
    - Print current step, position, PnL, cumulative return
    """
```

`reward_functions.py` — implement all reward variants (Sharpe, Sortino, PnL-only, risk-adjusted) as callable classes.

`action_space.py`, `observation_space.py` — separate concerns cleanly.

### 5.4 — RL Agents

Implement all three agents using Stable-Baselines3:

`ppo_agent.py`:
```python
class PPOTradingAgent:
    # Custom policy network: LSTM-based to capture temporal dependencies
    # Hyperparameters tuned for intraday trading
    # Methods: train, predict, save, load, evaluate
```

`sac_agent.py`, `td3_agent.py` — same pattern.

`ensemble_agent.py`:
```python
class EnsembleTradingAgent:
    # Weights each agent by recent 30-day Sharpe ratio
    # Voting: weighted average of actions
    # Dynamic reweighting after each episode
```

### 5.5 — Training Pipeline

`ai_engine/alphamind_ai/training/trainer.py`:
```python
class AlphaMindTrainer:
    """
    Orchestrates full training pipeline:
    1. Download + preprocess historical data (5 years NSE)
    2. Build feature dataset
    3. Create training/validation/test environments
    4. Train all three agents (PPO, SAC, TD3) in parallel (Ray)
    5. Evaluate each agent on test set
    6. Create ensemble with initial weights
    7. Log all metrics to MLflow
    8. Save model artifacts to S3/MinIO
    9. Register best model version in MLflow registry
    """
```

`backtester.py`, `walk_forward.py`, `online_learner.py` — full implementations.

### 5.6 — Inference Server

`ai_engine/alphamind_ai/inference/signal_generator.py`:
```python
class SignalGenerator:
    """
    Real-time signal generation:
    1. Receive latest market data (from Kafka or API)
    2. Compute features (< 10ms)
    3. Run ensemble agent inference (ONNX for speed < 5ms)
    4. Apply LLM context modifier (async, non-blocking)
    5. Apply risk filters
    6. Publish signal to Kafka (for backend to consume)
    7. Save signal to DB
    
    Must handle: missing data, stale features, model not loaded
    """
```

`position_sizer.py` — Kelly Criterion with AI size modifier.
`latency_optimizer.py` — ONNX export pipeline with INT8 quantization.

### 5.7 — LLM Integration

`ai_engine/alphamind_ai/models/nlp/llm_reasoner.py`:
```python
class LLMMarketReasoner:
    """
    Uses Anthropic Claude API for discretionary market reasoning.
    
    Input: context built by context_builder.py
    Output: MarketOutlook (sentiment, confidence, key_risks, sector_views, veto_trade)
    
    Implements:
    - Async API call with timeout (max 10s — never block trading)
    - Response parsing with Pydantic validation
    - Fallback: if API fails → return neutral outlook (never block)
    - Cache: cache response for 15 minutes (same context = same answer)
    - Cost tracking: log token usage to MLflow
    """
```

**Verify Phase 5:** `make train` runs without errors. `python -m pytest ai_engine/tests/ -v` — all tests pass. Signal generator produces signals on sample data.

---

## ▶ PHASE 6 — RISK MANAGEMENT SYSTEM
### Objective: All risk layers active, tested, and impossible to bypass.

Implement all risk modules in `ai_engine/alphamind_ai/risk/`:

`position_limits.py`:
```python
class PositionLimitChecker:
    # Before every order:
    # 1. Single position size ≤ MAX_POSITION_SIZE_PCT of capital
    # 2. Total open positions ≤ MAX_OPEN_POSITIONS
    # 3. Sector concentration ≤ 30% of portfolio
    # 4. Single stock F&O ≤ 10% of capital
    # Returns: (allowed: bool, reason: str, max_allowed_size: float)
```

`stop_loss_engine.py`:
```python
class StopLossEngine:
    # Manages stop losses for all open positions
    # Dynamic ATR-based stops: stop = entry - (ATR * multiplier)
    # Trailing stops: ratchet up as position gains
    # Time-based exits: intraday positions closed by 15:15 IST
    # Monitors every 30 seconds via Celery beat
    # On trigger: create market order immediately, no delay
```

`drawdown_monitor.py`:
```python
class DrawdownMonitor:
    # Real-time drawdown tracking
    # Max daily loss circuit breaker: halt ALL trading if hit
    # Max monthly drawdown: reduce position sizes by 50%
    # Recovery mode: reduced position sizes for 3 days after circuit breaker reset
    # Publishes halt signals to Redis pub/sub (backend picks up and stops orders)
```

`var_calculator.py`, `correlation_guard.py`, `regime_risk_adjuster.py`, `black_swan_guard.py` — full implementations.

**Risk system integration:** The risk engine must be called synchronously (blocking) before every order. No order can bypass it. Write integration tests that prove:
1. An order exceeding position limit is rejected
2. Daily loss limit triggers halt
3. Stop loss fires within 30 seconds of trigger condition
4. Black swan detection activates on >5% intraday market move

---

## ▶ PHASE 7 — PAPER TRADING & SIMULATION ENGINE
### Objective: Fully realistic paper trading that closely predicts real performance.

`ai_engine/alphamind_ai/paper_trading/simulator.py`:
```python
class PaperTradingSimulator:
    """
    Simulates real trading with maximum realism.
    
    Components:
    - VirtualBroker: accepts orders, fills at realistic prices
    - SlippageModel: bid-ask spread simulation from historical data
    - CommissionModel: Zerodha-accurate: 0.03% or ₹20 max per order, STT, GST, stamp duty
    - MarketImpactModel: large orders move price against you
    
    Modes:
    1. Historical backtest: replay historical data at configurable speed
    2. Pre-market Monte Carlo: 1000 simulations with sampled market scenarios
    3. Shadow live: run parallel to real market using live data
    
    Outputs:
    - PnL curve with percentile bands (10th/50th/90th)
    - Trade log with entry/exit/reason
    - Performance metrics
    - Accuracy: predicted vs actual (calculated after market close)
    """
```

Pre-market simulation workflow:
1. Triggered at 8:30 AM IST by Celery beat
2. Fetch latest model weights
3. Generate 1000 market scenarios (Monte Carlo on returns distribution)
4. Run agent on each scenario
5. Aggregate P&L distribution
6. Save results, push to frontend via WebSocket
7. At 16:00 IST, calculate actual vs predicted accuracy

**Verify Phase 7:** Paper simulation runs end-to-end. Pre-market forecast generates P&L distribution. Shadow live mode works alongside real data.

---

## ▶ PHASE 8 — MONITORING, OBSERVABILITY & HARDENING
### Objective: Production-grade observability and a hardened, deployable system.

### 8.1 — Prometheus Metrics

Instrument all services with custom metrics:

**Backend metrics:**
```python
# Trading metrics:
trade_total = Counter('alphamind_trades_total', 'Total trades', ['type', 'direction', 'result'])
trade_pnl = Histogram('alphamind_trade_pnl', 'Trade P&L in INR', buckets=[...])
active_positions = Gauge('alphamind_active_positions', 'Current open positions')
daily_pnl = Gauge('alphamind_daily_pnl_inr', 'Daily P&L in INR')
wallet_balance = Gauge('alphamind_wallet_balance_inr', 'Wallet balance')

# API metrics:
http_requests_total = Counter('alphamind_http_requests_total', 'HTTP requests', ['method', 'endpoint', 'status'])
http_request_duration = Histogram('alphamind_http_request_duration_seconds', 'HTTP duration')
websocket_connections = Gauge('alphamind_websocket_connections', 'Active WS connections')

# AI metrics:
signal_latency = Histogram('alphamind_signal_latency_ms', 'Signal generation latency')
model_confidence = Histogram('alphamind_model_confidence', 'AI signal confidence')
llm_api_calls = Counter('alphamind_llm_api_calls_total', 'LLM API calls', ['model', 'status'])
```

### 8.2 — Grafana Dashboards

Create `monitoring/grafana/dashboards/`:

`trading-dashboard.json`:
- Real-time P&L gauge
- Active positions table
- Trade activity timeline
- Win/loss ratio pie chart
- Daily P&L bar chart

`ai-model-dashboard.json`:
- Signal generation latency (histogram)
- AI confidence score distribution
- RL reward curve over time
- Model version performance comparison
- LLM API usage and cost

`system-health.json`:
- CPU, memory, disk for all containers
- Database connection pool usage
- Redis memory usage
- Kafka consumer lag
- API response time percentiles (p50, p95, p99)

`pnl-dashboard.json`:
- Equity curve (all-time)
- Monthly returns heatmap
- Drawdown chart
- Sharpe/Sortino trend
- Compounding projection

### 8.3 — Alerting Rules

`monitoring/alerts/trading-alerts.yaml`:
```yaml
# Alert on:
# - Daily loss > 1.5% (warning) or > 2% (critical — halt trading)
# - No trades executed for > 2 hours during market hours (potential engine failure)
# - API response time p95 > 500ms
# - WebSocket connection count drops to 0
# - Drawdown > 7% (warning) or > 10% (critical)
# - Model confidence average < 0.5 for > 30 minutes (model drift)
```

### 8.4 — Final Hardening Checklist

Before declaring the build complete, verify every item:

**Security:**
- [ ] All endpoints require authentication (except /health, /login, /register)
- [ ] JWT stored in httpOnly cookie only
- [ ] No sensitive data logged (API keys, passwords, broker tokens)
- [ ] Rate limiting active on all public endpoints
- [ ] CORS configured to allow only FRONTEND_URL
- [ ] Database credentials only in environment variables

**Reliability:**
- [ ] Every async function has try/except with specific error handling
- [ ] WebSocket reconnects automatically after disconnection
- [ ] Celery tasks have retry policies (max 3 retries, exponential backoff)
- [ ] Database connection pool handles connection drops
- [ ] Redis operations have fallback if Redis is unavailable

**Trading Safety:**
- [ ] Risk checks run BEFORE every order, cannot be bypassed
- [ ] ENABLE_LIVE_TRADING=false by default — must be explicitly enabled
- [ ] Kill switch works: POST /api/v1/trading/emergency-halt cancels all open orders < 500ms
- [ ] Daily loss limit circuit breaker halts ALL orders when triggered
- [ ] Intraday positions auto-closed by 15:15 IST regardless of P&L

**Performance:**
- [ ] Dashboard initial load < 2 seconds (Next.js SSR + Suspense)
- [ ] Signal generation latency < 50ms (ONNX inference)
- [ ] API p95 response time < 200ms
- [ ] WebSocket message latency < 50ms
- [ ] `docker-compose up` → all healthy < 60 seconds

**Tests:**
- [ ] `make test` passes 100% — no skipped, no failures
- [ ] Coverage > 80% on backend core logic
- [ ] Coverage > 70% on AI engine
- [ ] E2E: login → configure trading → run paper simulation — passes
- [ ] E2E: deposit → set return rate → start trading → verify signal generated — passes

---

## ═══════════════════════════════════════════════════════════
## AGENT BEHAVIOR GUIDELINES
## ═══════════════════════════════════════════════════════════

### When you are uncertain about a design decision:
Choose the option that is **more explicit, more typed, and more testable**. Prefer verbosity over cleverness in financial systems.

### When you encounter a library version conflict:
Pin ALL dependencies to exact versions. Use the latest stable versions as of your knowledge cutoff. Document the pinned version and the reason in a comment.

### When a feature requires an external API key not yet available:
Build the integration fully, but add a `is_configured()` check that gracefully degrades to mock data when the key is missing. Never crash due to a missing API key.

### When you need to make a database query complex:
Write it in SQLAlchemy ORM first. If performance requires it, add a raw SQL version as a comment with an explanation of why the ORM version is slower.

### When building AI/ML code:
- Always set random seeds for reproducibility: `torch.manual_seed(42)`, `np.random.seed(42)`
- Always log training runs to MLflow with: hyperparameters, metrics at each epoch, final metrics, model artifact
- Always save a model checkpoint every N steps (default: 1000) so training can resume after interruption
- Always validate the model on out-of-sample data before saving

### When the task feels too large to do perfectly in one step:
Break it into subtasks. Solve each subtask completely. Integrate. Do not move on until the current subtask tests pass.

### If you ever find yourself writing a comment like "this would normally...":
Stop. Implement it fully instead.

---

## ═══════════════════════════════════════════════════════════
## FINAL DELIVERABLE CHECKLIST
## ═══════════════════════════════════════════════════════════

When all 8 phases are complete, the following must all be true:

1. **`make dev` brings up the full stack** — all 10 Docker services start and pass health checks
2. **The app is usable** — a user can log in, add wallet funds, configure trading type, set return rate, run a paper simulation, and view results
3. **The AI generates signals** — on sample market data, the signal generator produces BUY/SELL/HOLD signals with confidence scores
4. **Tests pass** — `make test` exits with code 0
5. **Types are clean** — `make typecheck` exits with code 0 for both Python and TypeScript
6. **Lint is clean** — `make lint` exits with code 0
7. **Docs are complete** — `README.md` contains setup instructions that work on a fresh machine
8. **The trading safety system works** — `ENABLE_LIVE_TRADING=false` by default, risk checks reject invalid orders, kill switch works

---

## ═══════════════════════════════════════════════════════════
## A NOTE ON APPROACH
## ═══════════════════════════════════════════════════════════

This is a complex system. The temptation will be to move quickly and leave things incomplete. Resist it.

A real money trading system with incomplete risk checks, unhandled errors, or broken authentication is dangerous. It will either lose money, expose credentials, or silently fail in ways that are hard to debug.

Take the time to do each phase properly:
- Plan before coding (use Antigravity Plan Mode)
- Read the blueprint section before implementing it
- Write the test first if the logic is complex
- Verify before proceeding

The goal is not speed. The goal is a system you can trust with real capital.

Build it right.

---

*End of AlphaMind Antigravity Master Build Prompt*
*Reference: ALPHAMIND_AI_TRADING_BLUEPRINT.md — keep it open alongside this prompt at all times*
