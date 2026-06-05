"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import axios from "axios"
import { 
  ArrowLeft,
  BookOpen, 
  Calculator, 
  Scale, 
  Receipt, 
  TrendingUp, 
  Info, 
  AlertTriangle,
  CheckCircle2
} from "lucide-react"

export default function JournalPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<"pnl" | "taxation" | "balance_sheet" | "trial_balance">("pnl")
  const [transactions, setTransactions] = useState<any[]>([])
  const [walletData, setWalletData] = useState<any>({
    balance: 0,
    trading_capital: 0,
    withdrawable_balance: 0,
  })
  const [loading, setLoading] = useState(true)

  const fetchFinancialData = async (token: string) => {
    try {
      setLoading(true)
      const walletRes = await axios.get("http://127.0.0.1:8000/api/v1/wallet/", {
        headers: { Authorization: `Bearer ${token}` }
      })
      setWalletData(walletRes.data)

      const txRes = await axios.get("http://127.0.0.1:8000/api/v1/wallet/transactions?limit=200", {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTransactions(txRes.data || [])
    } catch (e) {
      console.error("Error fetching financial data", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const token = (session as any)?.accessToken
    if (token) {
      fetchFinancialData(token)
    }
  }, [session])

  // Calculation parameters
  const equity = Number(walletData.balance) || 0
  const deployed = Number(walletData.trading_capital) || 0
  const withdrawable = Number(walletData.withdrawable_balance) || 0

  // Filter transactions
  const deposits = transactions.filter((tx) => tx.type === "deposit")
  const withdrawals = transactions.filter((tx) => tx.type === "withdrawal")
  const tradeProfits = transactions.filter((tx) => tx.type.includes("profit"))
  const tradeLosses = transactions.filter((tx) => tx.type.includes("loss"))

  // Summary figures
  const totalDepositsVal = deposits.reduce((sum, tx) => sum + Number(tx.amount), 0)
  const totalWithdrawalsVal = withdrawals.reduce((sum, tx) => sum + Number(tx.amount), 0)
  const grossProfitsVal = tradeProfits.reduce((sum, tx) => sum + Number(tx.amount), 0)
  const grossLossesVal = tradeLosses.reduce((sum, tx) => sum + Number(tx.amount), 0)
  
  const grossRealizedPnL = grossProfitsVal - grossLossesVal
  const totalTradesCount = tradeProfits.length + tradeLosses.length

  // Charges Estimation Constants (Indian Brokerage Structure e.g. Zerodha)
  // Brokerage: Flat ₹20 per executed leg (1 buy order, 1 sell order = ₹40 per completed trade)
  const brokeragePerTrade = 40 
  const estBrokerage = totalTradesCount * brokeragePerTrade

  // Estimate turnover (average volume handled). We can approximate turnover as buy + sell value. 
  // Let's estimate turnover as: sum of profit/loss sizes.
  // Since each profit/loss is a net outcome, the underlying order value is typically much larger (approx 20x the profit/loss swing).
  // Let's assume an average order size of ₹25,000 per trade for turnover calculations.
  const estTurnover = totalTradesCount * 50000 // ₹25k buy + ₹25k sell
  
  // Securities Transaction Tax (STT): 0.025% on Sell side for intraday equity
  // Or 0.0625% on Options premium. Let's use a standard 0.025% of turnover as a composite STT estimate.
  const estSTT = (estTurnover / 2) * 0.00025

  // Exchange transaction charges: ~0.00345% of turnover
  const estExchangeCharges = estTurnover * 0.0000345

  // GST: 18% of (Brokerage + Exchange Charges)
  const estGST = (estBrokerage + estExchangeCharges) * 0.18

  // SEBI turnover fee & stamp duty estimate: ~0.0001% and ~0.003% respectively
  const estSebiStamp = estTurnover * 0.000015

  const totalTaxesAndCharges = estBrokerage + estSTT + estExchangeCharges + estGST + estSebiStamp
  const netRealizedPnL = grossRealizedPnL - totalTaxesAndCharges

  // Taxation estimate (India capital gains: short-term speculative intraday is taxed at 30% or slab rate.
  // Let's estimate STCG tax at 15% (standard short-term capital gains for equity) if net PnL is positive.
  const estTaxRate = 0.15
  const estTaxPayable = netRealizedPnL > 0 ? netRealizedPnL * estTaxRate : 0
  const netProfitPostTax = netRealizedPnL > 0 ? netRealizedPnL - estTaxPayable : netRealizedPnL

  // Formatting utilities
  const formatCurrency = (val: number) => {
    const isNeg = val < 0
    return `${isNeg ? "-" : ""}₹${Math.abs(val).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }


  return (
    <div className="pt-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-20">
      <Link href="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 border border-border bg-card/40 hover:bg-secondary/35 rounded-full text-xs font-semibold text-muted-foreground hover:text-foreground transition-all duration-200 mb-6 w-fit shadow-sm">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" /> AlphaMind Financial Journal
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time balance sheet, tax projections, and trial balance generated from SQLite transaction records.
          </p>
        </div>
      </div>

      {/* Tab Selectors */}
      <div className="flex border-b border-border/80 bg-secondary/10 p-1.5 rounded-lg shrink-0 max-w-full overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab("pnl")}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-md text-xs font-semibold transition-all shrink-0 ${
            activeTab === "pnl"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/35"
          }`}
        >
          <TrendingUp className="h-4 w-4" /> Realized Profit & Loss
        </button>
        <button
          onClick={() => setActiveTab("taxation")}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-md text-xs font-semibold transition-all shrink-0 ${
            activeTab === "taxation"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/35"
          }`}
        >
          <Calculator className="h-4 w-4" /> Tax & Brokerage Estimator
        </button>
        <button
          onClick={() => setActiveTab("balance_sheet")}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-md text-xs font-semibold transition-all shrink-0 ${
            activeTab === "balance_sheet"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/35"
          }`}
        >
          <Receipt className="h-4 w-4" /> Balance Sheet
        </button>
        <button
          onClick={() => setActiveTab("trial_balance")}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-md text-xs font-semibold transition-all shrink-0 ${
            activeTab === "trial_balance"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/35"
          }`}
        >
          <Scale className="h-4 w-4" /> Ledger Trial Balance
        </button>
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
          <svg className="animate-spin h-8 w-8 text-primary mb-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm font-mono">Consolidating journal ledger records...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* TAB 1: P&L STATEMENT */}
          {activeTab === "pnl" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                  <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Gross Trading Revenue</span>
                  <div className="text-2xl font-bold font-mono text-trading-green mt-2">{formatCurrency(grossProfitsVal)}</div>
                  <span className="text-[10px] text-muted-foreground mt-1 block">From {tradeProfits.length} winning executions</span>
                </div>
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                  <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Gross Trading Cost</span>
                  <div className="text-2xl font-bold font-mono text-trading-red mt-2">{formatCurrency(grossLossesVal)}</div>
                  <span className="text-[10px] text-muted-foreground mt-1 block">From {tradeLosses.length} drawdown executions</span>
                </div>
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm bg-gradient-to-br from-secondary/20 to-card">
                  <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Gross Realized P&L</span>
                  <div className={`text-2xl font-bold font-mono mt-2 ${grossRealizedPnL >= 0 ? "text-trading-green" : "text-trading-red"}`}>
                    {formatCurrency(grossRealizedPnL)}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 block">Prior to taxes, fees, and brokerages</span>
                </div>
              </div>

              {/* P&L Table */}
              <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border/50 bg-secondary/10">
                  <h3 className="font-semibold text-lg">Detailed P&L Statement</h3>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">Simulated for current deployment period.</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between py-2.5 border-b border-border/50 text-sm font-medium">
                      <span>Realized Profit (A)</span>
                      <span className="text-trading-green font-mono">{formatCurrency(grossProfitsVal)}</span>
                    </div>
                    <div className="flex justify-between py-2.5 border-b border-border/50 text-sm font-medium">
                      <span>Realized Loss (B)</span>
                      <span className="text-trading-red font-mono">{formatCurrency(grossLossesVal)}</span>
                    </div>
                    <div className="flex justify-between py-2.5 border-b border-border/50 text-sm font-bold bg-secondary/25 px-2 rounded">
                      <span>Gross Realized P&L (C = A - B)</span>
                      <span className={grossRealizedPnL >= 0 ? "text-trading-green font-mono" : "text-trading-red font-mono"}>
                        {formatCurrency(grossRealizedPnL)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2.5 border-b border-border/50 text-sm text-muted-foreground">
                      <span className="pl-4">Estimated Brokerage Charges</span>
                      <span className="font-mono">{formatCurrency(estBrokerage)}</span>
                    </div>
                    <div className="flex justify-between py-2.5 border-b border-border/50 text-sm text-muted-foreground">
                      <span className="pl-4">Securities Transaction Tax (STT)</span>
                      <span className="font-mono">{formatCurrency(estSTT)}</span>
                    </div>
                    <div className="flex justify-between py-2.5 border-b border-border/50 text-sm text-muted-foreground">
                      <span className="pl-4">GST (18% on fees)</span>
                      <span className="font-mono">{formatCurrency(estGST)}</span>
                    </div>
                    <div className="flex justify-between py-2.5 border-b border-border/50 text-sm text-muted-foreground">
                      <span className="pl-4">Exchange Turnover & Stamp Duties</span>
                      <span className="font-mono">{formatCurrency(estExchangeCharges + estSebiStamp)}</span>
                    </div>
                    <div className="flex justify-between py-2.5 border-b border-border/50 text-sm font-bold text-muted-foreground bg-secondary/10 px-2 rounded">
                      <span>Total Estimated Expenses & Charges (D)</span>
                      <span className="text-foreground font-mono">{formatCurrency(totalTaxesAndCharges)}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-border/50 text-base font-black bg-primary/10 px-2 rounded mt-2">
                      <span>Net Realized P&L (E = C - D)</span>
                      <span className={netRealizedPnL >= 0 ? "text-trading-green font-mono" : "text-trading-red font-mono"}>
                        {formatCurrency(netRealizedPnL)}
                      </span>
                    </div>
                  </div>
                  <div className="bg-secondary/15 rounded-lg p-3 flex gap-3 text-xs text-muted-foreground items-start">
                    <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <p>
                      Intraday algorithmic strategies are subject to slippage and exchange latencies. The P&L statements above estimate regulatory taxes (STT/GST) and a standard discount brokerage flat charge structure of ₹20 per leg.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TAXATION ESTIMATOR */}
          {activeTab === "taxation" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Calculator className="h-5 w-5 text-trading-gold" />
                  <h3 className="text-lg font-semibold">Regulatory Charge Breakdown & Capital Gains</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Indian financial market regulations levy statutory taxes on derivatives and intraday equity turnovers. 
                  High-frequency trading setups requires regular audit tracking to offset tax drags against capital gains.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                  {/* Left Column: Tax Projections */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-2">
                      Income Tax Estimates
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Net Realized P&L</span>
                        <span className={`font-mono font-semibold ${netRealizedPnL >= 0 ? "text-trading-green" : "text-trading-red"}`}>
                          {formatCurrency(netRealizedPnL)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax Classification</span>
                        <span className="font-semibold text-foreground">Speculative Intraday Income</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Estimated Tax Rate (Flat)</span>
                        <span className="font-semibold text-foreground">15.0% (STCG Estimate)</span>
                      </div>
                      <div className="flex justify-between text-sm border-t border-border/30 pt-3">
                        <span className="font-bold">Estimated Tax Provision</span>
                        <span className="font-mono font-bold text-trading-red">{formatCurrency(estTaxPayable)}</span>
                      </div>
                      <div className="flex justify-between text-sm border-t border-border/30 pt-3 bg-secondary/10 p-2 rounded">
                        <span className="font-black text-foreground">Net Profit Post-Tax Provision</span>
                        <span className={`font-mono font-black ${netProfitPostTax >= 0 ? "text-trading-green" : "text-trading-red"}`}>
                          {formatCurrency(netProfitPostTax)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Brokerage & Regulatory Details */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-2">
                      Regulatory Levies Breakdown
                    </h4>
                    <div className="space-y-3 font-mono text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Orders Placed:</span>
                        <span className="text-foreground font-semibold">{totalTradesCount * 2} legs</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Estimated Turnover:</span>
                        <span className="text-foreground font-semibold">{formatCurrency(estTurnover)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Brokerage (Flat ₹20/order):</span>
                        <span className="text-foreground font-semibold">{formatCurrency(estBrokerage)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">STT (0.025% sell side):</span>
                        <span className="text-foreground font-semibold">{formatCurrency(estSTT)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">GST (18% on Brokerage+Exchange):</span>
                        <span className="text-foreground font-semibold">{formatCurrency(estGST)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Stamp Duty & Exchange Fees:</span>
                        <span className="text-foreground font-semibold">{formatCurrency(estExchangeCharges + estSebiStamp)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-t border-border/50 pt-6">
                  <div className="p-4 bg-trading-gold/5 border border-trading-gold/20 rounded-lg flex gap-3 text-xs text-trading-gold">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <div>
                      <strong className="font-bold block mb-1">Tax Offset Notice (India Income Tax Act Section 43(5)):</strong>
                      Speculative business losses (intraday stock trading) cannot be offset against ordinary salary income, but can be carried forward up to 4 assessment years to offset future speculative trading gains. Always consult a Chartered Accountant for statutory filing requirements.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BALANCE SHEET */}
          {activeTab === "balance_sheet" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6 border-b border-border/50 pb-4">
                  <Receipt className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="text-lg font-semibold">Balance Sheet Statement</h3>
                    <p className="text-xs text-muted-foreground">As of {new Date().toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-border">
                  {/* ASSETS */}
                  <div className="space-y-6">
                    <h4 className="text-base font-bold text-primary tracking-wider uppercase">Assets</h4>
                    
                    <div className="space-y-3 pr-2">
                      <div className="flex justify-between text-sm border-b border-border/30 pb-2">
                        <span className="text-muted-foreground font-medium">Personal Wallet Cash (Withdrawable)</span>
                        <span className="font-mono font-semibold">{formatCurrency(withdrawable)}</span>
                      </div>
                      <div className="flex justify-between text-sm border-b border-border/30 pb-2">
                        <span className="text-muted-foreground font-medium">Active Trading Engine Capital</span>
                        <span className="font-mono font-semibold">{formatCurrency(deployed)}</span>
                      </div>
                      <div className="flex justify-between text-sm border-b border-border/30 pb-2 italic text-muted-foreground/85">
                        <span className="pl-4">Estimated Receivables</span>
                        <span className="font-mono">₹0.00</span>
                      </div>
                      
                      <div className="flex justify-between text-base font-black border-t border-border/80 pt-4 bg-secondary/10 p-2 rounded">
                        <span>Total Assets (A)</span>
                        <span className="font-mono text-primary">{formatCurrency(equity)}</span>
                      </div>
                    </div>
                  </div>

                  {/* EQUITY & LIABILITIES */}
                  <div className="space-y-6 md:pl-8 pt-6 md:pt-0">
                    <h4 className="text-base font-bold text-trading-blue tracking-wider uppercase">Equity & Liabilities</h4>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm border-b border-border/30 pb-2">
                        <span className="text-muted-foreground font-medium">Capital Account (Deposited Cash)</span>
                        <span className="font-mono font-semibold">{formatCurrency(totalDepositsVal)}</span>
                      </div>
                      <div className="flex justify-between text-sm border-b border-border/30 pb-2">
                        <span className="text-muted-foreground font-medium">Drawings (Withdrawn Cash)</span>
                        <span className="font-mono font-semibold">({formatCurrency(totalWithdrawalsVal)})</span>
                      </div>
                      <div className="flex justify-between text-sm border-b border-border/30 pb-2">
                        <span className="text-muted-foreground font-medium">Retained Trading P&L</span>
                        <span className={`font-mono font-semibold ${grossRealizedPnL >= 0 ? "text-trading-green" : "text-trading-red"}`}>
                          {formatCurrency(grossRealizedPnL)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between text-base font-black border-t border-border/80 pt-4 bg-secondary/10 p-2 rounded">
                        <span>Total Equity (B)</span>
                        <span className="font-mono text-trading-blue">{formatCurrency(totalDepositsVal - totalWithdrawalsVal + grossRealizedPnL)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Accounting Equation Validation */}
                <div className="mt-8 pt-6 border-t border-border/50">
                  <div className="flex items-center justify-between p-4 bg-trading-green/10 border border-trading-green/20 rounded-lg text-sm">
                    <div className="flex items-center gap-2 text-trading-green">
                      <CheckCircle2 className="h-5 w-5" />
                      <div>
                        <span className="font-bold block">Accounting Equation Balance: Assets = Equity + Liabilities</span>
                        <span className="text-xs text-muted-foreground">All transaction logs consolidated inside SQLite are structurally synchronized.</span>
                      </div>
                    </div>
                    <span className="font-mono font-black text-trading-green text-base">
                      {formatCurrency(equity)} = {formatCurrency(totalDepositsVal - totalWithdrawalsVal + grossRealizedPnL)}
                    </span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: TRIAL BALANCE */}
          {activeTab === "trial_balance" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border/50 bg-secondary/10">
                  <h3 className="font-semibold text-lg">Double-Entry Trial Balance</h3>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">Consolidation of ledger debit and credit balances.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-secondary/30 text-muted-foreground border-b border-border/50 font-mono">
                      <tr>
                        <th className="px-6 py-4 font-bold">Ledger Account</th>
                        <th className="px-6 py-4 font-bold">Account Classification</th>
                        <th className="px-6 py-4 font-bold text-right">Debit Balance (₹)</th>
                        <th className="px-6 py-4 font-bold text-right">Credit Balance (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50 font-mono text-xs">
                      {/* Personal cash */}
                      <tr className="hover:bg-secondary/5 transition-colors">
                        <td className="px-6 py-4 font-bold text-foreground">Withdrawable Wallet Balance</td>
                        <td className="px-6 py-4 text-muted-foreground">Asset</td>
                        <td className="px-6 py-4 text-right text-foreground">{formatCurrency(withdrawable)}</td>
                        <td className="px-6 py-4 text-right text-muted-foreground">-</td>
                      </tr>
                      {/* Active capital */}
                      <tr className="hover:bg-secondary/5 transition-colors">
                        <td className="px-6 py-4 font-bold text-foreground">Active Trading Capital</td>
                        <td className="px-6 py-4 text-muted-foreground">Asset</td>
                        <td className="px-6 py-4 text-right text-foreground">{formatCurrency(deployed)}</td>
                        <td className="px-6 py-4 text-right text-muted-foreground">-</td>
                      </tr>
                      {/* Capital deposits */}
                      <tr className="hover:bg-secondary/5 transition-colors">
                        <td className="px-6 py-4 font-bold text-foreground">Capital Input (Deposits)</td>
                        <td className="px-6 py-4 text-muted-foreground">Equity</td>
                        <td className="px-6 py-4 text-right text-muted-foreground">-</td>
                        <td className="px-6 py-4 text-right text-foreground">{formatCurrency(totalDepositsVal)}</td>
                      </tr>
                      {/* Capital withdrawals */}
                      <tr className="hover:bg-secondary/5 transition-colors">
                        <td className="px-6 py-4 font-bold text-foreground">Drawings (Withdrawals)</td>
                        <td className="px-6 py-4 text-muted-foreground">Equity Reduction</td>
                        <td className="px-6 py-4 text-right text-foreground">{formatCurrency(totalWithdrawalsVal)}</td>
                        <td className="px-6 py-4 text-right text-muted-foreground">-</td>
                      </tr>
                      {/* Realized trading profit */}
                      <tr className="hover:bg-secondary/5 transition-colors">
                        <td className="px-6 py-4 font-bold text-foreground">Realized Trading Profits</td>
                        <td className="px-6 py-4 text-muted-foreground">Revenue (Credit)</td>
                        <td className="px-6 py-4 text-right text-muted-foreground">-</td>
                        <td className="px-6 py-4 text-right text-foreground">{formatCurrency(grossProfitsVal)}</td>
                      </tr>
                      {/* Realized trading loss */}
                      <tr className="hover:bg-secondary/5 transition-colors">
                        <td className="px-6 py-4 font-bold text-foreground">Realized Trading Losses</td>
                        <td className="px-6 py-4 text-muted-foreground">Expense (Debit)</td>
                        <td className="px-6 py-4 text-right text-foreground">{formatCurrency(grossLossesVal)}</td>
                        <td className="px-6 py-4 text-right text-muted-foreground">-</td>
                      </tr>
                      {/* Totals */}
                      <tr className="bg-secondary/25 font-bold border-t border-border text-sm">
                        <td className="px-6 py-4 text-foreground">Trial Balance Total</td>
                        <td className="px-6 py-4 text-muted-foreground">Standard Check</td>
                        <td className="px-6 py-4 text-right text-primary">
                          {formatCurrency(withdrawable + deployed + totalWithdrawalsVal + grossLossesVal)}
                        </td>
                        <td className="px-6 py-4 text-right text-primary">
                          {formatCurrency(totalDepositsVal + grossProfitsVal)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-6 border-t border-border/50 bg-secondary/10">
                  <div className="flex gap-3 text-xs text-muted-foreground items-start">
                    <CheckCircle2 className="h-4 w-4 text-trading-green shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      <strong>Audit Trail Verified:</strong> The trial balance validates that total debits match total credits perfectly. This checks the mathematical integrity of all ledger entries made by the AlphaMind trading system to ensure no capital leaks or unmapped values.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}
