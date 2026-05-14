"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import axios from "axios"
import { Wallet, PlusCircle, ArrowDownCircle, ArrowUpCircle, History, RefreshCcw, ArrowLeft, Loader2 } from "lucide-react"

export default function WalletPage() {
  const { data: session } = useSession()
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [depositAmount, setDepositAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [isDepositing, setIsDepositing] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [depositProgress, setDepositProgress] = useState(0)
  const [equity, setEquity] = useState(0)
  const [transactions, setTransactions] = useState<any[]>([])

  useEffect(() => {
    const token = (session as any)?.accessToken;
    if (token) {
       axios.get("http://127.0.0.1:8000/api/v1/wallet/", {
         headers: { Authorization: `Bearer ${token}` }
       })
       .then(res => setEquity(Number(res.data.balance) || 0))
       .catch(e => console.error("Wallet fetch error", e))

       axios.get("http://127.0.0.1:8000/api/v1/wallet/transactions", {
         headers: { Authorization: `Bearer ${token}` }
       })
       .then(res => setTransactions(res.data || []))
       .catch(e => console.error("Transactions error", e))
    }
  }, [session])

  const handleDeposit = async () => {
    setIsDepositing(true)
    let progress = 0
    const interval = setInterval(() => {
      progress += 15
      setDepositProgress(Math.min(progress, 90))
    }, 200)

    try {
      await axios.post("http://127.0.0.1:8000/api/v1/wallet/deposit", {
        amount: Number(depositAmount),
        type: "deposit",
        description: "Native UI Push"
      }, {
        headers: { Authorization: `Bearer ${(session as any)?.accessToken}` }
      })

      clearInterval(interval)
      setDepositProgress(100)
      setEquity(prev => prev + Number(depositAmount))
      
      // Optioanlly refetch transactions
      const txRes = await axios.get("http://127.0.0.1:8000/api/v1/wallet/transactions", {
         headers: { Authorization: `Bearer ${(session as any)?.accessToken}` }
      });
      setTransactions(txRes.data || []);
      
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
    }, 200)

    try {
      await axios.post("http://127.0.0.1:8000/api/v1/wallet/withdraw", {
        amount: Number(withdrawAmount),
        type: "withdrawal",
        description: "Native UI Withdrawal"
      }, {
        headers: { Authorization: `Bearer ${(session as any)?.accessToken}` }
      })

      clearInterval(interval)
      setDepositProgress(100)
      setEquity(prev => prev - Number(withdrawAmount))
      
      const txRes = await axios.get("http://127.0.0.1:8000/api/v1/wallet/transactions", {
         headers: { Authorization: `Bearer ${(session as any)?.accessToken}` }
      });
      setTransactions(txRes.data || []);
      
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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-20">
      <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
      </Link>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ledger & Wallet</h1>
          <p className="text-muted-foreground mt-1">
            Manage your un-deployed capital and review algorithmic transaction history.
          </p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => setShowDepositModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition-all bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
          >
            <PlusCircle className="h-4 w-4" /> Add Capital
          </button>
          <button 
            onClick={() => setShowWithdrawModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition-all border border-border hover:bg-accent hover:text-accent-foreground text-foreground shadow-sm"
          >
            <ArrowDownCircle className="h-4 w-4" /> Withdraw
          </button>
        </div>
      </div>

      {/* Main Balances */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Total Equity</h3>
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-4xl font-bold tracking-tight text-foreground">₹{equity.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-2">Combined liquid and locked capital.</p>
          </div>
        </div>

        <div className="rounded-xl border border-trading-blue/30 bg-trading-blue/5 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-trading-blue">Active Trading Engine</h3>
            <RefreshCcw className="h-5 w-5 text-trading-blue" />
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-foreground">₹0.00</div>
            <p className="text-xs text-muted-foreground mt-2 text-trading-blue/80">Capital deployed in open algorithms.</p>
          </div>
        </div>

        <div className="rounded-xl border border-trading-green/30 bg-trading-green/5 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-trading-green">Withdrawable Cash</h3>
            <ArrowUpCircle className="h-5 w-5 text-trading-green" />
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-foreground">₹{equity.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-2 text-trading-green/80">Idle capital available for withdrawal.</p>
          </div>
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
                    <td className="px-6 py-4 font-mono font-semibold">
                      ₹{Number(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-trading-green/10 text-trading-green px-2 py-1 rounded-md text-xs font-semibold uppercase">{tx.status || "Completed"}</span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground max-w-[200px] truncate">
                      {tx.description}
                    </td>
                    <td className="px-6 py-4 text-right text-muted-foreground">
                      {new Date(tx.created_at).toLocaleString()}
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
              <p className="text-sm text-muted-foreground mt-1">Simulate a bank transfer to your local Native Wallet.</p>
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
                className="px-4 py-2 rounded-md font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeposit}
                disabled={!depositAmount || Number(depositAmount) < 1000 || isDepositing}
                className="relative overflow-hidden px-4 py-2 rounded-md font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
              >
                {isDepositing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                  </span>
                ) : "Confirm Deposit"}
                
                {/* Progress Bar Overlay */}
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
              <p className="text-sm text-muted-foreground mt-1">Liquidate algorithm funds instantly.</p>
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
                    placeholder={`Max: ₹${equity}`}
                    className="w-full rounded-md border border-input bg-background/50 px-4 py-3 text-lg font-mono text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                  />
                  <button 
                    onClick={() => setWithdrawAmount(equity.toString())}
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
                className="px-4 py-2 rounded-md font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleWithdraw}
                disabled={!withdrawAmount || Number(withdrawAmount) < 1000 || Number(withdrawAmount) > equity || isWithdrawing}
                className="relative overflow-hidden px-4 py-2 rounded-md font-medium bg-trading-red/90 text-white hover:bg-trading-red transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px] shadow-lg shadow-trading-red/20"
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
    </div>
  )
}
