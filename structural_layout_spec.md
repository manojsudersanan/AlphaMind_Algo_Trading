# AlphaMind AI Trading Platform - Structural Layout & Interface Specification

This document defines the layout grids, structural widgets, input controls, tables, and interaction hierarchies for the **AlphaMind Native** trading suite. It serves as a pure structural wireframe layout for **Stitch AI** and **Figma** page generation. It contains no styling properties, colors, or fonts, allowing the design tool to apply its own aesthetic tokens.

---

## 🏛️ Master Layout & Navigation Architecture

### 1. Header Bar (Universal Top Navigation)
* **Structure**: Full-width horizontal navigation bar at the top of the viewport.
* **Left Section (Brand & Logo)**:
  * Brand Icon: SVG representing a brain circuit with a CSS pulse class.
  * Brand Name: Text label "AlphaMind Native".
* **Center Section (Main Navigation Links)**:
  * Link 1: "Overview" (Dashboard).
  * Link 2: "Trading Engine".
  * Link 3: "Backtesting".
  * Link 4: "Wallet".
  * Link 5: "Journal".
* **Right Section (Session & Credentials & Status)**:
  * Header Status Badge:
    * **Engine Offline**: Status indicator dot + text "Engine Offline".
    * **Engine Active (No Capital)**: Status indicator dot + text "Allocate Capital" (navigates to Wallet).
    * **Native Engine Online**: Pulsing status indicator dot + text "Engine Online".
  * Active Session Status: Displays logged-in user email.
  * Profile Icon: Dropdown button containing "Settings" and "Disconnect".
* **Zero Breadcrumbs**: No page-level back-navigation or hierarchical path strings are allowed at the top of sub-pages.

### 2. Mobile Sticky Navigation Bar
* **Structure**: Fixed footer panel aligned to the bottom of the screen.
* **Buttons**: 4 equally spaced navigation slots:
  1. Icon + label: "Dashboard"
  2. Icon + label: "Engine"
  3. Icon + label: "Wallet"
  4. Icon + label: "Journal"
* **Hamburger Overlay**: Replaces the desktop profile dropdown, opening a full-screen drawer for settings and session disconnect.

---

## 🖥️ Page-by-Page Granular Widget Specification

### 1. Dashboard (Overview Page)
* **Layout**: Multi-column responsive layout grid.
* **Section A: Telemetry Summary Grid (4 equal columns)**:
  * **Card 1 (Account Equity)**:
    * Label: "Total Account Balance".
    * Value: Numeric output (local currency).
    * Description: "Synchronized Wallet Equity".
  * **Card 2 (Target Return)**:
    * Label: "Return Target".
    * Value: Numeric percentage.
    * Description: Active investment strategy label.
  * **Card 3 (Active Model)**:
    * Label: "Active Model".
    * Value: Text string (e.g. model execution state name).
    * Description: "PyTorch Deployment Status".
  * **Card 4 (PnL Curve Sparkline)**:
    * Label: "Real-time PnL Curve".
    * Chart: Inline SVG sparkline.
    * Behavior: Clickable container navigating to the Trading Engine page.
* **Section B: Live Market Feed Panel (Left Side, Width 4/7)**:
  * Header: "Live Market Feed".
  * Content: Vertical list of ticker rows. Each row contains:
    * Stock Symbol.
    * Current Market Price.
    * Percentage Trend Badge: Percentage value + arrow trend icon (up for positive, down for negative).
* **Section C: AI Alpha Predictions & Sentiment Panel (Right Side, Width 3/7)**:
  * Header: "AI Alpha Predictions".
  * Content:
    * Sub-card: "Live Profit Scanner" containing:
      * Stock Symbol (highest predicted trend).
      * Current CMP (Market Price).
      * Estimated Return Percentage.
      * AI Confidence Score: Radial progress ring.
      * Engine Action Label (e.g., "STRONG BUY").
    * Sub-card: "Hedge Status" containing:
      * Asset Contract Symbol.
      * Position Rating Badge.
      * Model Alert Log: Text explaining volatility status.
* **Section D: Market Intelligence Feed (Full Width Footer)**:
  * Header: "Market Intelligence Feed".
  * Status Badge: Market mood (BULLISH/BEARISH/CONSOLIDATING) + score indicator.
  * Split Grid (2 columns):
    * **Short Term Effects List**: Ticker items containing news headline, source, sentiment tag, and affected stock symbols.
    * **Long Term Effects List**: Ticker items containing macro trends, source, sentiment tag, and affected stock symbols.

### 2. Trading Engine Configuration Page
* **Layout**: Two-column layout grid.
* **Section A: Strategy Configuration (Left Column, Width 2/3)**:
  * Header: "Strategy Configuration".
  * **Horizon Selection Matrix**: Grid of 6 buttons: "Intraday", "F&O (Derivatives)", "Weekly Swing", "Monthly Position", "Scalper Zone", and "Volatility Edge".
  * **Strategy Description Box**: Dynamically displays based on active or hovered button:
    * Strategy Title.
    * Strategy Definition description.
    * Engine Behavior details.
  * **Target Return Slider**:
    * Slider Input: Range 2% to 40%.
    * Value Display: Large percentage display text.
    * Slider labels: "Low Risk", "Optimal AI", "High Risk".
    * Info Tooltip: Explains target returns relative to risk profiles.
  * **Closed-Market Switcher**: Segmented tab control with labels "Previous Session" and "Live Session".
  * **Google TurboQuant Switch**: Segmented tab control with labels "3-bit Enabled" and "Disabled".
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
  * Header: "Detailed Performance Analytics" + subtitle.
  * Canvas: Large SVG line chart with:
    * Y-axis grid lines with numeric labels.
    * Chronological trade markers (colored dots on the line).
    * Hover coordinate tracking: vertical dashed line + glowing crosshair dot.
    * Hover Tooltip: Floating box showing timestamp, cumulative PnL, trade price, and trade description.
  * Behavior: Keydown event listener closes the modal on 'Escape'.

### 3. Ledger & Wallet Page
* **Layout**: Grid layout with actions list.
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
    2. **Amount**: Color-coded signed values indicating inflow or outflow.
    3. **Status**: Badge displaying "Completed".
    4. **Description**: Text field containing trade notes. Truncates on desktop and displays the full text in a floating tooltip on hover.
    5. **Date**: Timestamp.
* **Section D: Transaction Action Modals (Deposit, Withdraw, Deploy, Recall)**:
  * Form structure:
    * Input Field: Numeric box for amount.
    * Presets buttons: Quick selector tags (+10k, +50k, +100k).
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
* **Header Controls**: Speed selector dropdown (1x, 10x, 100x) and "Start Simulator" toggle button.
* **Backtest Console (Left Panel, Width 2/3)**:
  * Header: "NIFTY 50 Synthetic Backtest".
  * Content Box: Scrollable monospaced log output displaying orders, ticks, fills, and slippage notices.
* **Virtual Ledger Stats (Right Panel, Width 1/3)**:
  * **Simulation settings card**: Displays Virtual Wallet balance, slippage model details, and STT rates.
  * **Session PnL card**: Displays active session PnL.

### 6. Profile & Settings Dashboard
* **Module A: Theme Configuration**:
  * Segmented switcher selector with options: "Light", "Dark", and "System".
* **Module B: Token Cost Limiter (AI Compute Budget)**:
  * Main Toggle switch: ON / OFF.
  * Range Slider: Active when toggle is ON. Adjusts budget limit threshold.
  * Custom text input box: Enables custom dollar thresholds.
* **Module C: Account Credentials**:
  * Form Fields: Username input, current password input, new password input. All fields have secure show/hide visibility triggers (eye icon buttons).
  * Action Button: "Save Configuration".

### 7. Login Page
* **Login Card**: Center-aligned card.
* **Credentials Form**: Input boxes for Username and Password.
* **Status Badge**: Bottom status indicator checking server status ("ONLINE" / "OFFLINE").

---

## ✨ Stitch Prompt: High-Fidelity Zero-Cost Dynamic Aesthetics

This prompt provides copy-pasteable styling instructions for Stitch AI to implement hardware-accelerated dynamic motion and premium glassmorphism. These effects add rich, visual depth without impacting CPU/GPU trading performance.

```markdown
Role: Lead UI/UX Motion Engineer
Goal: Implement hardware-accelerated dynamic motion, premium glassmorphism, and micro-interactions.

Constraint: Avoid CPU-intensive Javascript canvas animations, heavy particle libraries, or large asset downloads. All dynamic effects must run entirely on the GPU utilizing CSS transition, translate3d, and hardware-accelerated filters to achieve 120 FPS on both desktop and mobile screens.

### 1. Hardware-Accelerated Micro-Interactions
* **GPU-Bound Hover Effects**:
  * For all cards, buttons, and list rows, use transform: translate3d(x, y, z) and opacity transition properties only. Never animate properties like height, width, margin, or padding.
  * Apply will-change: transform to cards that scale or shift on hover to pre-allocate GPU memory.
  * Card hover effect: Scale cards up slightly (scale3d(1.015, 1.015, 1)) and shift upward (translate3d(0, -4px, 0)) using a custom cubic-bezier ease (cubic-bezier(0.25, 0.8, 0.25, 1)).
* **Button Micro-Clicks**:
  * On press (:active state), use transform: scale3d(0.96, 0.96, 1) to provide instant tactile feedback.

### 2. Premium Glassmorphism & Depth
* **Floating Frosting Panels**:
  * Apply backdrop-filter: blur(12px) and a thin, semi-transparent border on navigation bars, dropdowns, and modals to create modern layered depth.
  * Ensure card containers use a parent relative position with overflow: hidden to mask internal gradient highlights.
* **Dynamic Hover Backlight (Mesh Glow)**:
  * Embed an absolute-positioned pseudo-element (:before or :after) inside active cards. On card hover, transition its opacity from 0% to 100% using a radial-gradient background. This creates a localized, glowing highlight that follows the cursor or centers on hover, giving a premium holographic feel.

### 3. CSS Hardware-Accelerated Glow Filters
* **Glowing Status Indicators**:
  * Apply a hardware-accelerated drop-shadow filter to active status lights.
  * Create a breathing pulse animation utilizing CSS keyframes to fluctuate drop-shadow strength and opacity. Run this on a slow 3-second infinite loop.

### 4. Keyframe-Animated SVG Logo (Zero Overhead)
* **Brain-Circuit Logo Animation**:
  * Target specific paths inside the brain-circuit SVG logo using CSS:
    * Apply a slow heartbeat scale to the core central brain paths.
    * Animate the dash-offset of outer circuit paths to create a pulsing data transfer flow effect.

### 5. Fluid Skeleton Shimmers
* **CSS-Only Loading states**:
  * Use a linear-gradient background shifting on loop for telemetry placeholders to represent active loading states with zero javascript overhead.
```
