"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import axios from "axios"
import { Wallet, PlusCircle, ArrowDownCircle, ArrowUpCircle, History, RefreshCcw, ArrowLeft, Loader2, ArrowRightCircle } from "lucide-react"
import { parseDate } from "@/lib/utils"

export default function WalletPage() {
  const { data: session } = useSession()
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [showAllocateModal, setShowAllocateModal] = useState(false)
  const [showRecallModal, setShowRecallModal] = useState(false)
  
  const [depositAmount, setDepositAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [allocateAmount, setAllocateAmount] = useState("")
  const [recallAmount, setRecallAmount] = useState("")
  
  const [isDepositing, setIsDepositing] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [isAllocating, setIsAllocating] = useState(false)
  const [isRecalling, setIsRecalling] = useState(false)
  const [depositProgress, setDepositProgress] = useState(0)
  
  const [walletData, setWalletData] = useState<any>({
    balance: 0,
    trading_capital: 0,
    withdrawable_balance: 0,
  })
  const [transactions, setTransactions] = useState<any[]>([])

  const totalDeposits = transactions
    .filter((tx: any) => tx.type === "deposit")
    .reduce((sum: number, tx: any) => sum + Number(tx.amount), 0)
    
  const totalWithdrawals = transactions
    .filter((tx: any) => tx.type === "withdrawal")
    .reduce((sum: number, tx: any) => sum + Number(tx.amount), 0)

  const fetchWallet = async (token: string) => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/v1/wallet/", {
        headers: { Authorization: `Bearer ${token}` }
      })
      setWalletData(res.data)
    } catch (e) {
      console.error("Wallet fetch error", e)
    }
  }

  const fetchTransactions = async (token: string) => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/v1/wallet/transactions", {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTransactions(res.data || [])
    } catch (e) {
      console.error("Transactions error", e)
    }
  }

  useEffect(() => {
    const token = (session as any)?.accessToken;
    if (token) {
      fetchWallet(token)
      fetchTransactions(token)
    }
  }, [session])

  const handleDeposit = async () => {
    setIsDepositing(true)
    let progress = 0
    const interval = setInterval(() => {
      progress += 15
      setDepositProgress(Math.min(progress, 90))
    }, 150)

    try {
      const token = (session as any)?.accessToken;
      await axios.post("http://127.0.0.1:8000/api/v1/wallet/deposit", {
        amount: Number(depositAmount),
        type: "deposit",
        description: "Native UI Push"
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      clearInterval(interval)
      setDepositProgress(100)
      
      if (token) {
        await fetchWallet(token)
        await fetchTransactions(token)
      }
      
      setTimeout(() => {
        setIsDepositing(false)
        setShowDepositModal(false)
        setDepositProgress(0)
        setDepositAmount("")
      }, 500)
    } catch (e) {
      console.error(e)
      clearInterval(interval)
      setIsDepositing(false)
    }
  }

  const handleWithdraw = async () => {
    setIsWithdrawing(true)
    let progress = 0
    const interval = setInterval(() => {
      progress += 15
      setDepositProgress(Math.min(progress, 90))
    }, 150)

    try {
      const token = (session as any)?.accessToken;
      await axios.post("http://127.0.0.1:8000/api/v1/wallet/withdraw", {
        amount: Number(withdrawAmount),
        type: "withdrawal",
        description: "Native UI Withdrawal"
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      clearInterval(interval)
      setDepositProgress(100)
      
      if (token) {
        await fetchWallet(token)
        await fetchTransactions(token)
      }
      
      setTimeout(() => {
        setIsWithdrawing(false)
        setShowWithdrawModal(false)
        setDepositProgress(0)
        setWithdrawAmount("")
      }, 500)
    } catch (e) {
      console.error(e)
      clearInterval(interval)
      setIsWithdrawing(false)
      alert("Insufficient funds or backend error.")
    }
  }

  const handleAllocate = async () => {
    setIsAllocating(true)
    let progress = 0
    const interval = setInterval(() => {
      progress += 15
      setDepositProgress(Math.min(progress, 90))
    }, 150)

    try {
      const token = (session as any)?.accessToken;
      await axios.post("http://127.0.0.1:8000/api/v1/wallet/allocate", {
        amount: Number(allocateAmount),
        type: "fee",
        description: "Capital Allocation to Engine"
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      clearInterval(interval)
      setDepositProgress(100)
      
      if (token) {
        await fetchWallet(token)
        await fetchTransactions(token)
      }
      
      setTimeout(() => {
        setIsAllocating(false)
        setShowAllocateModal(false)
        setDepositProgress(0)
        setAllocateAmount("")
      }, 500)
    } catch (e) {
      console.error(e)
      clearInterval(interval)
      setIsAllocating(false)
      alert("Allocation failed: make sure you have sufficient withdrawable cash.")
    }
  }

  const handleRecall = async () => {
    setIsRecalling(true)
    let progress = 0
    const interval = setInterval(() => {
      progress += 15
      setDepositProgress(Math.min(progress, 90))
    }, 150)

    try {
      const token = (session as any)?.accessToken;
      await axios.post("http://127.0.0.1:8000/api/v1/wallet/deallocate", {
        amount: Number(recallAmount),
        type: "deposit",
        description: "Capital Recalled from Engine"
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      clearInterval(interval)
      setDepositProgress(100)
      
      if (token) {
        await fetchWallet(token)
        await fetchTransactions(token)
      }
      
      setTimeout(() => {
        setIsRecalling(false)
        setShowRecallModal(false)
        setDepositProgress(0)
        setRecallAmount("")
      }, 500)
    } catch (e) {
      console.error(e)
      clearInterval(interval)
      setIsRecalling(false)
      alert("Recall failed: make sure you have enough capital deployed to recall.")
    }
  }

  const withdrawable = Number(walletData.withdrawable_balance) || 0
  const deployed = Number(walletData.trading_capital) || 0
  const equity = Number(walletData.balance) || 0

  return (
    <div className="pt-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-20">
      <Link href="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 border border-border bg-card/40 hover:bg-secondary/35 rounded-full text-xs font-semibold text-muted-foreground hover:text-foreground transition-all duration-200 mb-6 w-fit shadow-sm">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
      </Link>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ledger & Wallet</h1>
          <p className="text-muted-foreground mt-1">
            Manage your personal upload funding wallet and deploy capital into algorithm slots.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2.5">
          <button 
            onClick={() => setShowDepositModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-bold transition-all bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/10"
          >
            <PlusCircle className="h-4 w-4" /> Add Capital
          </button>
          <button 
            onClick={() => setShowWithdrawModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-bold transition-all border border-border hover:bg-accent hover:text-accent-foreground text-foreground shadow-sm"
          >
            <ArrowDownCircle className="h-4 w-4" /> Withdraw
          </button>
          <button 
            onClick={() => setShowAllocateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-bold transition-all bg-trading-blue hover:bg-trading-blue/90 text-white shadow-md shadow-trading-blue/10"
          >
            <ArrowRightCircle className="h-4 w-4" /> Deploy to Algo
          </button>
          <button 
            onClick={() => setShowRecallModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-bold transition-all border border-trading-blue/30 hover:bg-trading-blue/10 text-trading-blue shadow-sm"
          >
            <ArrowDownCircle className="h-4 w-4" /> Recall from Algo
          </button>
        </div>
      </div>

      {/* Main Balances */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {/* Total Equity */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute right-0 top-0 h-20 w-20 translate-x-1/3 -translate-y-1/3 rounded-full bg-primary/10 blur-xl transition-all group-hover:bg-primary/20" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Total Account Equity</h3>
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-4xl font-bold tracking-tight text-foreground font-mono">₹{equity.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-2">Combined liquid personal and locked engine capital.</p>
          </div>
        </div>

        {/* Algorithmic Deployed Capital */}
        <div className="rounded-xl border border-trading-blue/30 bg-trading-blue/5 p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute right-0 top-0 h-20 w-20 translate-x-1/3 -translate-y-1/3 rounded-full bg-trading-blue/10 blur-xl transition-all group-hover:bg-trading-blue/20" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-trading-blue">Active Deployed Capital</h3>
            <RefreshCcw className="h-5 w-5 text-trading-blue" />
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-foreground font-mono">₹{deployed.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-2 text-trading-blue/80">Capital actively traded by deployed PPO models.</p>
          </div>
        </div>

        {/* Personal Wallet Cash */}
        <div className="rounded-xl border border-trading-green/30 bg-trading-green/5 p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute right-0 top-0 h-20 w-20 translate-x-1/3 -translate-y-1/3 rounded-full bg-trading-green/10 blur-xl transition-all group-hover:bg-trading-green/20" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-trading-green">Withdrawable Cash (Personal Wallet)</h3>
            <ArrowUpCircle className="h-5 w-5 text-trading-green" />
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-foreground font-mono">₹{withdrawable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-2 text-trading-green/80">Funding wallet capital available for withdrawals/algo deployment.</p>
          </div>
        </div>
      </div>

      {/* Segregated Capital Flow Tracker */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider block">Total Capital Deposited</span>
            <span className="text-2xl font-bold text-trading-green font-mono">+₹{totalDeposits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-trading-green bg-trading-green/10 border border-trading-green/20 px-2.5 py-1 rounded-md">
            Capital Inflow
          </span>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider block">Total Capital Withdrawn</span>
            <span className="text-2xl font-bold text-trading-red font-mono">-₹{totalWithdrawals.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-trading-red bg-trading-red/10 border border-trading-red/20 px-2.5 py-1 rounded-md">
            Capital Outflow
          </span>
        </div>
      </div>

      {/* Transactions */}
      <div className="mt-8 rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Transaction Ledger</h2>
          </div>
          <span className="text-xs bg-secondary text-muted-foreground px-2 py-1 rounded-md">Last 30 Days</span>
        </div>
        
        {transactions.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center min-h-[300px] text-muted-foreground">
             <Wallet className="h-12 w-12 mb-4 opacity-20" />
             <p className="font-medium">No Recent Transactions</p>
             <p className="text-sm mt-1 max-w-sm">Deposit initial mock capital to see transactions simulated on your local SQLite database.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-secondary/30 text-muted-foreground border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Description</th>
                  <th className="px-6 py-4 font-medium text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {transactions.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-secondary/10 transition-colors">
                    <td className="px-6 py-4 capitalize font-medium flex items-center gap-2">
                       {tx.type === "deposit" || tx.type.includes("profit") ? (
                          <span className="text-trading-green flex items-center gap-1"><ArrowUpCircle className="h-4 w-4"/> {tx.type}</span>
                       ) : (
                          <span className="text-trading-red flex items-center gap-1"><ArrowDownCircle className="h-4 w-4"/> {tx.type}</span>
                       )}
                    </td>
                    <td className={`px-6 py-4 font-mono font-semibold ${
                      tx.type === "deposit" || tx.type.includes("profit") ? "text-trading-green" : "text-trading-red"
                    }`}>
                      {tx.type === "deposit" || tx.type.includes("profit") ? "+" : "-"}₹{Number(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-trading-green/10 text-trading-green px-2 py-1 rounded-md text-xs font-semibold uppercase">{tx.status || "Completed"}</span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground max-w-[200px] truncate relative group cursor-help">
                      <span>{tx.description}</span>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-64 p-2.5 bg-popover text-popover-foreground text-[10.5px] rounded border border-border shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none text-left leading-relaxed whitespace-normal break-words font-normal">
                        {tx.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-muted-foreground font-mono">
                      {parseDate(tx.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border/50">
              <h2 className="text-2xl font-bold">Add Capital</h2>
              <p className="text-sm text-muted-foreground mt-1">Simulate a bank transfer to your local Funding Wallet.</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Deposit Amount (₹)</label>
                <input
                  type="number"
                  min="1000"
                  step="100"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="e.g. 50000"
                  className="w-full rounded-md border border-input bg-background/50 px-4 py-3 text-lg font-mono text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>
              
              <div className="flex gap-2">
                 {[10000, 50000, 100000].map(amt => (
                    <button 
                      key={amt}
                      onClick={() => setDepositAmount(amt.toString())}
                      className="flex-1 text-xs border border-border/50 rounded-md py-2 hover:bg-secondary transition-colors"
                    >
                      +₹{(amt/1000).toFixed(0)}k
                    </button>
                 ))}
              </div>
            </div>
            
            <div className="p-6 bg-secondary/30 border-t border-border/50 flex justify-end gap-3">
              <button 
                onClick={() => setShowDepositModal(false)}
                className="px-4 py-2 rounded-md font-semibold text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors border border-border"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeposit}
                disabled={!depositAmount || Number(depositAmount) < 1000 || isDepositing}
                className="relative overflow-hidden px-4 py-2 rounded-md text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
              >
                {isDepositing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                  </span>
                ) : "Confirm Deposit"}
                
                {isDepositing && (
                   <div 
                     className="absolute bottom-0 left-0 h-1 bg-white/40 transition-all duration-200 ease-out" 
                     style={{ width: `${depositProgress}%` }}
                   />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border/50">
              <h2 className="text-2xl font-bold">Withdraw Capital</h2>
              <p className="text-sm text-muted-foreground mt-1">Liquidate funding wallet capital.</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Withdrawal Amount (₹)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1000"
                    step="100"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder={`Max: ₹${withdrawable}`}
                    className="w-full rounded-md border border-input bg-background/50 px-4 py-3 text-lg font-mono text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                  />
                  <button 
                    onClick={() => setWithdrawAmount(withdrawable.toString())}
                    className="absolute right-3 top-3 text-xs font-semibold text-primary/80 hover:text-primary transition-colors bg-primary/10 px-2 py-1 rounded-sm"
                  >
                    MAX
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-secondary/30 border-t border-border/50 flex justify-end gap-3">
              <button 
                onClick={() => setShowWithdrawModal(false)}
                className="px-4 py-2 rounded-md font-semibold text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors border border-border"
              >
                Cancel
              </button>
              <button 
                onClick={handleWithdraw}
                disabled={!withdrawAmount || Number(withdrawAmount) < 1000 || Number(withdrawAmount) > withdrawable || isWithdrawing}
                className="relative overflow-hidden px-4 py-2 rounded-md text-xs font-bold bg-trading-red/90 text-white hover:bg-trading-red transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px] shadow-lg shadow-trading-red/10"
              >
                {isWithdrawing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                  </span>
                ) : "Confirm Withdraw"}
                
                {isWithdrawing && (
                   <div 
                     className="absolute bottom-0 left-0 h-1 bg-white/40 transition-all duration-200 ease-out" 
                     style={{ width: `${depositProgress}%` }}
                   />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Allocate to Algo Modal */}
      {showAllocateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border/50">
              <h2 className="text-2xl font-bold">Deploy to Algorithm</h2>
              <p className="text-sm text-muted-foreground mt-1">Move cash from your funding wallet into the active AI engine.</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Allocation Amount (₹)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1000"
                    step="100"
                    value={allocateAmount}
                    onChange={(e) => setAllocateAmount(e.target.value)}
                    placeholder={`Max: ₹${withdrawable}`}
                    className="w-full rounded-md border border-input bg-background/50 px-4 py-3 text-lg font-mono text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                  />
                  <button 
                    onClick={() => setAllocateAmount(withdrawable.toString())}
                    className="absolute right-3 top-3 text-xs font-semibold text-primary/80 hover:text-primary transition-colors bg-primary/10 px-2 py-1 rounded-sm"
                  >
                    MAX
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-secondary/30 border-t border-border/50 flex justify-end gap-3">
              <button 
                onClick={() => setShowAllocateModal(false)}
                className="px-4 py-2 rounded-md font-semibold text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors border border-border"
              >
                Cancel
              </button>
              <button 
                onClick={handleAllocate}
                disabled={!allocateAmount || Number(allocateAmount) < 1000 || Number(allocateAmount) > withdrawable || isAllocating}
                className="relative overflow-hidden px-4 py-2 rounded-md text-xs font-bold bg-trading-blue hover:bg-trading-blue/95 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px] shadow-lg shadow-trading-blue/10"
              >
                {isAllocating ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Deploying...
                  </span>
                ) : "Deploy Capital"}
                
                {isAllocating && (
                   <div 
                     className="absolute bottom-0 left-0 h-1 bg-white/40 transition-all duration-200 ease-out" 
                     style={{ width: `${depositProgress}%` }}
                   />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recall from Algo Modal */}
      {showRecallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border/50">
              <h2 className="text-2xl font-bold">Recall from Algorithm</h2>
              <p className="text-sm text-muted-foreground mt-1">Move cash from the AI engine back to your withdrawable funding wallet.</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Recall Amount (₹)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1000"
                    step="100"
                    value={recallAmount}
                    onChange={(e) => setRecallAmount(e.target.value)}
                    placeholder={`Max: ₹${deployed}`}
                    className="w-full rounded-md border border-input bg-background/50 px-4 py-3 text-lg font-mono text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                  />
                  <button 
                    onClick={() => setRecallAmount(deployed.toString())}
                    className="absolute right-3 top-3 text-xs font-semibold text-primary/80 hover:text-primary transition-colors bg-primary/10 px-2 py-1 rounded-sm"
                  >
                    MAX
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-secondary/30 border-t border-border/50 flex justify-end gap-3">
              <button 
                onClick={() => setShowRecallModal(false)}
                className="px-4 py-2 rounded-md font-semibold text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors border border-border"
              >
                Cancel
              </button>
              <button 
                onClick={handleRecall}
                disabled={!recallAmount || Number(recallAmount) < 1000 || Number(recallAmount) > deployed || isRecalling}
                className="relative overflow-hidden px-4 py-2 rounded-md text-xs font-bold border border-trading-blue/30 hover:bg-trading-blue/10 text-trading-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
              >
                {isRecalling ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Recalling...
                  </span>
                ) : "Recall Capital"}
                
                {isRecalling && (
                   <div 
                     className="absolute bottom-0 left-0 h-1 bg-white/40 transition-all duration-200 ease-out" 
                     style={{ width: `${depositProgress}%` }}
                   />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
