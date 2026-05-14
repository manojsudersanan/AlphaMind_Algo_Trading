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

