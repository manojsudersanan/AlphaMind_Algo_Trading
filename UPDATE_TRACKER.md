# AlphaMind Update Tracker

This document tracks all major updates, algorithms researched, and code changes made to the AlphaMind project. 
It also provides explicit instructions on how to rollback changes if something breaks.

## Rollback Instructions
If any update causes system instability, you can undo changes using Git.

1. **To see previous stable states**:
   Run `git log --oneline` in the terminal to view the commit history.
2. **To rollback to a specific commit**:
   Run `git checkout <commit-hash>`.
3. **To discard uncommitted changes**:
   Run `git restore .` (warning: this will delete uncommitted modifications).

---

## Log of Updates

### [2026-05-14] Stable Baseline Verification
* **Changes:** Verified dashboard stability and API authentication flows. Saved the current state as a Git commit (`Stable baseline before advanced algorithmic integration`).
* **Git Commit Message:** `Stable baseline before advanced algorithmic integration`
* **Status:** Stable

### [2026-05-14] Market Intelligence Feed Update
* **Goal:** Update the `news.py` backend endpoint to fetch current-day real-world news relevant to the Indian stock market (NIFTY/BANKNIFTY) to use in the paper trading simulator.
* **Changes:** Refactored `backend/app/services/news_intelligence.py` to correctly supply a HTTP `User-Agent` and query multiple real-time endpoints (e.g. `indian+stock+market+nifty`) on Google News RSS. This natively guarantees today's live data is populated into the market scanner.
* **Git Commit Message:** `feat: integrate live google news RSS for real-world intelligence`
* **Status:** Completed

### [2026-05-14] Advanced Algorithmic Deep Research
* **Goal:** Research the highest efficacy predictive trading algorithms (TimeGPT, Lag-Llama, Transformers vs. PPO/SAC Reinforcement Learning) across academic papers (Google Scholar, GitHub). 
* **Changes:** Extracted findings from academic and repository trends into a comprehensive markdown document detailing SOTA hybrid systems, Ensemble MLOps, and DRL with Transformers.
* **Git Commit Message:** `docs: add deep research report for SOTA algorithmic trading models`
* **Status:** Completed

### [2026-05-14] Implementation of SOTA Algorithmic Framework
* **Goal:** Apply the Deep Research findings directly into the AlphaMind codebase to elevate predictive accuracy and risk management.
* **Changes:** 
  1. Built `TransformerFeatureExtractor` (a PyTorch `nn.Module` with Self-Attention blocks) inside `ppo_agent.py` to process OHLCV before feeding the DRL Actor-Critic Network.
  2. Implemented the "Agentic NLP Kill-Switch" in `ppo_agent.py` to override Model Actions if they conflict heavily with Macro Sentiment (e.g. Forcing `HOLD` if the bot tries to `BUY` during a market crash).
  3. Integrated `pandas_ta.ichimoku` and ATR-normalized volatility cross-sectional factors into the `TechnicalFeatureEngine` within `technical.py`.
  4. Added `DynamicKellyCriterion` in `paper_trading.py` to programmatically adjust simulated trade sizing (1% to 15% maximum portfolio limit) based on the Live News NLP Confidence Score.
* **Git Commit Message:** `feat: implement SOTA transformer feature extractors and NLP dynamic kelly sizing`
* **Status:** Completed

### [2026-06-02] Default Browser Autostart Update
* **Goal:** Enable automatic launch of the dashboard in the system's default browser on startup (as a robust fallback to client Antigravity browser rendering issues).
* **Changes:** Refactored `start_native.ps1` to include a 3-second sleep during startup (letting Next.js bind port 3000) followed by a `Start-Process "http://localhost:3000"` call to launch the default system browser.
* **Git Commit Message:** `feat: auto-launch default system browser on stack start`
* **Status:** Completed

### [2026-06-04] Rebranding to AlphaMind Algo Trading
* **Goal:** Rebrand the application's front-facing identity (metadata, page headers, accounts) from "Sigma Alpha Mind" to "AlphaMind Algo Trading".
* **Changes:** Refactored `layout.tsx`, `login/page.tsx`, and `auth.ts` to replace all occurrences of the old application name with "AlphaMind Algo Trading".
* **Git Commit Message:** `rebrand: rename application display identity to AlphaMind Algo Trading`
* **Status:** Completed

### [2026-06-04] Live Trade Execution Terminal Streaming
* **Goal:** Enable users to view live trade executions dynamically streaming inside the Trading Engine terminal box instead of just seeing static setup logs.
* **Changes:**
  1. Configured persistent status fetching on page mount for `/trading` to detect active background neural nets.
  2. Implemented dynamic polling of `/api/v1/wallet/transactions` every 3 seconds to fetch new profit/loss trades and render them in the console trace.
  3. Enabled config syncing (strategy type, return rate target) on startup.
  4. Added a `Backtesting` option to the main navigation menu mapping to `/paper-trading`.
* **Git Commit Message:** `feat: stream live trades to Trading Engine terminal and add Backtesting to NavBar`
* **Status:** Completed

### [2026-06-05] Live HFT Tracer & Database Schema Fix
* **Goal:** Fix the issue where the live execution tracer was frozen showing only 4 trades and not updating in real time.
* **Changes:**
  1. Added missing `fallback_to_previous_day` and `turboquant_enabled` columns to SQLite `trading_configs` table.
  2. Replaced the unicode Rupee symbol (`₹`) in Python stdout prints with `Rs.` to prevent Windows terminal encoding crashes.
  3. Hardened the background algorithmic trading loop in `trading_task.py` with generic exception handling so it recovers gracefully from transient errors.
  4. Configured Python environment variables `PYTHONIOENCODING=utf-8` and `PYTHONUNBUFFERED=1` to optimize logging stream.
* **Git Commit Message:** `fix: resolve SQLite schema misalignment and encoding errors in HFT trading task`
* **Status:** Completed


