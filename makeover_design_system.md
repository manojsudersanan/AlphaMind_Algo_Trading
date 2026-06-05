# AlphaMind AI Trading Platform - Structural Layout & Interface Specification

This document defines the layout grids, structural widgets, input controls, tables, and interaction hierarchies for the **AlphaMind Native** trading suite. It is optimized for **Stitch AI** and **Figma** page generation, relying on the design tool's native styles and colors while strictly locking down the interface structure for both desktop and mobile views.

---

## 🏛️ Master Layout & Navigation Architecture

### 1. Header Bar (Universal Top Navigation)
* **Structure**: Full-width horizontal navigation bar fixed to the top of the viewport.
* **Left Section (Brand & Logo)**:
  * Brand Icon: Raw SVG code representing Lucide's `brain-circuit` icon. It must render with a class for pulse animation (e.g. `animate-pulse-slow`):
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
    * **Native Engine Online**: Pulsing status light + text "Engine Online".
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
  * Border: Thin, semi-transparent border contour.
  * Placement: Top-left of the main layout area, located below the primary header bar, aligned with the outer container grid margin.
* **Responsive Control**:
  * Desktop: Full label text ("Back to Dashboard") visible beside the chevron.
  * Mobile/Tablet: Label text hides dynamically; collapses to a small circular button containing only the Chevron-Left icon to minimize screen real-estate overhead.
* **Interactive & Haptic States**:
  * Hover: The entire pill translates leftward by 4px (`transform: translate3d(-4px, 0, 0)`) with a smooth CSS transition. The semi-transparent border glows with a mesh backlight.
  * Press/Active: Button scales down to 96% (`transform: scale3d(0.96, 0.96, 1)`) simulating a physical tactile click.

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
    * Description: Active investment timeline strategy label (e.g. "Monthly Horizon").
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
      * Scanner Header: "Live Profit Scanner" + pulsing green active indicator dot.
      * Stock Symbol (highest predicted trend symbol).
      * Current CMP (Current Market Price).
      * Estimated Return Percentage (e.g. `+4.8%`).
      * AI Confidence Score: Radial progress ring enclosing numeric percentage (e.g. `89%`).
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
    * Chronological trade markers (colored dots on the line).
    * Hover coordinate tracking: vertical dashed line + glowing crosshair dot.
    * Hover Tooltip: Floating box showing timestamp, cumulative PnL, trade price, and trade description.
  * Behavior: Keydown event listener closes the modal on 'Escape'.

### 3. Ledger & Wallet Page
* **Section A: Balances Grid (3 columns)**:
  * **Card 1 (Total Equity)**: Large balance display.
  * **Card 2 (Active Deployed Capital)**: Locked capital in engine trades.
  * **Card 3 (Withdrawable Cash)**: Liquid funds available for withdrawal/allocation.
* **Section B: Inflow/Outflow Tracker (2 columns)**:
  * **Deposits Card**: Cumulative deposit amount + green "Inflow" badge.
  * **Withdrawals Card**: Cumulative withdrawal amount + red "Outflow" badge.
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
  * Equation Balance Footer: Green status badge verifying `Total Assets = Total Equity`.
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
  * **Session PnL card**: Displays active session PnL in green/red font.

### 6. Profile & Settings Dashboard
* **Module A: Theme Configuration**:
  * Section Header: "Interface Theme Settings".
  * Description: "Adjust the visual scheme of the interface dashboard."
  * Selector Structure: A three-way segmented toggle switch panel.
  * Selector Tabs:
    1. **Light Mode**: Actionable segment.
    2. **Dark Mode**: Actionable segment.
    3. **System Settings**: Actionable segment (inherits operating system preferences).
* **Module B: Token Cost Limiter (AI Compute Budget)**:
  * Section Header: "AI Compute Token Limiter".
  * Description: "Limit API consumption rates and query token budgets incurred during real-time asset model scanning."
  * Switch Control: Main On/Off toggle switch slider.
  * **Budget Slider Controls (Active only when Switch is ON)**:
    * Range Slider Input: Minimum value `$0.10`, Maximum value `$50.00`.
    * Track Indicators: Numerical markers along the slider line at `$5.00`, `$10.00`, `$25.00`, and `$50.00`.
  * **Custom Budget Threshold Field**:
    * Input Type: Numeric text input block labeled "Custom Limit ($)".
    * Placeholder: Enter custom limit (e.g., `100.00`).
    * Active state: Syncs with range slider state (slider updates value when custom input is updated, and vice versa).
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
    * Interactive Toggle: Right-aligned inline eye icon button triggering hide/show logic for clear-text password toggle.
  * Form Input 3 (New Password Field):
    * Label: "New Security Password".
    * Type: Secure password input text block.
    * Interactive Toggle: Right-aligned inline eye icon button triggering hide/show logic.
  * Form Input 4 (Confirm New Password Field):
    * Label: "Confirm New Password".
    * Type: Secure password input text block.
    * Interactive Toggle: Right-aligned inline eye icon button triggering hide/show logic.
  * Form Validation Message: Alert text block appearing if passwords do not match.
  * Form Action Button: Center/Right-aligned button labeled "Save Configuration".

### 7. Login Page
* **Login Card**: Center-aligned card.
* **Credentials Form**: Input boxes for Username and Password.
* **Status Badge**: Bottom status indicator checking server status ("ONLINE" / "OFFLINE").

---

## ✨ Stitch Prompt: High-Fidelity Zero-Cost Dynamic Aesthetics

This prompt provides copy-pasteable styling instructions for Stitch AI to implement hardware-accelerated dynamic motion and premium micro-interactions. These effects add rich, visual depth without impacting CPU/GPU trading performance.

```markdown
Role: Lead UI/UX Motion Engineer
Goal: Implement hardware-accelerated dynamic motion, premium glassmorphism, and micro-interactions for the AlphaMind Trading Platform.

Constraint: Avoid CPU-intensive Javascript canvas animations, heavy particle libraries, or large asset downloads. All dynamic effects must run entirely on the GPU utilizing CSS transition, translate3d, and hardware-accelerated filters to achieve 120 FPS on both desktop and mobile screens.

### 1. Hardware-Accelerated Micro-Interactions
* **GPU-Bound Hover Effects**:
  * For all cards, buttons, and list rows, use `transform: translate3d(x, y, z)` and `opacity` transition properties only. Never animate properties like `height`, `width`, `margin`, or `padding` as they trigger browser layout recalculation.
  * Apply `will-change: transform` to cards that scale or shift on hover to pre-allocate GPU memory.
  * Card hover effect: Scale cards up slightly (`scale3d(1.015, 1.015, 1)`) and shift upward (`translate3d(0, -4px, 0)`) using a custom cubic-bezier ease (`cubic-bezier(0.25, 0.8, 0.25, 1)`).
* **Button Micro-Clicks**:
  * On press (`:active` state), use `transform: scale3d(0.96, 0.96, 1)` to provide instant tactile haptic feedback.

### 2. Premium Glassmorphism & Depth
* **Floating Frosting Panels**:
  * Apply `backdrop-filter: blur(12px)` and a thin, semi-transparent border (e.g. `border: 1px solid rgba(255, 255, 255, 0.08)`) on navigation bars, dropdowns, and modals to create modern layered depth.
  * Ensure card containers use a parent relative position with `overflow: hidden` to mask internal gradient highlights.
* **Dynamic Hover Backlight (Mesh Glow)**:
  * Embed an absolute-positioned pseudo-element (`:before` or `:after`) inside active cards. On card hover, transition its opacity from 0% to 100% using a radial-gradient background (`radial-gradient(circle at center, rgba(var(--primary-rgb), 0.15) 0%, transparent 70%)`).
  * This creates a localized, glowing highlight that follows the cursor or centers on hover, giving a premium holographic feel.

### 3. CSS Hardware-Accelerated Glow Filters
* **Glowing Status Indicators**:
  * Apply a hardware-accelerated drop-shadow filter to green/yellow active lights: `filter: drop-shadow(0 0 6px var(--status-color))`.
  * Create a breathing pulse animation utilizing CSS keyframes:
    ```css
    @keyframes status-pulse {
      0% { filter: drop-shadow(0 0 2px var(--status-color-alpha)); opacity: 0.7; }
      50% { filter: drop-shadow(0 0 8px var(--status-color)); opacity: 1; }
      100% { filter: drop-shadow(0 0 2px var(--status-color-alpha)); opacity: 0.7; }
    }
    ```
  * Run this on a slow 3-second infinite loop.

### 4. Keyframe-Animated SVG Logo (Zero Overhead)
* **Brain-Circuit Logo Animation**:
  * Target specific paths inside the Lucide `brain-circuit` SVG logo using CSS:
    * Apply a slow heartbeat scale to the core central brain paths.
    * Animate the dash-offset of outer circuit paths to create a pulsing "data transfer" flow effect:
      ```css
      @keyframes circuit-flow {
        to { stroke-dashoffset: -20; }
      }
      .circuit-path {
        stroke-dasharray: 5, 5;
        animation: circuit-flow 1.5s linear infinite;
      }
      ```

### 5. Fluid Skeleton Shimmers
* **CSS-Only Loading states**:
  * Use a linear-gradient background shifting on loop for telemetry placeholders:
    ```css
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    .skeleton-loader {
      background: linear-gradient(90deg, var(--card-bg) 25%, var(--border-bg) 50%, var(--card-bg) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.6s infinite;
    }
    ```
```
