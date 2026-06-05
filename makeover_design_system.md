# AlphaMind AI Trading Platform - Structural Layout & Interface Specification

This document defines the layout grids, structural widgets, input controls, tables, and interaction hierarchies for the **AlphaMind Native** trading suite. It is optimized for **Stitch AI** and **Figma** page generation, relying on the design tool's native styles and colors while strictly locking down the interface structure for both desktop and mobile views, optimized for maximum rendering speed and performance.

---

## 🏛️ Master Layout & Navigation Architecture

### 1. Header Bar (Universal Top Navigation)
* **Structure**: Full-width horizontal navigation bar fixed to the top of the viewport.
* **Left Section (Brand & Logo)**:
  * Brand Icon: Raw SVG code representing Lucide's `brain-circuit` icon. It must render as a static SVG logo with no animation classes:
    ```xml
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-brain-circuit" aria-hidden="true">
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"></path>
      <path d="M9 13a4.5 4.5 0 0 0 3-4"></path>
      <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"></path>
      <path d="M3.477 10.896a4 4 0 0 1 .585-.396"></path>
      <path d="M6 18a4 4 0 0 1-1.967-.516"></path>
      <path d="M12 13h4"></path>
      <path d="M12 18h6a2 2 0 0 1 2 2v1"></path>
      <path d="M12 8h8"></path>
      <path d="M16 8V5a2 2 0 0 1 2-2"></path>
      <circle cx="16" cy="13" r=".5"></circle>
      <circle cx="18" cy="3" r=".5"></circle>
      <circle cx="20" cy="21" r=".5"></circle>
      <circle cx="20" cy="8" r=".5"></circle>
    </svg>
    ```
  * Brand Name: Text label "AlphaMind Native".
* **Center Section (Main Navigation Links)**:
  * Link 1: "Overview" (leads to Dashboard).
  * Link 2: "Trading Engine" (leads to config/logs).
  * Link 3: "Backtesting" (leads to simulation control).
  * Link 4: "Wallet" (leads to transaction ledger).
  * Link 5: "Journal" (leads to financial reports).
* **Right Section (Session & Credentials & Status)**:
  * Header Status Badge:
    * **Engine Offline**: Status light (indicator dot) + text "Engine Offline".
    * **Engine Active (No Capital)**: Status light + text "Allocate Capital" (clicking routes to Wallet).
    * **Native Engine Online**: Static green status light + text "Engine Online".
  * Active Session Status: Displays logged-in user email.
  * Profile Icon: Dropdown button containing links to "Settings" (routes to Profile & Settings page) and "Disconnect" (logs out user).

### 2. Mobile Sticky Navigation Bar
* **Structure**: Fixed footer panel aligned to the bottom of the screen.
* **Buttons**: 4 equally spaced navigation slots:
  1. Icon + label: "Dashboard"
  2. Icon + label: "Engine"
  3. Icon + label: "Wallet"
  4. Icon + label: "Journal"
* **Hamburger Overlay**: Replaces the desktop profile dropdown, opening a full-screen drawer displaying user details, links to "Settings", and a "Disconnect" action.

### 3. Floating Navigation Pill ("Back to Dashboard")
* **Structure**: A fixed-position navigation control appearing on all sub-pages (Trading Engine, Backtesting, Wallet, Journal, Settings) to provide return-to-home pathing.
* **Visual Representation**:
  * Shape: Sleek horizontal border pill.
  * Content: SVG Chevron-Left Icon followed by the text "Back to Dashboard".
  * Border: Thin border contour.
  * Placement: Top-left of the main layout area, located below the primary header bar, aligned with the outer container grid margin.
* **Responsive Control**:
  * Desktop: Full label text ("Back to Dashboard") visible beside the chevron.
  * Mobile/Tablet: Label text hides dynamically; collapses to a small circular button containing only the Chevron-Left icon to minimize screen real-estate overhead.
* **Interactive States**:
  * Static: Renders immediately without animations or translations on hover to avoid GPU rendering latency.

---

## 🖥️ Page-by-Page Granular Widget Specification

### 1. Dashboard (Overview Page)
Must remain dense and data-rich, presenting full market telemetry without layout simplifications.

* **Section A: Telemetry Summary Grid (4 equal columns)**:
  * **Card 1 (Account Equity)**:
    * Label: "Total Account Balance".
    * Value: Numeric output (e.g. `₹1,06,208.04`).
    * Description: "Synchronized Wallet Equity".
  * **Card 2 (Target Return)**:
    * Label: "Return Target".
    * Value: Numeric percentage (e.g. `15.0%`).
    * Description: Active investment strategy label (e.g. "Monthly Horizon").
  * **Card 3 (Active Model)**:
    * Label: "Active Model".
    * Value: Text string (e.g. `ALPHAMIND ONLINE` or `PPO-Agent-v2`).
    * Description: "PyTorch Deployment Status".
  * **Card 4 (PnL Curve Sparkline)**:
    * Label: "Real-time PnL Curve".
    * Chart: Inline SVG sparkline representation of equity progression.
    * Behavior: Clickable container navigating directly to the Detailed Trading Engine page.
* **Section B: Live Market Feed Panel (Left Side, Width 4/7)**:
  * Header: "Live Market Feed".
  * Search Bar: Horizontal input field with search icon placeholder "Search Ticker Symbol...".
  * Filter Row: Horizontal pills to filter by category: `All`, `Nifty 50`, `Bank Nifty`, `Options`.
  * Content: Vertical list of ticker rows. Each row contains:
    * Stock Symbol (e.g., `RELIANCE`, `BANKNIFTY`).
    * Stock Company Name (small text label, e.g. "Reliance Industries").
    * Current Market Price (e.g. `₹2,450.35`).
    * Percentage Trend Badge: Percentage value + arrow trend icon (up-right for positive, down-left for negative).
    * Action Trigger: Floating link icon or mini-button labeled "Config" which deep-links to Trading Engine page with this symbol preselected.
* **Section C: AI Alpha Predictions & Sentiment Panel (Right Side, Width 3/7)**:
  * Header: "AI Alpha Predictions".
  * Content:
    * Sub-card: "Live Profit Scanner" containing:
      * Scanner Header: "Live Profit Scanner" + active indicator dot.
      * Stock Symbol (highest predicted trend symbol).
      * Current CMP (Current Market Price).
      * Estimated Return Percentage (e.g. `+4.8%`).
      * AI Confidence Score: Simple inline progress bar or text indicator showing confidence score.
      * Engine Action Label: Text tag displaying current model sentiment (e.g., `STRONG BUY`).
    * Sub-card: "Hedge Status" containing:
      * Status Header: "Hedge Status".
      * Asset Contract Symbol (e.g. `BANKNIFTY Options`).
      * Position Rating Badge (e.g. `HOLD`).
      * Model Alert Log: Text explaining volatility status and current volatility indices (VIX).
* **Section D: Market Intelligence Feed (Full Width Footer)**:
  * Header: "Market Intelligence Feed".
  * Status Badge: Market mood (BULLISH/BEARISH/CONSOLIDATING) + score indicator (e.g., "Score: 72").
  * Split Grid (2 columns):
    * **Short Term Effects List**: Ticker items containing news headline, source, sentiment tag, and affected stock symbols.
    * **Long Term Effects List**: Ticker items containing macro trends, source, sentiment tag, and affected stock symbols.

### 2. Trading Engine Configuration Page
* **Section A: Strategy Configuration (Left Column, Width 2/3)**:
  * Header: "Strategy Configuration".
  * **Horizon Selection Matrix**: Grid of 6 buttons: `Intraday`, `F&O (Derivatives)`, `Weekly Swing`, `Monthly Position`, `Scalper Zone`, and `Volatility Edge`.
  * **Strategy Description Box**: Dynamically displays based on active or hovered button:
    * Strategy Title.
    * Strategy Definition description.
    * Engine Behavior details.
  * **Target Return Slider**:
    * Slider Input: Range 2% to 40%.
    * Value Display: Large percentage display text.
    * Slider labels: "Low Risk", "Optimal AI", "High Risk".
  * **Closed-Market Switcher**: Segmented tab control with labels `Previous Session` and `Live Session`.
  * **Google TurboQuant Switch**: Segmented tab control with labels `3-bit Enabled` and `Disabled`.
* **Section B: Performance Curve & Ledgers (Right Column, Width 1/3)**:
  * **Performance Sparkline Card**: Clickable card with a mini SVG equity line.
  * **Risk Profile Card**:
    * Metric Row 1: "Est. Max Drawdown" + info icon + numeric percentage.
    * Metric Row 2: "Win Rate Probability" + info icon + numeric percentage.
    * Metric Row 3: "Sharpe Ratio" + info icon + decimal value.
    * Description Footer: Info icon + text detailing Stop-loss behavior.
  * **Memory Learning Ledger**: Scrollable feed showing iteration cards. Each card contains: Iteration number, timestamp, win rate, realized PnL, and status summary notes.
  * **Trading Session Logs**: Scrollable list of session logs. Each log contains: Session number, duration, model type, target return, start time, and session realized PnL.
* **Section C: Interactive Performance Analytics Modal**:
  * Action: Opens when the PnL sparkline card is clicked.
  * Header: "Detailed Performance Analytics" + subtitle + top-right X close button.
  * Canvas: Large SVG line chart with:
    * Y-axis grid lines with numeric labels.
    * Chronological trade markers (dots on the line).
    * Hover coordinate tracking: vertical dashed line + crosshair dot.
    * Hover Tooltip: Floating box showing timestamp, cumulative PnL, trade price, and trade description.
  * Behavior: Keydown event listener closes the modal on 'Escape'.

### 3. Ledger & Wallet Page
* **Section A: Balances Grid (3 columns)**:
  * **Card 1 (Total Equity)**: Large balance display.
  * **Card 2 (Active Deployed Capital)**: Locked capital in engine trades.
  * **Card 3 (Withdrawable Cash)**: Liquid funds available for withdrawal/allocation.
* **Section B: Inflow/Outflow Tracker (2 columns)**:
  * **Deposits Card**: Cumulative deposit amount + "Inflow" badge.
  * **Withdrawals Card**: Cumulative withdrawal amount + "Outflow" badge.
* **Section C: Transaction Ledger Table**:
  * Columns:
    1. **Type**: DEPOSIT / WITHDRAWAL / TRADE_PROFIT / TRADE_LOSS.
    2. **Amount**: Color-coded signed values (+₹ for inflow, -₹ for outflow).
    3. **Status**: Badge displaying "Completed".
    4. **Description**: Text field containing trade notes. Truncates on desktop and displays the full text in a floating tooltip on hover.
    5. **Date**: Timestamp.
* **Section D: Transaction Action Modals (Deposit, Withdraw, Deploy, Recall)**:
  * Form structure:
    * Input Field: Numeric box for amount (₹).
    * Presets buttons: Quick selector tags (+₹10k, +₹50k, +₹100k).
    * Action button: Submit trigger with progress loader.
    * Cancel button: Standard dismiss trigger.

### 4. Financial Journal Page
* **Tab Selection Bar**: Toggle buttons for P&L, Taxation, Balance Sheet, and Trial Balance.
* **Tab View A: Realized Profit & Loss**:
  * Grid Card 1: Gross Trading Revenue (Sum of all trade profits).
  * Grid Card 2: Gross Trading Cost (Sum of all trade losses).
  * Grid Card 3: Gross Realized P&L.
  * Detailed Statement: Column list matching Revenue minus Expenses (Brokerage, STT, GST, turnover fees) to calculate Net Realized P&L.
* **Tab View B: Tax & Brokerage Estimator**:
  * Income Tax Column: Net Realized P&L, speculative tax rate (15%), and estimated tax provision.
  * Regulatory Levies Column: Orders count, estimated turnover, stamp duty, STT, and GST.
* **Tab View C: Balance Sheet**:
  * Left Column (Assets): Personal Wallet Cash, Deployed Engine Capital, Total Assets sum.
  * Right Column (Equity): Capital Account deposits, drawings (withdrawals), retained P&L, Total Equity sum.
  * Equation Balance Footer: Status badge verifying `Total Assets = Total Equity`.
* **Tab View D: Trial Balance**:
  * Table Columns: Ledger Account name, Classification, Debit balance, Credit balance.
  * Ledger Rows: Cash Balance, Deployed Capital, Capital Deposits, Capital Withdrawals, Realized Profits, Realized Losses.
  * Total Row: Sum of all debits matching the sum of all credits.

### 5. Paper Backtesting Page
* **Header Controls**: Speed selector dropdown (`1x`, `10x`, `100x`) and "Start Simulator" toggle button.
* **Backtest Console (Left Panel, Width 2/3)**:
  * Header: "NIFTY 50 Synthetic Backtest".
  * Content Box: Scrollable monospaced log output displaying orders, ticks, fills, and slippage notices.
* **Virtual Ledger Stats (Right Panel, Width 1/3)**:
  * **Simulation settings card**: Displays Virtual Wallet balance, slippage model details, and STT rates.
  * **Session PnL card**: Displays active session PnL.

### 6. Profile & Settings Dashboard
* **Module A: Theme Configuration**:
  * Section Header: "Interface Theme Settings".
  * Description: "Adjust the visual scheme of the interface dashboard."
  * Selector Structure: A three-way segmented toggle switch panel.
  * Selector Tabs:
    1. **Light Mode**: Actionable segment.
    2. **Dark Mode**: Actionable segment.
    3. **System Settings**: Actionable segment.
* **Module B: Token Cost Limiter (AI Compute Budget)**:
  * Section Header: "AI Compute Token Limiter".
  * Description: "Limit API consumption rates and query token budgets."
  * Switch Control: Main On/Off toggle switch slider.
  * **Budget Slider Controls (Active only when Switch is ON)**:
    * Range Slider Input: Minimum value `$0.10`, Maximum value `$50.00`.
    * Track Indicators: Numerical markers along the slider line.
  * **Custom Budget Threshold Field**:
    * Input Type: Numeric text input block labeled "Custom Limit ($)".
    * Placeholder: Enter custom limit (e.g., `100.00`).
    * Active state: Syncs with range slider state.
* **Module C: Account Credentials Form**:
  * Section Header: "Account Credentials".
  * Description: "Modify active profile login parameters and security keys."
  * Form Input 1 (Username Field):
    * Label: "Account Username".
    * Type: Text field input.
    * Placeholder: Active username display.
  * Form Input 2 (Current Password Field):
    * Label: "Current Password".
    * Type: Secure password input text block.
    * Interactive Toggle: Right-aligned inline eye icon button triggering hide/show logic.
  * Form Input 3 (New Password Field):
    * Label: "New Security Password".
    * Type: Secure password input text block.
    * Interactive Toggle: Right-aligned inline eye icon button triggering hide/show logic.
  * Form Input 4 (Confirm New Password Field):
    * Label: "Confirm New Password".
    * Type: Secure password input text block.
    * Interactive Toggle: Right-aligned inline eye icon button triggering hide/show logic.
  * Form Action Button: "Save Configuration".

### 7. Login Page
* **Login Card**: Center-aligned card.
* **Credentials Form**: Input boxes for Username and Password.
* **Status Badge**: Bottom status indicator checking server status ("ONLINE" / "OFFLINE").

---

## ⚡ Stitch Prompt: High-Performance Static Layout Specifications

This prompt provides layout instructions for Stitch AI to construct an optimized, high-speed static user interface with zero rendering overhead.

```markdown
Role: Lead UI/UX Performance Architect
Goal: Implement a clean, flat, high-performance static UI/UX for the AlphaMind Trading Platform.

Constraint: Avoid CPU-intensive CSS animations, transitions, keyframes, shadow filters, or heavy backdrop filters. The website must be extremely lightweight, loading instantly and drawing minimum paint operations on both desktop and mobile viewports.

### 1. Static Layout & Borders
* Use standard solid borders (e.g. `border: 1px solid var(--border)`) without shadow offsets or blur effects to outline cards, tables, and buttons.
* Maintain clean margins, paddings, and alignment grids without any hover shifts, translations, or scale animations.

### 2. Static Status Elements
* Status indicators must render as solid, non-pulsing dots and tags. Avoid the CSS `@keyframes pulse` loops or `animate-pulse` classes.
* Render the brand SVG logo as a static emblem without heartbeat resizing or circuit dashes.

### 3. Lightweight Plain Placeholders
* Instead of loading linear-gradient shimmers or skeletons during loading cycles, render solid color placeholder blocks.

### 4. Zero Visual Effects Overhead
* Ensure all elements (modals, dropdowns, inputs) do not use `backdrop-filter: blur()`, `filter: drop-shadow()`, or transition properties.
```
