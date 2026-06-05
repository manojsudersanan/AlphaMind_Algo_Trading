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

### [2026-06-05] Strategy Configuration Hover Definitions Card
* **Goal:** Implement premium strategy hover cards that provide clear definitions and engine action behavior details for all model strategies (Intraday, F&O, Weekly, Monthly, Scalper Zone, Volatility Edge).
* **Changes:**
  1. Defined `STRATEGY_DETAILS` metadata structure holding titles, definitions, and backend engine behaviors for all 6 strategy horizons in `frontend/src/app/trading/page.tsx`.
  2. Implemented `hoveredType` React state dynamically updating on strategy button hover.
  3. Structured a premium strategy explanation panel featuring dynamic text switching and a micro-animated `BrainCircuit` indicator, matching user selection/hover states.
* **Git Commit Message:** `feat: implement interactive strategy definitions hover card in trading settings`
* **Status:** Completed

### [2026-06-05] Segmented Closed-Market Switcher & Metrics Info Tooltips
* **Goal:** Improve UX by replacing the confusing single toggle button for closed-market fallback with a clear Segmented Control Tab layout (Previous Session / Live Session), and adding info tooltips explaining key risk metrics.
* **Changes:**
  1. Replaced the "Market Closed Session Mode" toggle button with a custom segmented switcher containing `Previous Session` and `Live Session` buttons.
  2. Implemented hover-to-display tooltips on Info icons next to Risk Analysis header, Est. Max Drawdown, Win Rate Probability, and Sharpe Ratio labels.
* **Git Commit Message:** `feat: add Segmented Control tab switcher and Info hover tooltips for risk metrics`
* **Status:** Completed

### [2026-06-05] Google TurboQuant Segmented Control Switcher
* **Goal:** Convert the confusing single toggle button for model compression to a clean Segmented Control switcher (3-bit Enabled vs. Disabled) and add an info tooltip describing its function.
* **Changes:**
  1. Replaced the single-action button under "Google TurboQuant 3-bit Compression" with a segmented switcher containing `3-bit Enabled` (accented with green) and `Disabled` options.
  2. Embedded an Info icon with a hover-to-display tooltip detailing the 3-bit scalar model compression parameters.
* **Git Commit Message:** `feat: change Google TurboQuant toggle to a Segmented Control switch layout`
* **Status:** Completed

### [2026-06-05] Dynamic IST Market Hours Status & Switcher Label
* **Goal:** Dynamically check Indian stock exchange (NSE/BSE) market hours in real-time, notifying users of the exchange state directly on the buttons.
* **Changes:**
  1. Implemented a client-side React effect polling market hours (Mon-Fri 9:15 AM - 3:30 PM IST) aligned with the `Asia/Kolkata` time zone.
  2. Configured the Live Session button label to dynamically update to `Live Session (Open)` or `Live Session (Closed Sim)` based on real-time market status.
  3. Integrated current open/closed status messages directly into the closed-market switcher's info tooltip.
* **Git Commit Message:** `feat: dynamically check IST market hours and update Live Session button text based on market open/closed status`
* **Status:** Completed

### [2026-06-05] Ledger Segregation, Tooltip Previews & Dynamic Switcher Colors
* **Goal:** Improve ledger data representation (hover preview details, plus/minus signs on amount column, segregated inflow/outflow metrics cards) and align switcher buttons with open/closed color schemes.
* **Changes:**
  1. Implemented client-side calculation to segregate total deposits and total withdrawals as individual cards on `/wallet` page.
  2. Formatting: Configured the ledger's Amount column to prefix outflows with `-` and inflows with `+`, color-coding red and green.
  3. Description Preview: Added a hover-to-display tooltip to the description column cell to prevent description truncations.
  4. Swapped Live Session button highlights: Green theme for `Live Session (Open)` and Blue theme for `Live Session (Closed Sim)`.
* **Git Commit Message:** `feat: implement segregated capital stats cards, signs formatting, ledger tooltips, and dynamic switcher colors`
* **Status:** Completed

### [2026-06-05] PnL Chart Scaling, Responsive Modal, Timezone, and Database Partition Fixes
* **Goal:** Correct the P&L curve rendering to prevent flat-lines, fix the modal close button usability, adjust database PnL accumulation for multi-user safety, and synchronize timezone date parsing.
* **Changes:**
  1. **PnL Chart Auto-scaling**: Configured `PnLChart.tsx` to compute Y-axis minimums and maximums dynamically from the transactions list, preventing the curve from flattening. Added clean marker toggling (`points.length <= 60`) to avoid dot clutter on large datasets.
  2. **Responsive Close Modal**: Updated `Detailed Performance Analytics` modal header to adapt responsively (`flex-col sm:flex-row`). Enhanced close button visibility with styled destructive borders, and embedded a top-right absolute close icon.
  3. **Timezone Offset Parsing**: Implemented UTC date validation in `utils.ts` to parse timezone-naive database dates correctly, aligning trade display timestamps with current IST local time.
  4. **Database PnL Partition**: Modified SQL window function in `wallet_repo.py` to partition trade sums by `wallet_id`, preventing cross-user transaction accumulation.
  5. **Stitch AI Wireframe Spec**: Compiled structural wireframe layout blueprints in `structural_layout_spec.md` with no styling/color parameters.
* **Git Commit Message:** `fix: correct pnl chart scaling, responsive modal close visibility, timezone offset, and database partition calculations`
* **Status:** Completed
