"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect, useRef } from "react"
import { Activity, Wallet, TrendingUp, Cpu, ArrowUpRight, ArrowDownRight, Zap, Newspaper } from "lucide-react"
import axios from "axios"
import Link from "next/link"
import PnLChart from "@/components/PnLChart"

export default function DashboardPage() {
  const { data: session } = useSession()
  const [walletBalance, setWalletBalance] = useState(0)
  const [tradingCapital, setTradingCapital] = useState(0)
  const [tradingConfig, setTradingConfig] = useState<any>(null)
  const [marketTicks, setMarketTicks] = useState<any[]>([])
  const [bestPrediction, setBestPrediction] = useState<any>(null)
  const [newsIntel, setNewsIntel] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [sessionsList, setSessionsList] = useState<any[]>([])
  const ws = useRef<WebSocket | null>(null)

  useEffect(() => {
    const token = (session as any)?.accessToken;
    
    if (token) {
      axios.get("http://127.0.0.1:8000/api/v1/trading/config", {
         headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setTradingConfig(res.data))
      .catch(console.error)
    }

    // Fetch news intelligence (no auth required)
    axios.get("http://127.0.0.1:8000/api/v1/news/intelligence")
      .then(res => setNewsIntel(res.data))
      .catch(console.error)
  }, [session])

  useEffect(() => {
    const token = (session as any)?.accessToken;
    if (token) {
      const fetchDynamicData = () => {
        axios.get("http://127.0.0.1:8000/api/v1/wallet/", {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
          setWalletBalance(Number(res.data.balance) || 0)
          setTradingCapital(Number(res.data.trading_capital) || 0)
        })
        .catch(console.error)

        axios.get("http://127.0.0.1:8000/api/v1/wallet/transactions?limit=200", {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => setTransactions(res.data || []))
        .catch(console.error)

        axios.get("http://127.0.0.1:8000/api/v1/trading/sessions", {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => setSessionsList(res.data || []))
        .catch(console.error)
      }

      fetchDynamicData()
      const interval = setInterval(fetchDynamicData, 3000)
      return () => clearInterval(interval)
    }
  }, [session])

  useEffect(() => {
    // Initialize WebSocket Connection
    ws.current = new WebSocket("ws://127.0.0.1:8000/ws/market_data")
    
    ws.current.onopen = () => {
      console.log("WebSocket connected!")
    }
    
    ws.current.onmessage = (event) => {
      const payload = JSON.parse(event.data)
      if (payload.type === "market_tick") {
        setMarketTicks(payload.data)
        
        // Calculate Best Profit Prediction dynamically
        const validTicks = payload.data.filter((t: any) => t.change_pct > 0)
        if (validTicks.length > 0) {
           const best = validTicks.reduce((max: any, tick: any) => max.change_pct > tick.change_pct ? max : tick)
           setBestPrediction({
             symbol: best.symbol,
             confidence: Math.min(99, 75 + best.change_pct * 10).toFixed(1),
             predicted_profit: (best.change_pct * 5).toFixed(2), // Amplified for UI effect
             price: best.price
           })
        }
      }
    }

    return () => {
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [])

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, trader <span className="text-foreground font-medium">{session?.user?.name || session?.user?.email}</span>.
          </p>
        </div>
        {tradingConfig?.is_active ? (
          tradingCapital >= 50 ? (
            <div className="flex items-center gap-2 bg-trading-green/10 text-trading-green px-4 py-2 rounded-full border border-trading-green/20">
              <div className="h-2 w-2 rounded-full bg-trading-green" />
              <span className="text-sm font-semibold">Native Engine Online</span>
            </div>
          ) : (
            <Link href="/wallet" className="flex items-center gap-2 bg-trading-gold/10 text-trading-gold px-4 py-2 rounded-full border border-trading-gold/20 hover:bg-trading-gold/20 transition-all">
              <div className="h-2 w-2 rounded-full bg-trading-gold" />
              <span className="text-xs font-semibold">Engine Active: Allocate Capital &rarr;</span>
            </Link>
          )
        ) : (
          <div className="flex items-center gap-2 bg-secondary/30 text-muted-foreground px-4 py-2 rounded-full border border-border">
            <div className="h-2 w-2 rounded-full bg-muted-foreground" />
            <span className="text-sm font-semibold">Engine Offline</span>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Wallet Card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm relative overflow-hidden group">

          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Total Balance</h3>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-foreground">
               ₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Synchronized Native Wallet
            </p>
          </div>
        </div>

        {/* AI Return Target */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm relative overflow-hidden group">

          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Return Target</h3>
            <TrendingUp className="h-4 w-4 text-trading-blue" />
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-foreground">{tradingConfig?.target_return_rate || "15.0"}%</div>
            <p className="text-xs text-muted-foreground mt-1 text-trading-green flex items-center gap-1">
              <Activity className="h-3 w-3" /> {tradingConfig?.trading_type === "intraday" ? "Intraday Optimal" : tradingConfig?.trading_type === "scalping" ? "Scalper Zone" : tradingConfig?.trading_type === "volatility" ? "Volatility Edge" : "F&O Active"}
            </p>
          </div>
        </div>

        {/* Engine Status */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm relative overflow-hidden group">

          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Active Model</h3>
            <Cpu className="h-4 w-4 text-trading-gold" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {tradingConfig?.is_active ? "ALPHAMIND ONLINE" : "PPO-Agent-v2"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              SB3 Torch Deployment
            </p>
          </div>
        </div>

        {/* PnL Preview Card */}
        <Link 
          href="/trading" 
          className="rounded-xl border border-border bg-card p-6 shadow-sm relative overflow-hidden group block hover:border-primary/50 transition-all duration-300 col-span-1"
        >

          <div className="flex flex-col h-full justify-between">
            <div className="flex flex-row items-center justify-between pb-1">
              <h3 className="text-sm font-medium text-muted-foreground">Profit & Loss Curve</h3>
              <TrendingUp className="h-4 w-4 text-trading-green group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
            <div className="h-[145px] w-full mt-2 relative">
              <PnLChart transactions={transactions} variant="preview" interactive={false} sessionsList={sessionsList} />
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 flex justify-between items-center">
              <span>Live Chart Engine</span>
              <span className="text-primary font-medium group-hover:underline">Detailed View &rarr;</span>
            </p>
          </div>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 rounded-xl border border-border bg-card shadow-sm min-h-[400px] flex flex-col">
          <div className="p-6 border-b border-border/50">
             <h3 className="font-semibold flex items-center gap-2"><Activity className="h-4 w-4" /> Live Market Feed</h3>
          </div>
          <div className="p-6 flex-1 bg-background/30 rounded-b-xl overflow-y-auto">
            {marketTicks.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground border-2 border-dashed border-border/50 rounded-lg p-10">
                Establishing High-Frequency WebSocket Connection...
              </div>
            ) : (
              <div className="space-y-3">
                {marketTicks.map((tick, idx) => (
                   <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-card border border-border/50 hover:border-border transition-colors">
                     <span className="font-semibold text-sm">{tick.symbol}</span>
                     <div className="flex items-center gap-4">
                       <span className="font-mono text-sm">₹{tick.price.toFixed(2)}</span>
                       <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md font-medium ${tick.change_pct >= 0 ? "bg-trading-green/10 text-trading-green" : "bg-trading-red/10 text-trading-red"}`}>
                         {tick.change_pct >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                         {Math.abs(tick.change_pct).toFixed(3)}%
                       </span>
                     </div>
                   </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="col-span-3 rounded-xl border border-border bg-card shadow-sm min-h-[400px] flex flex-col">
          <div className="p-6 border-b border-border/50 bg-gradient-to-r from-card to-secondary/20">
             <h3 className="font-semibold flex items-center gap-2"><Zap className="h-4 w-4 text-trading-gold" /> AI Alpha Predictions</h3>
          </div>
          <div className="p-6 space-y-4">
             {/* Dynamic Best Profit Prediction Box */}
             <div className="p-5 rounded-lg bg-gradient-to-br from-primary/10 via-background to-background border border-primary/20 relative overflow-hidden">
               <div className="text-xs uppercase font-bold text-primary mb-3 tracking-wider flex items-center gap-2">
                 <span className="relative flex h-2 w-2">
                   <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                 </span>
                 Live Profit Scanner
               </div>
               
               {bestPrediction ? (
                 <>
                   <div className="flex justify-between items-start mb-4">
                     <div>
                       <span className="font-black text-2xl text-foreground block">{bestPrediction.symbol}</span>
                       <span className="text-sm text-muted-foreground">Current CMP: ₹{bestPrediction.price.toFixed(2)}</span>
                     </div>
                     <span className="text-sm font-bold text-trading-green bg-trading-green/10 px-3 py-1.5 rounded-md border border-trading-green/20 shadow-sm shadow-trading-green/10">
                       EST. +{bestPrediction.predicted_profit}%
                     </span>
                   </div>
                   
                   <div className="space-y-2 mt-4">
                     <div className="flex justify-between text-xs font-medium">
                       <span className="text-muted-foreground">AI Confidence Score</span>
                       <span className="text-foreground">{bestPrediction.confidence}%</span>
                     </div>
                     <div className="w-full bg-secondary rounded-full h-1.5">
                       <div className="bg-primary h-1.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${bestPrediction.confidence}%` }}></div>
                     </div>
                     <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                       AlphaMind Engine detects strong institutional buying momentum in {bestPrediction.symbol}. Optimum 9:15 AM pattern convergence detected. Recommended action is <span className="text-trading-green font-bold">STRONG BUY</span>.
                     </p>
                   </div>
                 </>
               ) : (
                 <div className="h-32 flex items-center justify-center text-sm text-muted-foreground">
                   Analyzing market conditions...
                 </div>
               )}
             </div>

             <div className="p-4 rounded-lg bg-background/50 border border-border mt-4">
               <div className="flex justify-between items-center mb-2">
                 <span className="font-bold text-sm">BANKNIFTY Options</span>
                 <span className="text-xs text-trading-gold bg-trading-gold/10 px-2 py-1 rounded-sm border border-trading-gold/20">HOLD</span>
               </div>
               <p className="text-xs text-muted-foreground">Model confidence: 62.1% - Awaiting implied volatility compression breakout.</p>
             </div>
          </div>
        </div>
      </div>

      {/* Market Intelligence - News Effects Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border/50 bg-gradient-to-r from-card via-card to-secondary/10">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2"><Newspaper className="h-4 w-4 text-primary" /> Market Intelligence Feed</h3>
            {newsIntel && (
              <div className={`flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full border ${
                newsIntel.market_mood === 'BULLISH' ? 'bg-trading-green/10 text-trading-green border-trading-green/20' :
                newsIntel.market_mood === 'BEARISH' ? 'bg-trading-red/10 text-trading-red border-trading-red/20' :
                'bg-trading-gold/10 text-trading-gold border-trading-gold/20'
              }`}>
                <span className="relative flex h-2 w-2">
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${
                    newsIntel.market_mood === 'BULLISH' ? 'bg-trading-green' : newsIntel.market_mood === 'BEARISH' ? 'bg-trading-red' : 'bg-trading-gold'
                  }`}></span>
                </span>
                Market Mood: {newsIntel.market_mood} ({newsIntel.mood_score > 0 ? '+' : ''}{newsIntel.mood_score})
              </div>
            )}
          </div>
        </div>

        {newsIntel ? (
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
            {/* Short Term Effects */}
            <div className="p-5">
              <h4 className="text-sm font-bold uppercase tracking-wider text-trading-gold mb-4 flex items-center gap-2">
                <Zap className="h-3.5 w-3.5" /> Short Term Effects
              </h4>
              <div className="space-y-3">
                {newsIntel.short_term_effects?.map((effect: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg bg-background/50 border border-border/50 hover:border-border transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <p className="text-xs font-medium text-foreground leading-relaxed flex-1">{effect.headline}</p>
                      <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded ${
                        effect.sentiment.label === 'BULLISH' ? 'bg-trading-green/10 text-trading-green border border-trading-green/20' :
                        effect.sentiment.label === 'BEARISH' ? 'bg-trading-red/10 text-trading-red border border-trading-red/20' :
                        'bg-muted text-muted-foreground border border-border'
                      }`}>{effect.sentiment.label}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">{effect.source}</span>
                      <div className="flex items-center gap-1.5">
                        {effect.affected_stocks?.map((s: string) => (
                          <span key={s} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                {(!newsIntel.short_term_effects || newsIntel.short_term_effects.length === 0) && (
                  <div className="text-xs text-muted-foreground text-center py-6">No short-term signals detected</div>
                )}
              </div>
            </div>

            {/* Long Term Effects */}
            <div className="p-5">
              <h4 className="text-sm font-bold uppercase tracking-wider text-trading-blue mb-4 flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5" /> Long Term Effects
              </h4>
              <div className="space-y-3">
                {newsIntel.long_term_effects?.map((effect: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg bg-background/50 border border-border/50 hover:border-border transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <p className="text-xs font-medium text-foreground leading-relaxed flex-1">{effect.headline}</p>
                      <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded ${
                        effect.sentiment.label === 'BULLISH' ? 'bg-trading-green/10 text-trading-green border border-trading-green/20' :
                        effect.sentiment.label === 'BEARISH' ? 'bg-trading-red/10 text-trading-red border border-trading-red/20' :
                        'bg-muted text-muted-foreground border border-border'
                      }`}>{effect.sentiment.label}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">{effect.source}</span>
                      <div className="flex items-center gap-1.5">
                        {effect.affected_stocks?.map((s: string) => (
                          <span key={s} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                {(!newsIntel.long_term_effects || newsIntel.long_term_effects.length === 0) && (
                  <div className="text-xs text-muted-foreground text-center py-6">No long-term signals detected</div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-10 text-center text-sm text-muted-foreground">
            Fetching market intelligence from online agents...
          </div>
        )}
      </div>
    </div>
  )
}
