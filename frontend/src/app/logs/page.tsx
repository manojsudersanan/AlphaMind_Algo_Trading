"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { ArrowLeft, Activity, Terminal, Calendar, Award, Database, Search } from "lucide-react"
import Link from "next/link"
import axios from "axios"

export default function LogsPage() {
  const { data: session } = useSession()
  
  // Data States
  const [sessions, setSessions] = useState<any[]>([])
  const [trades, setTrades] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all") // all, profit, loss, deposits

  useEffect(() => {
    const token = (session as any)?.accessToken
    if (token) {
      const fetchData = async () => {
        try {
          // Fetch historical sessions
          const sessionsRes = await axios.get("http://127.0.0.1:8000/api/v1/trading/sessions", {
            headers: { Authorization: `Bearer ${token}` }
          })
          setSessions(sessionsRes.data || [])

          // Fetch recent wallet transactions (which contain trade outputs)
          const transactionsRes = await axios.get("http://127.0.0.1:8000/api/v1/wallet/transactions?limit=250", {
            headers: { Authorization: `Bearer ${token}` }
          })
          setTrades(transactionsRes.data || [])
          setIsLoading(false)
        } catch (err) {
          console.error("Error fetching logs data:", err)
          setIsLoading(false)
        }
      }

      fetchData()
      const interval = setInterval(fetchData, 3000) // Poll every 3 seconds for live logs
      return () => clearInterval(interval)
    }
  }, [session])

  // Filter Trades
  const filteredTrades = trades.filter(t => {
    // 1. Search term match
    const matchesSearch = t.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.type?.toLowerCase().includes(searchTerm.toLowerCase())
    
    // 2. Type filter match
    let matchesType = true
    const transactionTypeLower = t.type?.toLowerCase() || ""
    if (typeFilter === "profit") {
      matchesType = transactionTypeLower === "trade_profit"
    } else if (typeFilter === "loss") {
      matchesType = transactionTypeLower === "trade_loss"
    } else if (typeFilter === "flow") {
      matchesType = transactionTypeLower === "deposit" || transactionTypeLower === "withdrawal"
    }

    return matchesSearch && matchesType
  })

  // Format Duration helper
  const formatDuration = (start: string, end: string | null) => {
    const startTime = new Date(start).getTime()
    const endTime = end ? new Date(end).getTime() : new Date().getTime()
    const diffMs = endTime - startTime
    
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins % 60}m`
    }
    return `${diffMins}m`
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      
      {/* Floating Back to Dashboard Navigation Pill */}
      <div className="flex">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 px-4 py-2 border border-border bg-card/40 hover:bg-secondary/35 rounded-full text-xs font-semibold text-muted-foreground hover:text-foreground transition-all duration-200 shadow-sm"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Logs</h1>
          <p className="text-muted-foreground mt-1">
            Browse mathematical simulation records, session parameters, and real-time execution outputs.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-secondary/30 border border-border px-3 py-1 rounded-full text-xs">
          <Database className="h-3.5 w-3.5 text-primary" />
          <span className="font-semibold font-mono text-muted-foreground">Records: {trades.length} Trades | {sessions.length} Sessions</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        
        {/* Left Section: Session Logs (Width 3/7) */}
        <div className="lg:col-span-3 rounded-xl border border-border bg-card shadow-sm flex flex-col h-[650px]">
          <div className="p-6 border-b border-border/50">
            <h3 className="font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" /> Deployment Sessions
            </h3>
            <p className="text-xs text-muted-foreground mt-1">Historical configurations of the trading engine runs.</p>
          </div>
          
          <div className="p-6 overflow-y-auto flex-1 space-y-4 bg-background/25">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                Fetching sessions...
              </div>
            ) : sessions.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground border border-dashed border-border rounded-lg p-6 text-center">
                No active or historical trading sessions found.
              </div>
            ) : (
              sessions.map((sess, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-card border border-border/80 hover:border-border transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-xs uppercase font-bold text-primary block">{sess.strategy_type} Strategy</span>
                      <span className="text-[10px] text-muted-foreground">{new Date(sess.start_time).toLocaleString()}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                      sess.status === "active" 
                        ? "bg-trading-green/10 text-trading-green border-trading-green/20" 
                        : "bg-muted text-muted-foreground border-border"
                    }`}>
                      {sess.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/40 text-[10px]">
                    <div>
                      <span className="text-muted-foreground block">Duration</span>
                      <span className="font-semibold text-foreground font-mono">{formatDuration(sess.start_time, sess.end_time)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Target</span>
                      <span className="font-semibold text-foreground font-mono">{sess.target_return}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Net Return</span>
                      <span className={`font-semibold font-mono ${
                        sess.end_balance && Number(sess.end_balance) - Number(sess.start_balance) >= 0
                          ? "text-trading-green" 
                          : "text-trading-red"
                      }`}>
                        {sess.end_balance 
                          ? `${Number(sess.end_balance) - Number(sess.start_balance) >= 0 ? "+" : ""}Rs.${(Number(sess.end_balance) - Number(sess.start_balance)).toFixed(2)}`
                          : "Running"
                        }
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Section: Monospaced Trade Logs (Width 4/7) */}
        <div className="lg:col-span-4 rounded-xl border border-border bg-card shadow-sm flex flex-col h-[650px]">
          <div className="p-6 border-b border-border/50 bg-gradient-to-r from-card to-secondary/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <Terminal className="h-4 w-4 text-primary" /> Algorithmic Trade Output
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Terminal stdout log simulation of live execution fills.</p>
            </div>
            
            {/* Filter controls */}
            <div className="flex gap-2 shrink-0">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-background border border-border rounded-md px-2 py-1 text-xs text-foreground focus:outline-none"
              >
                <option value="all">All Logs</option>
                <option value="profit">Profits only</option>
                <option value="loss">Losses only</option>
                <option value="flow">Capital flow</option>
              </select>
            </div>
          </div>
          
          {/* Search bar inside logs */}
          <div className="px-6 py-3 border-b border-border/30 bg-secondary/10 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search output strings (e.g. symbol, transaction, ID)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-xs text-foreground w-full placeholder:text-muted-foreground"
            />
          </div>

          <div className="p-6 flex-1 bg-black/45 rounded-b-xl overflow-y-auto font-mono text-[11px] leading-relaxed space-y-1 scrollbar-thin select-text">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                Initializing execution stream...
              </div>
            ) : filteredTrades.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground border border-dashed border-border/50 rounded-lg p-6 text-center">
                No stdout lines match the active filter query.
              </div>
            ) : (
              filteredTrades.map((t, idx) => {
                const rawDate = t.created_at || t.date || new Date().toISOString()
                const dateParsed = new Date(rawDate)
                const dateStr = isNaN(dateParsed.getTime())
                  ? new Date().toISOString().replace('T', ' ').substring(0, 19)
                  : dateParsed.toISOString().replace('T', ' ').substring(0, 19)
                let logType = "INFO "
                let logText = ""
                const typeLower = t.type?.toLowerCase() || ""
                
                if (typeLower === "trade_profit") {
                  logType = "PROFIT"
                  logText = `[BUY_FILL] Executed Trade SUCCESS | ${t.description} | Net Change: +Rs.${Number(t.amount).toFixed(2)}`
                } else if (typeLower === "trade_loss") {
                  logType = "LOSS  "
                  logText = `[SELL_FILL] Executed Trade CLOSE | ${t.description} | Net Change: -Rs.${Math.abs(Number(t.amount)).toFixed(2)}`
                } else if (typeLower === "deposit") {
                  logType = "WALLET"
                  logText = `[DEPOSIT] Deployed Capital Inflow: +Rs.${Number(t.amount).toFixed(2)} | Status: COMPLETED`
                } else if (typeLower === "withdrawal") {
                  logType = "WALLET"
                  logText = `[WITHDRAWAL] Recalled Cash Outflow: -Rs.${Math.abs(Number(t.amount)).toFixed(2)} | Status: COMPLETED`
                } else {
                  logText = t.description || "System log event recorded."
                }
                
                return (
                  <div key={idx} className="hover:bg-secondary/25 py-0.5 px-2 rounded transition-colors group">
                    <span className="text-muted-foreground">[{dateStr}] </span>
                    <span className={`font-bold ${
                      logType === "PROFIT" ? "text-trading-green" :
                      logType === "LOSS  " ? "text-trading-red" :
                      logType === "WALLET" ? "text-trading-blue" :
                      "text-primary"
                    }`}>
                      [{logType}]
                    </span>
                    <span className="text-foreground/90"> {logText}</span>
                    <span className="float-right text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity font-sans">
                      Balance Delta: {Number(t.amount) >= 0 ? "+" : ""}₹{Number(t.amount).toFixed(2)}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
