# ALPHAMIND — AI-Core Self-Reinforced Algorithmic Trading Platform
## Master Project Blueprint & Developer Specification

> **Version:** 1.0.0-alpha  
> **Date:** 2026-03-17  
> **Classification:** Full-Stack AI Trading System — Production Blueprint  
> **Audience:** AI IDE (Cursor / Windsurf / Copilot Workspace), LLM-powered code generation  

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)  
2. [System Architecture Overview](#2-system-architecture-overview)  
3. [Technology Stack](#3-technology-stack)  
4. [Project File & Folder Tree](#4-project-file--folder-tree)  
5. [Module Specifications](#5-module-specifications)  
   - 5.1 Frontend / UI Layer  
   - 5.2 Wallet & Fund Management  
   - 5.3 Trading Engine (Discretionary + Systematic)  
   - 5.4 AI / ML Core — Self-Reinforced Learning  
   - 5.5 High-Frequency & High-Volume Trading Engine  
   - 5.6 Paper Trading & Simulation  
   - 5.7 Data Ingestion Pipeline  
   - 5.8 Risk Management System  
   - 5.9 Cloud & Hybrid Compute Layer  
   - 5.10 Broker Integration Layer  
   - 5.11 Portfolio & Return Analytics  
6. [AI Model Architecture Deep Dive](#6-ai-model-architecture-deep-dive)  
7. [Database Schema](#7-database-schema)  
8. [API Specification](#8-api-specification)  
9. [Self-Reinforcement Learning Loop](#9-self-reinforcement-learning-loop)  
10. [UI/UX Layout Specification](#10-uiux-layout-specification)  
11. [Trading Strategy Definitions](#11-trading-strategy-definitions)  
12. [Security Architecture](#12-security-architecture)  
13. [Deployment Pipeline](#13-deployment-pipeline)  
14. [Environment Variables & Config](#14-environment-variables--config)  
15. [Testing Strategy](#15-testing-strategy)  
16. [Roadmap & Milestones](#16-roadmap--milestones)  
17. [Regulatory Compliance Notes](#17-regulatory-compliance-notes)  
18. [Glossary](#18-glossary)  

---

## 1. EXECUTIVE SUMMARY

**AlphaMind** is an AI-first, self-reinforcing algorithmic trading platform designed to autonomously execute, learn, and compound returns across multiple trading horizons. It blends:

- **Discretionary AI** — context-aware decisions using LLMs trained on news, economic reports, political signals, chart patterns, and market sentiment.
- **Systematic Rules Engine** — hard-coded logic gates, position limits, stop losses, and drawdown circuit breakers to enforce discipline.
- **Reinforcement Learning (RL)** — the system improves its own strategy parameters after every trade using a continuous reward/penalty feedback loop.
- **High-Frequency / High-Volume Engine** — micro-profit accumulation at millisecond latency, with auto-reinvestment to compound positions.
- **Paper Trading Simulator** — run shadow portfolios before market open to forecast intraday P&L curves.
- **Modern Low-Compute UI** — lightweight React/Next.js interface with real-time WebSocket feeds, no heavy client-side computation.

---

## 2. SYSTEM ARCHITECTURE OVERVIEW

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                          ALPHAMIND PLATFORM                                  │
│                                                                              │
│  ┌───────────────┐    ┌──────────────────────────────────────────────────┐  │
│  │   FRONTEND    │    │                  BACKEND CORE                    │  │
│  │  Next.js 14   │◄──►│  FastAPI (Python) + Node.js microservices       │  │
│  │  React + TS   │    │  WebSocket Gateway  │  REST API  │  GraphQL     │  │
│  │  TailwindCSS  │    └──────────────────────────────────────────────────┘  │
│  │  Recharts     │               │              │              │             │
│  └───────────────┘               ▼              ▼              ▼             │
│                        ┌─────────────┐ ┌──────────────┐ ┌───────────────┐  │
│                        │  AI ENGINE  │ │TRADING ENGINE│ │  DATA PIPELINE│  │
│                        │  (Python)   │ │  (C++/Rust)  │ │  (Kafka+Spark)│  │
│                        │  PyTorch    │ │  HFT Core    │ │  Market Data  │  │
│                        │  Stable-    │ │  Order Mgmt  │ │  News NLP     │  │
│                        │  Baselines3 │ │  Risk Engine │ │  Economic API │  │
│                        └─────────────┘ └──────────────┘ └───────────────┘  │
│                               │                │                │            │
│                        ┌──────▼────────────────▼────────────────▼─────────┐ │
│                        │            PERSISTENCE LAYER                      │ │
│                        │  TimescaleDB │ Redis │ InfluxDB │ S3/MinIO        │ │
│                        └────────────────────────────────────────────────── ┘ │
│                               │                                              │
│                        ┌──────▼──────────────────────────────────────────┐  │
│                        │              CLOUD / HYBRID COMPUTE              │  │
│                        │  AWS SageMaker │ GCP Vertex AI │ Local GPU Node  │  │
│                        └─────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Core Principles
| Principle | Implementation |
|-----------|---------------|
| AI-First | Every decision route passes through the AI inference layer |
| Self-Reinforcing | RL feedback loop updates model weights after every closed trade |
| Hybrid Compute | Heavy training on cloud; lightweight inference on local/edge |
| Fail-Safe | Systematic rules override AI signals under defined stress conditions |
| Compound Growth | Profits auto-reinvested with adjustable reinvestment ratios |

---

## 3. TECHNOLOGY STACK

### Frontend
| Layer | Technology | Reason |
|-------|-----------|--------|
| Framework | Next.js 14 (App Router) | SSR, lightweight, fast |
| Language | TypeScript | Type safety for financial data |
| UI Library | ShadCN UI + Tailwind CSS | Modern, zero-bloat components |
| State | Zustand + React Query | Minimal re-renders for real-time data |
| Charts | TradingView Lightweight Charts + Recharts | Professional OHLCV candlesticks |
| Real-time | Socket.IO client | WebSocket for live prices/signals |
| Forms | React Hook Form + Zod | Validated inputs (wallet, sliders) |
| Animations | Framer Motion | Smooth, performant UI transitions |

### Backend API
| Layer | Technology | Reason |
|-------|-----------|--------|
| Primary API | FastAPI (Python 3.11) | Async, AI-native, OpenAPI auto-docs |
| Secondary | Node.js / Express | Webhook handlers, broker callbacks |
| Real-time | WebSocket (FastAPI) + Redis Pub/Sub | Low-latency signal broadcast |
| Task Queue | Celery + Redis | Async AI inference jobs |
| Scheduler | APScheduler / Airflow | Market-hours cron jobs |

### AI / ML Core
| Component | Technology | Reason |
|-----------|-----------|--------|
| RL Framework | Stable-Baselines3 + Ray RLlib | Battle-tested RL agents |
| Deep Learning | PyTorch 2.x | Flexible custom architectures |
| LLM (Discretionary) | LLaMA 3.1 70B (fine-tuned) / Claude API | Context-aware market reasoning |
| NLP Pipeline | HuggingFace Transformers + spaCy | News/sentiment processing |
| Time-Series | Temporal Fusion Transformer (TFT) | Multi-horizon price forecasting |
| Technical Analysis | TA-Lib + pandas-ta | Pattern recognition signals |
| Feature Engineering | Feature-engine + tsfresh | Automated feature creation |
| Model Serving | TorchServe + ONNX Runtime | Fast inference |
| Experiment Tracking | MLflow + Weights & Biases | Model versioning, reward curves |
| AutoML | Optuna (Hyperparameter Optimization) | Self-tuning model configs |

### HFT Engine
| Component | Technology | Reason |
|-----------|-----------|--------|
| Core Engine | C++ (Boost.Asio) or Rust (Tokio) | Sub-millisecond order routing |
| Order Book | Custom LOB (Limit Order Book) in C++ | Ultra-fast matching |
| Market Data | FIX Protocol 4.4/5.0 | Industry standard |
| Co-location Interface | Custom TCP/UDP sockets | Minimal network hops |

### Data Layer
| Component | Technology | Reason |
|-----------|-----------|--------|
| Time-Series DB | TimescaleDB (PostgreSQL extension) | OHLCV, trades, signals |
| Cache | Redis 7 | Real-time order state, signals |
| Event Stream | Apache Kafka | High-throughput market events |
| Stream Processing | Apache Flink / Spark Streaming | Real-time feature computation |
| Object Storage | AWS S3 / MinIO (self-hosted) | Model artifacts, historical data |
| OLAP Analytics | DuckDB + Parquet | Backtesting, offline analytics |
| Search | Elasticsearch | News corpus, event search |

### Cloud & Infrastructure
| Component | Technology | Reason |
|-----------|-----------|--------|
| Primary Cloud | AWS (Mumbai ap-south-1) | Closest to Indian markets |
| AI Training | AWS SageMaker / GCP Vertex AI | Scalable GPU training |
| Local GPU | NVIDIA RTX / A-series (your machine) | Low-latency inference |
| Containers | Docker + Kubernetes (EKS) | Reproducible deployments |
| CI/CD | GitHub Actions + ArgoCD | Automated testing + deploy |
| Secrets | AWS Secrets Manager + Vault | API keys, broker credentials |
| Monitoring | Grafana + Prometheus + OpenTelemetry | System + trading health |

### Broker Integration
| Broker | Integration | Purpose |
|--------|-----------|---------|
| Zerodha Kite | Kite Connect API v3 | Indian equities, F&O |
| Upstox | Upstox API v2 | Alternative execution |
| Interactive Brokers | IBKR TWS API / FIX | Global markets, HFT |
| Angel One | SmartAPI | Backup routing |
| Paper Trading | Custom simulator + NSE historical | Simulation engine |

---

## 4. PROJECT FILE & FOLDER TREE

```
alphamind/
│
├── README.md
├── CONTRIBUTING.md
├── LICENSE
├── .env.example
├── .env.local
├── docker-compose.yml
├── docker-compose.prod.yml
├── Makefile
│
├── docs/
│   ├── architecture/
│   │   ├── system-overview.md
│   │   ├── ai-model-design.md
│   │   ├── hft-engine-design.md
│   │   └── data-pipeline-design.md
│   ├── api/
│   │   ├── rest-api.md
│   │   └── websocket-api.md
│   ├── strategies/
│   │   ├── intraday-strategy.md
│   │   ├── fno-strategy.md
│   │   ├── weekly-strategy.md
│   │   ├── monthly-strategy.md
│   │   └── yearly-strategy.md
│   └── deployment/
│       ├── local-setup.md
│       ├── cloud-setup.md
│       └── production-checklist.md
│
├── frontend/                          # Next.js 14 App
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── next.config.ts
│   ├── public/
│   │   ├── icons/
│   │   └── assets/
│   │
│   ├── src/
│   │   ├── app/                       # Next.js App Router
│   │   │   ├── layout.tsx             # Root layout
│   │   │   ├── page.tsx               # Dashboard home
│   │   │   ├── globals.css
│   │   │   │
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx
│   │   │   │   ├── register/page.tsx
│   │   │   │   └── 2fa/page.tsx
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx           # Main trading dashboard
│   │   │   │   ├── loading.tsx
│   │   │   │   └── error.tsx
│   │   │   │
│   │   │   ├── wallet/
│   │   │   │   ├── page.tsx           # Wallet management
│   │   │   │   ├── deposit/page.tsx
│   │   │   │   ├── withdraw/page.tsx
│   │   │   │   └── history/page.tsx
│   │   │   │
│   │   │   ├── trading/
│   │   │   │   ├── page.tsx           # Trading setup & configuration
│   │   │   │   ├── intraday/page.tsx
│   │   │   │   ├── fno/page.tsx
│   │   │   │   ├── weekly/page.tsx
│   │   │   │   ├── monthly/page.tsx
│   │   │   │   └── yearly/page.tsx
│   │   │   │
│   │   │   ├── paper-trading/
│   │   │   │   ├── page.tsx           # Simulation mode
│   │   │   │   └── results/page.tsx
│   │   │   │
│   │   │   ├── analytics/
│   │   │   │   ├── page.tsx           # Performance analytics
│   │   │   │   ├── pnl/page.tsx
│   │   │   │   ├── risk/page.tsx
│   │   │   │   └── ai-insights/page.tsx
│   │   │   │
│   │   │   ├── settings/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── broker/page.tsx
│   │   │   │   ├── ai-model/page.tsx
│   │   │   │   └── notifications/page.tsx
│   │   │   │
│   │   │   └── api/                   # Next.js API routes (lightweight)
│   │   │       ├── auth/[...nextauth]/route.ts
│   │   │       └── webhook/route.ts
│   │   │
│   │   ├── components/
│   │   │   ├── ui/                    # ShadCN base components
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── slider.tsx
│   │   │   │   ├── badge.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── tabs.tsx
│   │   │   │   └── tooltip.tsx
│   │   │   │
│   │   │   ├── wallet/
│   │   │   │   ├── WalletCard.tsx     # Balance display
│   │   │   │   ├── DepositForm.tsx    # Add money form
│   │   │   │   ├── WithdrawForm.tsx
│   │   │   │   ├── TransactionHistory.tsx
│   │   │   │   └── AllocationPieChart.tsx
│   │   │   │
│   │   │   ├── trading/
│   │   │   │   ├── TradingSetup.tsx   # Main trading config panel
│   │   │   │   ├── TradingTypeSelector.tsx  # Intraday/FNO/Weekly/etc
│   │   │   │   ├── ReturnRateSlider.tsx     # 2%-40% slider with AI marker
│   │   │   │   ├── AIOptimalMarker.tsx      # Optimal setting indicator
│   │   │   │   ├── RiskSettings.tsx
│   │   │   │   ├── PositionSizer.tsx
│   │   │   │   └── TradeConfirmDialog.tsx
│   │   │   │
│   │   │   ├── charts/
│   │   │   │   ├── CandlestickChart.tsx     # TradingView chart
│   │   │   │   ├── PnLCurve.tsx             # Equity curve
│   │   │   │   ├── ReturnsHeatmap.tsx
│   │   │   │   ├── DrawdownChart.tsx
│   │   │   │   ├── VolumeChart.tsx
│   │   │   │   └── AISignalOverlay.tsx      # Buy/Sell overlays
│   │   │   │
│   │   │   ├── ai/
│   │   │   │   ├── AIStatusPanel.tsx        # Model training status
│   │   │   │   ├── AIInsightCard.tsx        # LLM market commentary
│   │   │   │   ├── ModelPerformanceCard.tsx
│   │   │   │   ├── RewardCurveChart.tsx     # RL reward over time
│   │   │   │   └── SentimentGauge.tsx
│   │   │   │
│   │   │   ├── paper-trading/
│   │   │   │   ├── SimulationPanel.tsx
│   │   │   │   ├── SimulationResults.tsx
│   │   │   │   ├── PaperPnLForecast.tsx
│   │   │   │   └── SimulationControls.tsx
│   │   │   │
│   │   │   └── layout/
│   │   │       ├── Sidebar.tsx
│   │   │       ├── TopBar.tsx
│   │   │       ├── MarketStatusBar.tsx      # Live market hours/status
│   │   │       └── NotificationCenter.tsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useWallet.ts
│   │   │   ├── useTradingConfig.ts
│   │   │   ├── useWebSocket.ts          # Live prices/signals
│   │   │   ├── useAISignals.ts
│   │   │   ├── usePaperTrading.ts
│   │   │   ├── usePortfolio.ts
│   │   │   └── useMarketData.ts
│   │   │
│   │   ├── store/
│   │   │   ├── walletStore.ts           # Zustand wallet state
│   │   │   ├── tradingStore.ts          # Trading config state
│   │   │   ├── portfolioStore.ts
│   │   │   ├── aiStore.ts               # AI model state
│   │   │   └── uiStore.ts
│   │   │
│   │   ├── lib/
│   │   │   ├── api.ts                   # API client (axios/fetch)
│   │   │   ├── websocket.ts             # WS client factory
│   │   │   ├── formatters.ts            # Currency, % formatters
│   │   │   ├── validators.ts            # Zod schemas
│   │   │   └── constants.ts
│   │   │
│   │   └── types/
│   │       ├── trading.ts
│   │       ├── wallet.ts
│   │       ├── ai.ts
│   │       ├── market.ts
│   │       └── api.ts
│   │
│   └── tests/
│       ├── unit/
│       ├── integration/
│       └── e2e/
│
├── backend/                            # Python FastAPI Backend
│   ├── pyproject.toml
│   ├── requirements.txt
│   ├── alembic.ini
│   │
│   ├── app/
│   │   ├── main.py                     # FastAPI app factory
│   │   ├── config.py                   # Settings (pydantic-settings)
│   │   ├── dependencies.py             # DI: DB, auth, cache
│   │   │
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── router.py
│   │   │   │   ├── auth.py
│   │   │   │   ├── wallet.py
│   │   │   │   ├── trading.py
│   │   │   │   ├── portfolio.py
│   │   │   │   ├── analytics.py
│   │   │   │   ├── ai_signals.py
│   │   │   │   ├── paper_trading.py
│   │   │   │   └── settings.py
│   │   │   │
│   │   │   └── websockets/
│   │   │       ├── price_feed.py       # Live OHLCV stream
│   │   │       ├── signal_feed.py      # AI signal stream
│   │   │       ├── order_feed.py       # Order status stream
│   │   │       └── manager.py          # WS connection manager
│   │   │
│   │   ├── core/
│   │   │   ├── security.py             # JWT, password hashing
│   │   │   ├── exceptions.py
│   │   │   ├── middleware.py
│   │   │   ├── logging.py
│   │   │   └── rate_limiter.py
│   │   │
│   │   ├── models/                     # SQLAlchemy ORM models
│   │   │   ├── base.py
│   │   │   ├── user.py
│   │   │   ├── wallet.py
│   │   │   ├── trade.py
│   │   │   ├── position.py
│   │   │   ├── order.py
│   │   │   ├── portfolio.py
│   │   │   ├── ai_model.py
│   │   │   ├── signal.py
│   │   │   └── paper_trade.py
│   │   │
│   │   ├── schemas/                    # Pydantic schemas (request/response)
│   │   │   ├── wallet.py
│   │   │   ├── trading.py
│   │   │   ├── portfolio.py
│   │   │   ├── ai.py
│   │   │   └── analytics.py
│   │   │
│   │   ├── services/                   # Business logic layer
│   │   │   ├── wallet_service.py
│   │   │   ├── trading_service.py
│   │   │   ├── portfolio_service.py
│   │   │   ├── ai_service.py
│   │   │   ├── paper_trading_service.py
│   │   │   ├── analytics_service.py
│   │   │   └── notification_service.py
│   │   │
│   │   ├── repositories/               # DB access layer
│   │   │   ├── base.py
│   │   │   ├── user_repo.py
│   │   │   ├── wallet_repo.py
│   │   │   ├── trade_repo.py
│   │   │   └── signal_repo.py
│   │   │
│   │   └── tasks/                      # Celery background tasks
│   │       ├── celery_app.py
│   │       ├── ai_training_task.py     # Trigger model retraining
│   │       ├── market_data_task.py     # Periodic data fetch
│   │       ├── paper_trade_task.py     # Run simulation
│   │       ├── reinvestment_task.py    # Auto-compound profits
│   │       └── report_task.py
│   │
│   ├── alembic/                        # DB migrations
│   │   ├── versions/
│   │   └── env.py
│   │
│   └── tests/
│       ├── conftest.py
│       ├── unit/
│       └── integration/
│
├── ai_engine/                          # Standalone AI/ML Module
│   ├── requirements.txt
│   ├── setup.py
│   │
│   ├── alphamind_ai/
│   │   │
│   │   ├── __init__.py
│   │   │
│   │   ├── data/                       # Data ingestion & processing
│   │   │   ├── __init__.py
│   │   │   ├── market_data_fetcher.py  # OHLCV from NSE/BSE/Zerodha
│   │   │   ├── news_scraper.py         # Financial news aggregator
│   │   │   ├── economic_data.py        # RBI, FRED, World Bank APIs
│   │   │   ├── social_sentiment.py     # Twitter/Reddit sentiment
│   │   │   ├── options_chain.py        # NSE options data
│   │   │   ├── order_book.py           # Level 2 data processor
│   │   │   ├── preprocessor.py         # OHLCV normalization
│   │   │   └── feature_store.py        # Feature cache (Redis + S3)
│   │   │
│   │   ├── features/                   # Feature Engineering
│   │   │   ├── __init__.py
│   │   │   ├── technical_features.py   # RSI, MACD, BB, ATR, etc.
│   │   │   ├── candlestick_patterns.py # Doji, hammer, engulfing...
│   │   │   ├── volume_features.py      # OBV, VWAP, MFI
│   │   │   ├── options_features.py     # PCR, IV skew, Greeks
│   │   │   ├── macro_features.py       # GDP, inflation, rates
│   │   │   ├── sentiment_features.py   # NLP-derived sentiment scores
│   │   │   ├── regime_features.py      # Market regime detection
│   │   │   └── feature_selector.py     # SHAP-based importance
│   │   │
│   │   ├── models/                     # AI/ML Models
│   │   │   ├── __init__.py
│   │   │   │
│   │   │   ├── rl/                     # Reinforcement Learning
│   │   │   │   ├── __init__.py
│   │   │   │   ├── trading_env.py      # Custom Gym environment
│   │   │   │   ├── reward_functions.py # Sharpe-based, PnL, Sortino
│   │   │   │   ├── action_space.py     # Buy/Sell/Hold + sizing
│   │   │   │   ├── observation_space.py
│   │   │   │   ├── ppo_agent.py        # PPO (stable short-term)
│   │   │   │   ├── sac_agent.py        # SAC (continuous actions)
│   │   │   │   ├── td3_agent.py        # TD3 (stable long-term)
│   │   │   │   └── ensemble_agent.py   # Voting ensemble of agents
│   │   │   │
│   │   │   ├── forecasting/            # Price/Return Forecasting
│   │   │   │   ├── __init__.py
│   │   │   │   ├── tft_model.py        # Temporal Fusion Transformer
│   │   │   │   ├── lstm_model.py       # LSTM baseline
│   │   │   │   ├── transformer_model.py # Attention-based forecaster
│   │   │   │   ├── xgboost_model.py    # Tree ensemble for features
│   │   │   │   ├── volatility_model.py # GARCH + neural hybrid
│   │   │   │   └── ensemble_forecaster.py
│   │   │   │
│   │   │   ├── nlp/                    # Discretionary AI (LLM-based)
│   │   │   │   ├── __init__.py
│   │   │   │   ├── news_analyzer.py    # News → sentiment + impact
│   │   │   │   ├── earnings_parser.py  # Quarterly results parsing
│   │   │   │   ├── rbi_parser.py       # RBI monetary policy NLP
│   │   │   │   ├── political_monitor.py # Political statements NLP
│   │   │   │   ├── llm_reasoner.py     # LLaMA/Claude market reasoning
│   │   │   │   └── context_builder.py  # Aggregated context for LLM
│   │   │   │
│   │   │   └── regime/                 # Market Regime Detection
│   │   │       ├── __init__.py
│   │   │       ├── hmm_regime.py       # Hidden Markov Model
│   │   │       ├── clustering_regime.py # K-Means regime classifier
│   │   │       └── regime_router.py    # Route to correct model by regime
│   │   │
│   │   ├── training/                   # Training Pipelines
│   │   │   ├── __init__.py
│   │   │   ├── trainer.py              # Main training orchestrator
│   │   │   ├── rl_trainer.py           # RL-specific training loop
│   │   │   ├── forecasting_trainer.py
│   │   │   ├── online_learner.py       # Continuous/online learning
│   │   │   ├── hyperparameter_tuner.py # Optuna search
│   │   │   ├── backtester.py           # Historical strategy backtest
│   │   │   ├── walk_forward.py         # Walk-forward optimization
│   │   │   └── curriculum_scheduler.py # Curriculum RL (easy→hard)
│   │   │
│   │   ├── inference/                  # Inference & Signal Generation
│   │   │   ├── __init__.py
│   │   │   ├── signal_generator.py     # Primary signal: BUY/SELL/HOLD
│   │   │   ├── position_sizer.py       # Kelly Criterion + AI sizing
│   │   │   ├── entry_exit_optimizer.py # Optimal entry/exit timing
│   │   │   ├── model_server.py         # TorchServe wrapper
│   │   │   └── latency_optimizer.py    # ONNX export, quantization
│   │   │
│   │   ├── risk/                       # Risk Management
│   │   │   ├── __init__.py
│   │   │   ├── position_limits.py      # Max position constraints
│   │   │   ├── stop_loss_engine.py     # Dynamic stop losses (ATR-based)
│   │   │   ├── drawdown_monitor.py     # Max drawdown circuit breaker
│   │   │   ├── var_calculator.py       # VaR / CVaR computation
│   │   │   ├── correlation_guard.py    # Correlation-based diversification
│   │   │   ├── regime_risk_adjuster.py # Risk scale by market regime
│   │   │   └── black_swan_guard.py     # Tail-risk event protection
│   │   │
│   │   ├── paper_trading/              # Paper Trading / Simulation
│   │   │   ├── __init__.py
│   │   │   ├── simulator.py            # Core simulation engine
│   │   │   ├── virtual_broker.py       # Mock order execution
│   │   │   ├── slippage_model.py       # Realistic slippage simulation
│   │   │   ├── commission_model.py     # Broker-accurate commissions
│   │   │   ├── market_impact_model.py  # Price impact of large orders
│   │   │   └── forecast_engine.py      # Pre-market P&L forecast
│   │   │
│   │   ├── evaluation/                 # Model & Strategy Evaluation
│   │   │   ├── __init__.py
│   │   │   ├── metrics.py              # Sharpe, Sortino, Calmar, MDD
│   │   │   ├── benchmark_compare.py    # vs Nifty 50, Bank Nifty
│   │   │   ├── attribution.py          # Return attribution by factor
│   │   │   └── explainability.py       # SHAP, LIME explanations
│   │   │
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── time_utils.py
│   │       ├── market_calendar.py      # NSE/BSE trading calendar
│   │       ├── logger.py
│   │       └── cache.py
│   │
│   ├── scripts/
│   │   ├── train_initial_model.py      # One-time full training run
│   │   ├── run_backtest.py
│   │   ├── export_model_onnx.py
│   │   ├── download_historical_data.py
│   │   └── evaluate_model.py
│   │
│   ├── notebooks/                      # Jupyter research notebooks
│   │   ├── 01_data_exploration.ipynb
│   │   ├── 02_feature_analysis.ipynb
│   │   ├── 03_rl_experiments.ipynb
│   │   ├── 04_backtesting_analysis.ipynb
│   │   └── 05_paper_trading_analysis.ipynb
│   │
│   └── tests/
│       ├── test_trading_env.py
│       ├── test_features.py
│       ├── test_risk.py
│       └── test_simulator.py
│
├── hft_engine/                         # C++/Rust HFT Core
│   ├── CMakeLists.txt  (or Cargo.toml for Rust)
│   ├── src/
│   │   ├── main.cpp
│   │   ├── order_manager/
│   │   │   ├── order_manager.hpp
│   │   │   ├── order_manager.cpp
│   │   │   ├── order_book.hpp
│   │   │   └── order_book.cpp
│   │   ├── execution/
│   │   │   ├── execution_engine.hpp
│   │   │   ├── smart_order_router.cpp  # SOR across venues
│   │   │   └── twap_vwap.cpp           # Execution algorithms
│   │   ├── market_data/
│   │   │   ├── fix_handler.cpp         # FIX protocol handler
│   │   │   └── tick_processor.cpp      # Tick data normalizer
│   │   ├── strategy/
│   │   │   ├── hft_strategy_base.hpp
│   │   │   ├── market_making.cpp
│   │   │   └── stat_arb.cpp
│   │   └── risk/
│   │       ├── pre_trade_risk.cpp      # Pre-trade checks (< 1μs)
│   │       └── kill_switch.cpp         # Emergency halt
│   └── tests/
│
├── data_pipeline/                      # Kafka + Spark Data Pipeline
│   ├── docker-compose.kafka.yml
│   ├── producers/
│   │   ├── market_data_producer.py     # OHLCV → Kafka
│   │   ├── news_producer.py            # News → Kafka
│   │   └── social_producer.py
│   ├── consumers/
│   │   ├── feature_consumer.py         # Kafka → feature store
│   │   ├── signal_consumer.py          # Signal events → DB
│   │   └── trade_consumer.py
│   ├── spark_jobs/
│   │   ├── historical_feature_job.py
│   │   ├── daily_aggregation_job.py
│   │   └── backfill_job.py
│   └── schemas/
│       ├── market_event.avsc
│       ├── trade_event.avsc
│       └── signal_event.avsc
│
├── infrastructure/                     # Infrastructure as Code
│   ├── terraform/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   ├── modules/
│   │   │   ├── eks/
│   │   │   ├── rds/
│   │   │   ├── redis/
│   │   │   ├── sagemaker/
│   │   │   └── networking/
│   │   └── environments/
│   │       ├── dev/
│   │       └── prod/
│   │
│   ├── kubernetes/
│   │   ├── namespaces.yaml
│   │   ├── frontend/
│   │   │   ├── deployment.yaml
│   │   │   └── service.yaml
│   │   ├── backend/
│   │   │   ├── deployment.yaml
│   │   │   ├── service.yaml
│   │   │   └── hpa.yaml                # Horizontal Pod Autoscaler
│   │   ├── ai-engine/
│   │   │   ├── training-job.yaml
│   │   │   └── inference-deployment.yaml
│   │   ├── kafka/
│   │   │   └── kafka-cluster.yaml
│   │   └── monitoring/
│   │       ├── grafana.yaml
│   │       └── prometheus.yaml
│   │
│   └── docker/
│       ├── Dockerfile.frontend
│       ├── Dockerfile.backend
│       ├── Dockerfile.ai-engine
│       └── Dockerfile.hft
│
├── monitoring/                         # Observability
│   ├── grafana/
│   │   └── dashboards/
│   │       ├── trading-dashboard.json
│   │       ├── ai-model-dashboard.json
│   │       ├── system-health.json
│   │       └── pnl-dashboard.json
│   ├── prometheus/
│   │   └── prometheus.yml
│   └── alerts/
│       ├── trading-alerts.yaml
│       └── model-drift-alerts.yaml
│
└── scripts/
    ├── setup.sh                        # Local dev setup script
    ├── seed_data.py                    # Seed historical data
    ├── create_admin.py
    └── health_check.sh
```

---

## 5. MODULE SPECIFICATIONS

### 5.1 Frontend / UI Layer

**Philosophy:** All computation happens server-side. The UI is a **display and control terminal** — it receives processed data via WebSocket and REST, never does heavy computation locally.

**Key Design Patterns:**
- **Server-Sent State:** All AI signals, prices, and P&L are server-pushed via WebSocket.
- **Optimistic Updates:** Wallet deposits and config changes update UI immediately; backend confirms.
- **Skeleton Loading:** All data cards show skeleton loaders, never blank states.
- **Mobile Responsive:** Works on tablet and mobile for monitoring on the go.

**Critical Components Behavior:**

```typescript
// ReturnRateSlider component behavior
interface ReturnRateSliderProps {
  min: 2;           // 2% minimum
  max: 40;          // 40% maximum
  aiOptimal: number;   // AI-suggested optimal %  (shown as marker)
  value: number;
  onChange: (value: number) => void;
  tradingType: 'intraday' | 'fno' | 'weekly' | 'monthly' | 'yearly';
}
// The AI optimal marker moves based on trading type, market conditions,
// and the user's historical performance — dynamically fetched from /api/v1/ai/optimal-settings
```

```typescript
// TradingTypeSelector: selects trading horizon
type TradingType = 'intraday' | 'fno' | 'weekly' | 'monthly' | 'yearly';

// Each type loads different:
// - Risk parameters
// - AI model variant (intraday uses HFT-tuned model)
// - Return range recommendations
// - Paper trading simulation window
```

---

### 5.2 Wallet & Fund Management

**Features:**
- Add money via UPI / Bank Transfer / NEFT / IMPS
- Auto-split allocation: Trading Capital vs Reserve vs Profit Buffer
- Profit auto-withdrawal threshold (configurable)
- Profit reinvestment ratio slider (0% to 100%)
- Transaction history with P&L attribution

**Reinvestment Logic:**
```python
class ReinvestmentEngine:
    """
    On every profitable trade close:
    1. Calculate net profit after tax/brokerage
    2. Apply reinvestment_ratio (user-configured)
    3. Add reinvested amount to active trading capital
    4. Withdrawable amount = profit * (1 - reinvestment_ratio)
    5. Log to wallet ledger with trade attribution
    
    Example: ₹1000 profit, 70% reinvestment ratio
    → ₹700 added to trading capital
    → ₹300 moved to withdrawable balance
    → Trading capital compounds over time → higher absolute returns
    """
```

---

### 5.3 Trading Engine (Discretionary + Systematic)

**Hybrid Model:**

| Component | Role | Override Priority |
|-----------|------|-----------------|
| LLM Reasoner | Context-aware decision (news/macro) | Low (advisory) |
| RL Agent | Optimal action from market state | Medium (primary) |
| Forecasting Model | Price direction probability | Medium (supporting) |
| Systematic Rules | Hard position/risk limits | HIGH (cannot be overridden) |

**Trading Types & Configurations:**

```yaml
intraday:
  session: "09:15 - 15:30 IST"
  model: "hft_ppo_agent_v2"
  max_trades_per_day: unlimited (HFT mode)
  position_hold_max: "1 trading session"
  instruments: ["NIFTY", "BANKNIFTY", "top 50 liquid stocks"]
  stop_loss: "0.3% - 1.5% (ATR-dynamic)"
  target: "derived from return_rate slider"

fno:
  session: "09:15 - 15:30 IST"
  model: "options_rl_agent_v1"
  instruments: ["NIFTY options", "BANKNIFTY options", "stock F&O"]
  strategies: ["iron_condor", "bull_spread", "straddle", "directional"]
  greeks_monitor: true
  iv_threshold: configurable

weekly:
  hold_period: "2-5 days"
  model: "swing_tft_v1"
  instruments: ["Nifty 200 stocks", "sector ETFs"]
  
monthly:
  hold_period: "2-4 weeks"
  model: "medium_term_transformer"
  
yearly:
  hold_period: "3-12 months"
  model: "macro_lstm_v1"
  instruments: ["Large-cap index stocks", "Sector leaders", "Gold ETF", "Debt funds"]
```

---

### 5.4 AI / ML Core — Self-Reinforced Learning

See **Section 6** for deep dive. Summary:
- **Primary signal model:** Ensemble RL (PPO + SAC + TD3 voting)
- **Contextual layer:** LLM (LLaMA 3.1 70B fine-tuned on financial corpus)
- **Forecasting:** Temporal Fusion Transformer (multi-horizon)
- **Continuous learning:** Online learning + periodic retraining
- **Market regime routing:** HMM regime detector routes signals to regime-specific models

---

### 5.5 High-Frequency & High-Volume Trading Engine

**Architecture:**
```
Market Data Feed (FIX/WebSocket)
        ↓
  Tick Normalizer (< 100μs)
        ↓
  Feature Computer (real-time indicators)
        ↓
  AI Signal (ONNX quantized model, < 1ms inference)
        ↓
  Pre-Trade Risk Check (< 50μs)
        ↓
  Smart Order Router
        ↓
  Broker API (Kite/IBKR FIX)
```

**HFT Strategies:**
1. **Statistical Arbitrage** — price divergence across correlated instruments
2. **Market Making** — bid-ask spread capture on liquid stocks
3. **Momentum Scalping** — micro-momentum with quick exits
4. **Mean Reversion** — tick-level reversion on high-frequency series

**Compound Reinvestment for HFT:**
```python
# After every N profitable trades (configurable, e.g., every 10 trades):
# 1. Tally net profit from batch
# 2. Apply reinvestment_ratio
# 3. Increase position size ceiling for next batch
# This creates geometric compounding within same session
```

---

### 5.6 Paper Trading & Simulation

**Two Modes:**

**1. Pre-Market Forecast (run before 9:15 AM):**
- Uses yesterday's close + overnight signals + news
- Runs 1000 Monte Carlo simulations on the trained RL agent
- Outputs P&L distribution curve: 10th/50th/90th percentile
- Shows predicted trades, entry/exit levels, expected drawdown

**2. Shadow Live Mode (parallel to real trading):**
- Runs paper portfolio in parallel with real portfolio
- Uses same signals but virtual execution
- Helps validate AI confidence before scaling real capital
- Paper results feed back into training as additional samples

**Simulation Realism:**
- Zerodha-accurate brokerage + STT + GST
- Slippage model based on historical bid-ask spread
- Market impact model for large orders
- Circuit breaker simulation (upper/lower limit hits)

---

### 5.7 Data Ingestion Pipeline

**Data Sources:**

| Source | Data Type | Frequency | API/Method |
|--------|-----------|-----------|------------|
| Zerodha Kite | OHLCV, order book | Real-time (tick) | WebSocket |
| NSE Website | Options chain, FII/DII data | Every 5 min | Web scrape / NSE API |
| Yahoo Finance / yfinance | Historical OHLCV | Daily batch | Python API |
| NewsAPI / GNews | Financial news | Every 15 min | REST API |
| RBI Website | Monetary policy, rates | Event-driven | RSS + scrape |
| FRED (Federal Reserve) | Global macro | Daily | FRED API |
| Twitter/X API | Market sentiment | Real-time | v2 Streaming API |
| Reddit (r/IndiaInvestments) | Retail sentiment | Hourly | Pushshift / API |
| Google Trends | Symbol interest | Daily | pytrends |
| Corporate BSE/NSE filings | Earnings, announcements | Event-driven | BSE/NSE XML feeds |

---

### 5.8 Risk Management System

**Multi-Layer Risk Architecture:**

```
Layer 1: Pre-Signal Risk (AI model constraints)
  - Max single position: 5% of capital (configurable)
  - Correlation constraint: no two positions > 0.85 corr
  - Regime-based risk scaling (reduce size in high-VIX regime)

Layer 2: Pre-Order Risk (systematic rules engine)
  - Daily loss limit: 2% of capital (hard stop, configurable)
  - Max open positions: 10 concurrent (configurable)
  - Instrument-level position limit check
  - Margin availability check

Layer 3: In-Trade Risk (real-time monitoring)
  - Dynamic stop loss: 1.5x ATR trailing stop
  - Time-based exit: auto-close intraday positions by 15:15
  - Adverse movement guard: if position -X%, trigger review

Layer 4: Portfolio Risk (end-of-day)
  - Max drawdown circuit breaker: halt trading at -10% monthly DD
  - Rebalancing trigger if allocation drifts >5%
  - VaR breach alert

Layer 5: AI Risk Override
  - If AI confidence score < 0.6, reduce position size by 50%
  - If conflicting signals (RL vs LLM), take minimum position
  - Black swan detection via abnormal volatility filter
```

---

### 5.9 Cloud & Hybrid Compute Layer

**Strategy:**
- **Training:** AWS SageMaker (GPU instances: ml.p3.2xlarge or ml.g4dn.xlarge) or Google Colab Pro for development
- **Inference:** Local GPU (your machine) for real-time inference (<1ms needed); fallback to cloud if local offline
- **Data:** TimescaleDB on AWS RDS; historical data on S3
- **Edge Cache:** Redis running locally for sub-millisecond signal lookups

**Training Schedule:**
```
Daily (after market close, 16:00-18:00):
  - Online learning update with today's trades
  - Hyperparameter micro-adjustment via Optuna (5-10 trials)
  - Paper trading simulation run for next day

Weekly (Saturday):
  - Full model retraining on 6-month rolling window
  - Walk-forward validation on last 4 weeks
  - Model promotion if metrics improve (MLflow gate)

Monthly:
  - Full architecture search if performance degrades
  - LLM fine-tuning on latest financial corpus
  - Strategy regime recalibration
```

---

### 5.10 Broker Integration Layer

**Abstract Interface:**
```python
class BrokerInterface(ABC):
    @abstractmethod
    async def place_order(self, order: Order) -> OrderResult: ...
    
    @abstractmethod
    async def cancel_order(self, order_id: str) -> bool: ...
    
    @abstractmethod
    async def get_positions(self) -> List[Position]: ...
    
    @abstractmethod
    async def get_funds(self) -> Funds: ...
    
    @abstractmethod
    async def subscribe_ticks(self, symbols: List[str], callback): ...

class ZerodhaKiteBroker(BrokerInterface): ...
class UpstoxBroker(BrokerInterface): ...
class PaperBroker(BrokerInterface): ...  # For paper trading
```

---

### 5.11 Portfolio & Return Analytics

**Metrics Tracked:**
- Cumulative P&L (absolute ₹ and %)
- Sharpe Ratio, Sortino Ratio, Calmar Ratio
- Maximum Drawdown (MDD) and recovery time
- Win rate, average win/loss, profit factor
- Alpha and Beta vs Nifty 50
- Trade-by-trade attribution
- Model confidence correlation with actual outcome (tracks AI quality)
- Compounding curve: shows projected growth of reinvested profits

---

## 6. AI MODEL ARCHITECTURE DEEP DIVE

### 6.1 Trading Environment (Gymnasium)

```python
class AlphaMindTradingEnv(gym.Env):
    """
    Custom RL environment for AlphaMind.
    
    Observation Space (state vector, ~500 features):
    - OHLCV (5 timeframes: 1m, 5m, 15m, 1h, 1d) → 25 features
    - Technical indicators (RSI, MACD, BB, ATR, OBV...) → 50 features
    - Candlestick patterns (one-hot encoded) → 30 features
    - Volume profile (VWAP, volume nodes) → 10 features
    - Options data (PCR, IV, max pain) → 20 features
    - Order book depth (bid/ask imbalance) → 10 features
    - Macro indicators (VIX India, DXY, Nifty PE) → 15 features
    - Sentiment scores (news, social) → 10 features
    - Market regime (one-hot: trending/ranging/volatile) → 3 features
    - Account state (capital, open positions, unrealized PnL) → 10 features
    - Time features (day of week, time of day, days to expiry) → 8 features
    - LLM context embedding (512-dim compressed) → 64 features
    Total: ~255 core + 64 LLM = ~320 features (with expansion to 500)
    
    Action Space (continuous):
    - action[0]: direction (-1 = short, 0 = hold, 1 = long)
    - action[1]: position_size (0.0 to 1.0 of max allowed capital)
    - action[2]: stop_loss_distance (ATR multiplier: 0.5 to 3.0)
    - action[3]: take_profit_distance (reward/risk ratio: 1.0 to 5.0)
    
    Reward Function (multi-objective):
    reward = (
        sharpe_contribution * 0.4 +    # Risk-adjusted return
        pnl_normalized * 0.3 +          # Raw P&L
        drawdown_penalty * (-0.2) +     # Penalize drawdowns
        trade_cost_penalty * (-0.1)     # Penalize over-trading
    )
    """
```

### 6.2 Model Ensemble Architecture

```
Input Features (320-dim)
         │
         ├──────────────────────────────────┐
         ▼                                  ▼
  ┌─────────────┐                  ┌──────────────────┐
  │  PPO Agent  │                  │  SAC Agent       │
  │  (Short-    │                  │  (Continuous     │
  │   term HFT) │                  │   actions, swing)│
  └──────┬──────┘                  └────────┬─────────┘
         │                                  │
         └──────────────┬───────────────────┘
                        │
               ┌────────▼────────┐
               │  TD3 Agent      │
               │  (Stable long-  │
               │   term trades)  │
               └────────┬────────┘
                        │
               ┌────────▼────────┐
               │ Ensemble Voter  │
               │ (weighted avg   │
               │  by recent      │
               │  performance)   │
               └────────┬────────┘
                        │
         ┌──────────────┤
         ▼              ▼
  [LLM Context]   [Forecasting TFT]
  (veto power     (confidence boost
   for macro       for directional
   events)         signals)
         │              │
         └──────┬───────┘
                ▼
        Final Signal + Size
                │
         Risk Manager
         (apply limits)
                │
         Order Execution
```

### 6.3 LLM Discretionary Layer

```python
class LLMMarketReasoner:
    """
    Uses LLaMA 3.1 70B (fine-tuned on financial corpus) or
    Claude API (via Anthropic) for zero-shot market reasoning.
    
    Input Context Window (built by context_builder.py):
    - Last 10 news headlines with timestamps
    - Economic calendar events for today/tomorrow
    - RBI/Fed recent statements summary
    - Current market breadth and sector rotation
    - Any political/geopolitical events
    - Current portfolio state
    
    Output (structured JSON):
    {
      "market_sentiment": "bullish|bearish|neutral",
      "confidence": 0.0-1.0,
      "key_risks": ["string"],
      "suggested_sectors": ["IT", "Banking"],
      "avoid_sectors": ["PSU", "Metals"],
      "veto_trade": false,  // if true, blocks RL agent trade
      "reasoning": "string"  // human-readable explanation
    }
    
    The LLM output modifies RL agent position size:
    - bullish + high confidence → scale up RL position by 1.2x
    - bearish + high confidence → scale down by 0.7x, add hedge
    - veto_trade = true → cancel current RL signal
    """
```

### 6.4 Temporal Fusion Transformer (Forecasting)

```python
class AlphaMindTFT:
    """
    Multi-horizon price forecasting using TFT architecture.
    
    Inputs:
    - Static covariates: symbol, sector, market cap
    - Known future inputs: economic calendar, options expiry dates
    - Historical inputs: OHLCV + all technical features (60 timesteps)
    
    Outputs:
    - Price return forecast: next 1/5/15/30/60 minutes
    - Confidence interval: 10th, 50th, 90th percentile
    - Interpretable attention weights (shows which features matter)
    
    Integration with RL:
    - TFT forecast directional probability → added to RL observation
    - High-confidence TFT forecast → increase RL position size
    - TFT says reversal coming → RL agent reduces position early
    """
```

### 6.5 Online / Continuous Learning

```python
class OnlineLearner:
    """
    Updates model after every closed trade without full retraining.
    
    Mechanism:
    1. Trade closes → record (state, action, reward, next_state)
    2. Add to replay buffer (max 100,000 experiences, FIFO)
    3. Every N closed trades (default: 10), run mini-batch update
    4. Use small learning rate (1e-5) to prevent catastrophic forgetting
    5. Experience Replay with Prioritized Sampling (PER) — 
       recent high-reward/high-loss trades sampled more frequently
    6. Model weights saved with versioning in MLflow
    
    Safety gates:
    - If validation Sharpe drops >15% after update → rollback
    - Model drift detector (statistical test on prediction distribution)
    - A/B shadow testing before promoting updated model to live
    """
```

---

## 7. DATABASE SCHEMA

### Core Tables (TimescaleDB / PostgreSQL)

```sql
-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR UNIQUE NOT NULL,
    password_hash VARCHAR NOT NULL,
    2fa_secret VARCHAR,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wallet
CREATE TABLE wallet_accounts (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    balance NUMERIC(18, 2) DEFAULT 0,
    trading_capital NUMERIC(18, 2) DEFAULT 0,
    reserve_balance NUMERIC(18, 2) DEFAULT 0,
    withdrawable_balance NUMERIC(18, 2) DEFAULT 0,
    total_deposited NUMERIC(18, 2) DEFAULT 0,
    total_withdrawn NUMERIC(18, 2) DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wallet Transactions
CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY,
    wallet_id UUID REFERENCES wallet_accounts(id),
    type VARCHAR NOT NULL,  -- deposit/withdrawal/trade_profit/reinvestment
    amount NUMERIC(18, 2),
    balance_after NUMERIC(18, 2),
    reference_id UUID,      -- trade_id if from trade
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trading Configuration (per user)
CREATE TABLE trading_configs (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    trading_type VARCHAR NOT NULL,  -- intraday/fno/weekly/monthly/yearly
    target_return_rate NUMERIC(5,2),  -- 2-40%
    is_hft_enabled BOOLEAN DEFAULT false,
    reinvestment_ratio NUMERIC(4,2) DEFAULT 0.7,  -- 70%
    is_paper_trading BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders (Hypertable for time-series performance)
CREATE TABLE orders (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    broker_order_id VARCHAR,
    symbol VARCHAR NOT NULL,
    exchange VARCHAR NOT NULL,
    order_type VARCHAR,    -- market/limit/sl/sl-m
    transaction_type VARCHAR,  -- buy/sell
    quantity INTEGER,
    price NUMERIC(10, 2),
    trigger_price NUMERIC(10, 2),
    status VARCHAR,        -- pending/open/complete/cancelled/rejected
    ai_signal_id UUID,
    created_at TIMESTAMPTZ NOT NULL
);
SELECT create_hypertable('orders', 'created_at');

-- Trades (closed positions)
CREATE TABLE trades (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    symbol VARCHAR NOT NULL,
    entry_price NUMERIC(10, 4),
    exit_price NUMERIC(10, 4),
    quantity INTEGER,
    pnl NUMERIC(14, 4),
    pnl_pct NUMERIC(8, 4),
    brokerage NUMERIC(10, 4),
    net_pnl NUMERIC(14, 4),
    entry_time TIMESTAMPTZ,
    exit_time TIMESTAMPTZ,
    trading_type VARCHAR,
    ai_confidence NUMERIC(4, 3),  -- 0-1
    model_version VARCHAR,
    entry_reason JSONB,   -- {rl_signal, llm_context, tft_confidence}
    exit_reason VARCHAR,  -- stop_loss/target/time/signal_reversal
    created_at TIMESTAMPTZ DEFAULT NOW()
);
SELECT create_hypertable('trades', 'created_at');

-- OHLCV Market Data
CREATE TABLE ohlcv (
    symbol VARCHAR NOT NULL,
    exchange VARCHAR NOT NULL,
    timeframe VARCHAR NOT NULL,  -- 1m/5m/15m/1h/1d
    timestamp TIMESTAMPTZ NOT NULL,
    open NUMERIC(10, 4),
    high NUMERIC(10, 4),
    low NUMERIC(10, 4),
    close NUMERIC(10, 4),
    volume BIGINT,
    PRIMARY KEY (symbol, exchange, timeframe, timestamp)
);
SELECT create_hypertable('ohlcv', 'timestamp');

-- AI Signals
CREATE TABLE ai_signals (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    symbol VARCHAR NOT NULL,
    direction VARCHAR,    -- long/short/hold
    confidence NUMERIC(4, 3),
    position_size_pct NUMERIC(5, 3),
    entry_price NUMERIC(10, 4),
    stop_loss NUMERIC(10, 4),
    take_profit NUMERIC(10, 4),
    model_version VARCHAR,
    rl_action JSONB,
    llm_context JSONB,
    tft_forecast JSONB,
    created_at TIMESTAMPTZ NOT NULL,
    acted_on BOOLEAN DEFAULT false
);
SELECT create_hypertable('ai_signals', 'created_at');

-- Model Performance
CREATE TABLE model_performance (
    id UUID PRIMARY KEY,
    model_version VARCHAR NOT NULL,
    evaluation_date DATE,
    sharpe_ratio NUMERIC(8, 4),
    sortino_ratio NUMERIC(8, 4),
    max_drawdown NUMERIC(6, 4),
    win_rate NUMERIC(6, 4),
    profit_factor NUMERIC(8, 4),
    total_trades INTEGER,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Paper Trades
CREATE TABLE paper_trades (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    simulation_id UUID NOT NULL,
    symbol VARCHAR,
    pnl NUMERIC(14, 4),
    simulation_type VARCHAR,  -- pre_market/shadow_live
    actual_pnl NUMERIC(14, 4),  -- filled after market close
    accuracy NUMERIC(5, 4),     -- predicted vs actual
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 8. API SPECIFICATION

### REST Endpoints

```
Authentication
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/2fa/setup
POST   /api/v1/auth/2fa/verify

Wallet
GET    /api/v1/wallet
POST   /api/v1/wallet/deposit
POST   /api/v1/wallet/withdraw
GET    /api/v1/wallet/transactions?limit=50&offset=0
PUT    /api/v1/wallet/reinvestment-ratio

Trading Configuration
GET    /api/v1/trading/config
POST   /api/v1/trading/config
PUT    /api/v1/trading/config/{id}
POST   /api/v1/trading/start
POST   /api/v1/trading/stop
GET    /api/v1/trading/status

AI & Signals
GET    /api/v1/ai/signals?symbol=NIFTY&limit=20
GET    /api/v1/ai/optimal-settings          # AI-recommended slider values
GET    /api/v1/ai/market-outlook            # LLM market commentary
GET    /api/v1/ai/model-status              # Training status, version, metrics
POST   /api/v1/ai/retrain                   # Trigger manual retraining

Portfolio
GET    /api/v1/portfolio
GET    /api/v1/portfolio/positions
GET    /api/v1/portfolio/performance?from=2025-01-01&to=2026-03-17
GET    /api/v1/portfolio/trades?type=intraday&limit=100

Paper Trading
POST   /api/v1/paper-trading/simulate       # Run pre-market simulation
GET    /api/v1/paper-trading/results/{simulation_id}
GET    /api/v1/paper-trading/history

Analytics
GET    /api/v1/analytics/pnl?period=monthly
GET    /api/v1/analytics/metrics
GET    /api/v1/analytics/drawdown
GET    /api/v1/analytics/compounding-projection
```

### WebSocket Channels

```
ws://localhost:8000/ws/prices/{symbol}       # Real-time OHLCV ticks
ws://localhost:8000/ws/signals               # AI signal stream (all symbols)
ws://localhost:8000/ws/orders                # Order status updates
ws://localhost:8000/ws/portfolio             # Portfolio value changes
ws://localhost:8000/ws/paper-trading/{id}   # Live paper trade updates
```

---

## 9. SELF-REINFORCEMENT LEARNING LOOP

```
                    ┌─────────────────────────────────────────────────┐
                    │              CONTINUOUS LEARNING LOOP            │
                    └─────────────────────────────────────────────────┘
                                          │
                    ┌─────────────────────▼──────────────────────────┐
                    │  1. MARKET OBSERVATION                          │
                    │     Collect state vector (320 features)         │
                    │     at signal generation time                   │
                    └──────────────────────┬─────────────────────────┘
                                           │
                    ┌──────────────────────▼─────────────────────────┐
                    │  2. ACTION                                      │
                    │     RL Agent selects: direction, size, SL, TP  │
                    │     LLM layer approves/modifies/vetoes          │
                    └──────────────────────┬─────────────────────────┘
                                           │
                    ┌──────────────────────▼─────────────────────────┐
                    │  3. TRADE EXECUTION                             │
                    │     Order placed via broker                     │
                    │     Monitored in real-time                      │
                    └──────────────────────┬─────────────────────────┘
                                           │
                    ┌──────────────────────▼─────────────────────────┐
                    │  4. REWARD CALCULATION (on trade close)         │
                    │     reward = Sharpe(0.4) + PnL(0.3)            │
                    │            - Drawdown(0.2) - Costs(0.1)        │
                    └──────────────────────┬─────────────────────────┘
                                           │
                    ┌──────────────────────▼─────────────────────────┐
                    │  5. EXPERIENCE STORAGE                          │
                    │     (state, action, reward, next_state, done)  │
                    │     → Prioritized Replay Buffer                 │
                    └──────────────────────┬─────────────────────────┘
                                           │
                    ┌──────────────────────▼─────────────────────────┐
                    │  6. MINI-BATCH UPDATE (every 10 trades)        │
                    │     Sample from replay buffer                   │
                    │     Backprop with Adam optimizer (lr=1e-5)     │
                    │     Gradient clipping to prevent instability    │
                    └──────────────────────┬─────────────────────────┘
                                           │
                    ┌──────────────────────▼─────────────────────────┐
                    │  7. MODEL VALIDATION                            │
                    │     Test updated model on last 20 days          │
                    │     If Sharpe improved → promote to live        │
                    │     If Sharpe dropped >15% → rollback           │
                    └──────────────────────┬─────────────────────────┘
                                           │
                    └──────────────────────┘ (loop back to step 1)
```

---

## 10. UI/UX LAYOUT SPECIFICATION

### Main Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  ALPHAMIND                    [Paper Mode] [Live Mode] [Settings]│
├──────────┬──────────────────────────────────────────────────────┤
│          │  ┌─────────────┐ ┌─────────────┐ ┌───────────────┐  │
│ Sidebar  │  │ Wallet Card  │ │ Today P&L   │ │ AI Status     │  │
│          │  │ ₹ 1,24,500  │ │ +₹ 2,341    │ │ 🟢 Active v7  │  │
│ Dashboard│  │ [+ Add Money]│ │ +1.91%      │ │ Sharpe: 2.1   │  │
│          │  └─────────────┘ └─────────────┘ └───────────────┘  │
│ Wallet   │                                                        │
│          │  ┌─────────────────────────────────────────────────┐  │
│ Trading  │  │           NIFTY50 Candlestick Chart              │  │
│          │  │        [AI Signal overlays: ▲ ▼ markers]        │  │
│ Paper    │  │                                                   │  │
│          │  └─────────────────────────────────────────────────┘  │
│ Analytics│                                                        │
│          │  ┌────────────────────┐  ┌────────────────────────┐  │
│ Settings │  │  TRADING SETUP     │  │  AI MARKET OUTLOOK     │  │
│          │  │                    │  │                         │  │
│          │  │ Type:              │  │ 🔴 BEARISH BIAS         │  │
│          │  │ [Intraday] [F&O]   │  │ "RBI rate decision     │  │
│          │  │ [Weekly] [Monthly] │  │  expected hawkish.     │  │
│          │  │ [Yearly]           │  │  Reduce IT/FMCG        │  │
│          │  │                    │  │  exposure."            │  │
│          │  │ Return Target:     │  │                         │  │
│          │  │ ──●────────────── │  │ Confidence: 74%        │  │
│          │  │  2%  AI▲   40%    │  └────────────────────────┘  │
│          │  │      15%          │                               │  │
│          │  │                    │  ┌────────────────────────┐  │
│          │  │ [▶ Start Trading]  │  │  OPEN POSITIONS (3)    │  │
│          │  └────────────────────┘  │  NIFTY CE +2.3%  ●    │  │
│          │                          │  TCS    -0.4%    ●    │  │
│          │                          │  HDFC   +1.1%    ●    │  │
│          │                          └────────────────────────┘  │
└──────────┴──────────────────────────────────────────────────────┘
```

### Trading Setup Page — Key UI Elements

**1. Add Money Section:**
```
┌─────────────────────────────────────────┐
│  💰 Wallet Balance                       │
│  Available: ₹ 1,24,500                  │
│  Trading Capital: ₹ 95,000              │
│  Withdrawable Profit: ₹ 29,500          │
│                                          │
│  [+ Add Money]  [Withdraw]              │
│                                          │
│  Reinvestment Ratio: 70%                │
│  ─────────────●──────────               │
│  0%                      100%           │
└─────────────────────────────────────────┘
```

**2. Trading Type Selector:**
```
┌─────────────────────────────────────────────────────────┐
│  SELECT TRADING TYPE                                      │
│                                                           │
│  ┌──────────┐ ┌──────────┐ ┌────────┐ ┌────────────┐   │
│  │ INTRADAY │ │ F&O      │ │ WEEKLY │ │  MONTHLY   │   │
│  │ ⚡ HFT   │ │ Options  │ │ Swing  │ │ Position   │   │
│  │ Selected │ │ Futures  │ │        │ │            │   │
│  └──────────┘ └──────────┘ └────────┘ └────────────┘   │
│  ┌──────────┐                                            │
│  │  YEARLY  │                                            │
│  │ Long-term│                                            │
│  └──────────┘                                            │
└─────────────────────────────────────────────────────────┘
```

**3. Return Rate Slider with AI Marker:**
```
┌─────────────────────────────────────────────────────────┐
│  TARGET RETURN RATE                                       │
│                                                           │
│  ← 2%  ─────────────────●──────────────────────  40% → │
│                          │ ↑                             │
│                         18%                              │
│                     [AI Optimal: 12%]                    │
│                          ▲ (shown as gold marker)        │
│                                                           │
│  ⚠️  Higher targets = Higher risk. AI optimal balances   │
│     Sharpe ratio with realistic market conditions.        │
│                                                           │
│  Current: 18% | AI Suggests: 12%                        │
│  [Use AI Setting]                                        │
└─────────────────────────────────────────────────────────┘
```

---

## 11. TRADING STRATEGY DEFINITIONS

### 11.1 Intraday (HFT Mode)

**Objective:** Capture intraday micro-trends on Nifty, BankNifty, and top 50 liquid stocks.

**Signal Stack:**
1. Volume spike detection (> 2x 20-period avg volume)
2. Momentum confirmation (RSI > 60 for long, < 40 for short)
3. Price action pattern (breakout, breakdown, reversal)
4. Options flow alignment (PCR, unusual options activity)
5. AI signal: RL agent final verdict

**Execution:**
- Entry: Market order at signal + 0.01% slippage buffer
- Stop Loss: 1.5x ATR (5-min chart)
- Target: 3x ATR (3:1 risk-reward minimum)
- Time exit: Square off all positions by 15:15 IST

### 11.2 Futures & Options (F&O)

**Strategies:**
- **Directional:** Buy calls/puts based on AI signal
- **Iron Condor:** Range-bound market regime → collect premium
- **Bull Call Spread:** Moderate bullish AI signal
- **Straddle (event-based):** High-uncertainty events (RBI, budget)
- **Delta Hedging:** Real-time hedge for large directional positions

**Risk:** Max 20% capital in F&O. Options limited to 2 lots per strike initially.

### 11.3 Weekly Swing

**Objective:** Capture 3-7 day trends using momentum + fundamental filters.

**Signals:**
- Daily chart momentum (EMA crossovers, MACD)
- Weekly pivot levels
- Sector rotation signals (relative strength vs Nifty)
- LLM fundamental scan (earnings, news, sector tailwinds)

### 11.4 Monthly & Yearly Position

**Objective:** Compound returns through medium-to-long-term trend following.

**Signals:**
- Monthly chart analysis
- Macro regime (interest rates, inflation, earnings cycle)
- Nifty PE ratio historical context
- Sector allocation (based on economic cycle phase)

---

## 12. SECURITY ARCHITECTURE

```
Authentication: JWT (access: 15min) + Refresh Token (30 days)
2FA: TOTP via Google Authenticator / Authy
API Security: Rate limiting, CORS, HTTPS enforced
Broker Credentials: AWS Secrets Manager (never in .env in prod)
Data Encryption: AES-256 at rest, TLS 1.3 in transit
Order Signing: HMAC signature on all broker API calls
Audit Logs: All order mutations logged with IP, timestamp, user
Kill Switch: One-click emergency halt via UI → cancels all open orders
Session Management: Redis-backed session store, force logout on suspicious activity
```

---

## 13. DEPLOYMENT PIPELINE

```
Developer Push → GitHub
      ↓
GitHub Actions: lint + unit tests + type check
      ↓
Build Docker images (frontend, backend, ai-engine)
      ↓
Push to AWS ECR (container registry)
      ↓
ArgoCD detects new image → deploys to EKS (Kubernetes)
      ↓
Smoke test on staging environment
      ↓
Manual approval gate (for production)
      ↓
Rolling deployment to production EKS
      ↓
Grafana health dashboard auto-checks
```

---

## 14. ENVIRONMENT VARIABLES & CONFIG

```bash
# .env.example — copy to .env.local and fill in

# App
APP_ENV=development  # development / staging / production
APP_SECRET_KEY=your-secret-key-here
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/alphamind
REDIS_URL=redis://localhost:6379/0

# Broker APIs
ZERODHA_API_KEY=
ZERODHA_API_SECRET=
ZERODHA_ACCESS_TOKEN=  # Refreshed daily via Kite auth

UPSTOX_API_KEY=
UPSTOX_API_SECRET=

# AI APIs
ANTHROPIC_API_KEY=          # Claude API for LLM layer
OPENAI_API_KEY=              # Optional fallback
HUGGINGFACE_TOKEN=           # For model downloads

# Data APIs
NEWSAPI_KEY=
FRED_API_KEY=
TWITTER_BEARER_TOKEN=

# Cloud
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=ap-south-1
S3_BUCKET=alphamind-data
SAGEMAKER_ROLE_ARN=

# MLflow
MLFLOW_TRACKING_URI=http://localhost:5000
MLFLOW_EXPERIMENT_NAME=alphamind-trading

# Monitoring
GRAFANA_API_KEY=
SENTRY_DSN=

# Feature Flags
ENABLE_HFT=true
ENABLE_PAPER_TRADING=true
ENABLE_AUTO_REINVESTMENT=true
MAX_DAILY_LOSS_PCT=2.0
MAX_DRAWDOWN_PCT=10.0
```

---

## 15. TESTING STRATEGY

### Test Pyramid

```
              /\
             /  \    E2E Tests (Playwright)
            /────\   UI flows: deposit, configure, paper trade
           /      \
          /────────\  Integration Tests (pytest + httpx)
         /          \ API endpoints, DB, WebSocket
        /────────────\
       /              \ Unit Tests (pytest, Jest/Vitest)
      /────────────────\ All core logic: features, risk, RL env
     /                  \
    /────────────────────\ Backtests (custom)
   /                      \ Strategy validation on 5y historical data
  └──────────────────────────┘
```

**Critical Test Cases:**
- `test_risk_daily_loss_limit`: Assert trading halts when daily loss hits threshold
- `test_reinvestment_compounding`: Verify profit correctly added to capital
- `test_rl_env_reward`: Reward function returns expected value for known trade outcomes
- `test_paper_trade_slippage`: Slippage model within ±20% of historical actual
- `test_order_rejection_handling`: Broker rejection handled gracefully
- `test_kill_switch`: Emergency halt cancels all open orders < 500ms

---

## 16. ROADMAP & MILESTONES

```
Phase 1 — Foundation (Weeks 1-4)
  ✓ Project setup, Docker, DB schema, basic API
  ✓ Zerodha Kite integration (paper mode)
  ✓ Frontend: Login, wallet, basic dashboard
  ✓ Historical data download (5 years NSE data)

Phase 2 — AI Core (Weeks 5-10)
  ✓ Feature engineering pipeline
  ✓ RL trading environment (Gymnasium)
  ✓ PPO agent initial training on historical data
  ✓ TFT forecasting model training
  ✓ Backtesting harness

Phase 3 — Discretionary Layer (Weeks 11-14)
  ✓ News ingestion + sentiment NLP
  ✓ LLM integration (Claude/LLaMA)
  ✓ Market regime detection (HMM)
  ✓ Ensemble signal generation

Phase 4 — Paper Trading (Weeks 15-17)
  ✓ Paper trading simulator
  ✓ Pre-market simulation (Monte Carlo)
  ✓ Shadow live paper portfolio
  ✓ Simulation vs actual accuracy tracking

Phase 5 — HFT Engine (Weeks 18-22)
  ✓ C++ order manager
  ✓ FIX protocol handler
  ✓ Pre-trade risk checks
  ✓ ONNX model export for < 1ms inference
  ✓ Backtesting HFT strategy

Phase 6 — Live Trading Alpha (Weeks 23-26)
  ✓ Live trading with ₹ 5,000 test capital
  ✓ Full monitoring (Grafana)
  ✓ Online learning loop active
  ✓ Auto-reinvestment working

Phase 7 — Production & Scale (Weeks 27-32)
  ✓ Kubernetes deployment
  ✓ Cloud AI training pipeline
  ✓ Full F&O strategies activated
  ✓ Mobile-responsive UI complete

Phase 8 — Continuous Improvement (Ongoing)
  → Monthly model retraining
  → New data sources integration
  → Strategy expansion (commodities, crypto)
  → Multi-user support (optional)
```

---

## 17. REGULATORY COMPLIANCE NOTES

> **IMPORTANT:** Read before going live.

1. **SEBI Registration:** Algorithmic trading on Indian exchanges requires broker-approved algo registration. Use Zerodha's Streak / Pi Bridge or submit algo strategy for exchange approval.

2. **Taxation:** STCG (15%) for intraday/F&O profits. LTCG (10% above ₹1L) for positional. Maintain trade ledger for ITR filing. Integrate a tax P&L export feature.

3. **Audit Trail:** SEBI mandates complete trade logs with timestamps. TimescaleDB schema above ensures this.

4. **Risk Disclaimers:** UI must display: "Algorithmic trading involves substantial risk of loss."

5. **Broker TOS:** Ensure HFT strategies comply with Zerodha/IBKR terms. Very high-frequency scraping of NSE data may require licensing.

6. **Data Privacy:** Store user financial data per India DPDP Act 2023 requirements.

---

## 18. GLOSSARY

| Term | Definition |
|------|-----------|
| RL | Reinforcement Learning — AI learns by trial and reward |
| PPO | Proximal Policy Optimization — stable RL algorithm |
| SAC | Soft Actor-Critic — entropy-regularized RL for continuous actions |
| TD3 | Twin Delayed Deep Deterministic Policy Gradient — stable off-policy RL |
| TFT | Temporal Fusion Transformer — multi-horizon time-series model |
| HFT | High-Frequency Trading — very high volume, very short holding periods |
| F&O | Futures and Options — derivative instruments |
| PCR | Put-Call Ratio — options market sentiment indicator |
| ATR | Average True Range — volatility measure for stop-loss sizing |
| VWAP | Volume Weighted Average Price — intraday benchmark |
| SOR | Smart Order Router — routes orders to best execution venue |
| MDD | Maximum Drawdown — largest peak-to-trough portfolio decline |
| VaR | Value at Risk — probability-weighted maximum loss estimate |
| CVaR | Conditional VaR — expected loss beyond VaR threshold |
| HMM | Hidden Markov Model — statistical model for market regime detection |
| ONNX | Open Neural Network Exchange — model format for fast inference |
| Online Learning | Updating model incrementally on new data without full retraining |
| Curriculum RL | Training RL agent on progressively harder market scenarios |
| Kelly Criterion | Optimal position sizing formula based on edge and win rate |
| Sharpe Ratio | Return per unit of risk (higher = better) |
| Sortino Ratio | Sharpe but only penalizes downside volatility |
| Calmar Ratio | Annual return divided by maximum drawdown |
| Walk-Forward | Validation method: train on past, test on rolling future windows |

---

*End of AlphaMind Project Blueprint v1.0*

*This document is the single source of truth for all development decisions. Every module, file, and function referenced here should be implemented in the order specified in the Roadmap (Section 16). Begin with Phase 1 and do not skip ahead — each phase builds on the last.*

*Good luck. Build something extraordinary.*
