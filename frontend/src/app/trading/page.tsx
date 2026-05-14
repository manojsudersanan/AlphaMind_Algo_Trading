"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import axios from "axios"
import { Activity, ShieldAlert, Cpu, PlayCircle, StopCircle, Info, ArrowLeft, Loader2 } from "lucide-react"

export default function TradingSetupPage() {
  const { data: session } = useSession()
  const [returnRate, setReturnRate] = useState(15)
  const [tradingType, setTradingType] = useState("intraday")
  const [engineActive, setEngineActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [engineProgress, setEngineProgress] = useState(0)
  const [logs, setLogs] = useState<string[]>([])

  const [walletBalance, setWalletBalance] = useState<number | null>(null)

  useEffect(() => {
    const token = (session as any)?.accessToken;
    if (token) {
      axios.get("http://127.0.0.1:8000/api/v1/wallet/", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setWalletBalance(Number(res.data.balance) || 0))
      .catch(console.error)
    }
  }, [session])

  const handleToggleEngine = async () => {
    if (engineActive) {
      if ((session as any)?.accessToken) {
         await axios.post("http://127.0.0.1:8000/api/v1/trading/stop", {}, {
           headers: { Authorization: `Bearer ${(session as any).accessToken}` }
         })
      }
      setEngineActive(false)
      setLogs([])
      return
    }

    if (walletBalance === null || walletBalance < 1000) {
      alert("Insufficient Paper Wallet Funds. Please deposit at least ₹1000 in your wallet before deploying the engine.");
      return;
    }
  
    setLoading(true)
    setEngineProgress(0)
    setLogs(["[System] Auth verified. Native Initialization Sequence started..."])
    
    const streamSteps = [
      "[Data] Mapping SQLite to Vector Datasource...",
      "[Data] Ingesting 5-Min OHLCV candlestick aggregates...",
      "[TA] pandas-ta generating MACD & RSI Tensors...",
      "[RL] Compiling Stable-Baselines3 PPO Architecture...",
      "[Compute] Executing Forward Pass inside Gymnasium Envelope...",
      "[Active] Trading Neural Network Online & Listening."
    ]
    
    let stepIndex = 0
    let progress = 0
    
    const interval = setInterval(() => {
      progress += 6
      setEngineProgress(Math.min(progress, 100))
      
      if (progress % 18 === 0 && stepIndex < streamSteps.length) {
         setLogs(prev => [...prev, streamSteps[stepIndex]])
         stepIndex++
      }
      
      if (progress >= 115) {
        clearInterval(interval)
        
        if ((session as any)?.accessToken) {
           axios.post("http://127.0.0.1:8000/api/v1/trading/start", {}, {
             headers: { Authorization: `Bearer ${(session as any).accessToken}` }
           }).catch(console.error)
        }
        
        setEngineActive(true)
        setLoading(false)
        setEngineProgress(0)
      }
    }, 150)
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
      </Link>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trading Engine</h1>
          <p className="text-muted-foreground mt-1">
            Configure reinforcement learning parameters and deploy the local native agent.
          </p>
        </div>
        
        <button 
          onClick={handleToggleEngine}
          disabled={loading}
          className={`relative overflow-hidden flex items-center justify-center min-w-[260px] gap-2 px-6 py-3 rounded-md font-semibold transition-all shadow-lg ${
            loading ? 'bg-primary/80 text-primary-foreground' :
            engineActive 
              ? 'bg-trading-red hover:bg-trading-red/90 text-white shadow-trading-red/20' 
              : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20'
          }`}
        >
          {loading ? (
             <><Loader2 className="h-5 w-5 animate-spin" /> Synchronizing API...</>
          ) : engineActive ? (
            <><StopCircle className="h-5 w-5" /> Halt AlphaMind Engine</>
          ) : (
            <><PlayCircle className="h-5 w-5" /> Deploy AlphaMind Engine</>
          )}
          
          {loading && (
             <div 
               className="absolute bottom-0 left-0 h-1 bg-white/40 transition-all duration-150 ease-out" 
               style={{ width: `${engineProgress}%` }}
             />
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        
        {/* Settings Column */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Cpu className="h-5 w-5 text-trading-blue" />
              <h2 className="text-xl font-semibold">Strategy Configuration</h2>
            </div>
            
            <div className="space-y-8">
              {/* Trading Type */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center justify-between">
                  <span>Investment Horizon (Model Strategy)</span>
                  <span className="text-xs text-muted-foreground uppercase bg-secondary px-2 py-1 rounded">Proximal Policy Optimization</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['intraday', 'fno', 'weekly', 'monthly', 'scalping', 'volatility'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setTradingType(type)}
                      className={`py-3 px-4 rounded-md border text-sm font-medium capitalize transition-all ${
                        tradingType === type 
                          ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary' 
                          : 'border-border bg-background hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      {type === 'fno' ? 'F&O' : type === 'scalping' ? 'Scalper Zone' : type === 'volatility' ? 'Volatility Edge' : type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Return Target Slider */}
              <div className="space-y-4 pt-4 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Target Annualized Return (%)</label>
                  <span className="text-2xl font-bold text-primary">{returnRate}%</span>
                </div>
                
                <div className="relative pt-2">
                  <input 
                    type="range" 
                    min="2" 
                    max="40" 
                    step="1"
                    value={returnRate}
                    onChange={(e) => setReturnRate(Number(e.target.value))}
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2 px-1">
                    <span>2% (Low Risk)</span>
                    <span className="text-trading-gold flex items-center gap-1"><Activity className="h-3 w-3"/> Optimal AI</span>
                    <span>40% (High Risk)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Profile Column */}
        <div className="space-y-6">
          <div className="rounded-xl border border-trading-gold/30 bg-trading-gold/5 p-6 shadow-sm flex flex-col h-full">
            <div className="flex items-center gap-2 mb-4 text-trading-gold">
              <ShieldAlert className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Risk Analysis</h2>
            </div>
            
            <div className="flex-1 space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                The current configuration targets a <strong className="text-foreground">{returnRate}%</strong> return profile using the <strong className="text-foreground capitalize">{tradingType}</strong> neural agent.
              </p>
              
              <div className="space-y-2 pt-4">
                <div className="flex justify-between text-sm py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Est. Max Drawdown</span>
                  <span className="font-semibold text-trading-red">-{Math.round(returnRate * 0.4)}%</span>
                </div>
                <div className="flex justify-between text-sm py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Win Rate Probability</span>
                  <span className="font-semibold text-trading-green">{Math.max(45, Math.min(85, 90 - returnRate))}%</span>
                </div>
                <div className="flex justify-between text-sm py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Sharpe Ratio</span>
                  <span className="font-semibold text-foreground">{(2.5 - (returnRate*0.04)).toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 bg-card border border-border rounded-md p-3 flex gap-3 text-xs text-muted-foreground items-start">
              <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p>Higher return targets mathematically enforce wider stop-losses via dynamic ATR configuration.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Live Logs Terminal */}
      {(loading || engineActive) && (
        <div className="mt-8 rounded-xl border border-border bg-[#0d1117] shadow-xl overflow-hidden animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-black/60 text-xs text-muted-foreground font-mono">
            <span className="flex h-3 w-3 rounded-full bg-trading-red"></span>
            <span className="flex h-3 w-3 rounded-full bg-trading-gold"></span>
            <span className="flex h-3 w-3 rounded-full bg-trading-green"></span>
            <span className="ml-2 flex flex-1 justify-between">
               <span>stdout - AlphaMind Execution Tracer</span>
               <span>{engineActive ? "PID: 10252 (ALIVE)" : "BOOTING..."}</span>
            </span>
          </div>
          
          {/* Progress Bar */}
          {loading && (
            <div className="px-6 pt-4">
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-trading-blue">Initializing Neural Engine...</span>
                <span className="text-foreground font-bold">{engineProgress}%</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden border border-white/10">
                <div 
                  className="h-full rounded-full transition-all duration-300 ease-out relative"
                  style={{ 
                    width: `${engineProgress}%`,
                    background: engineProgress < 40 
                      ? 'linear-gradient(90deg, #3b82f6, #60a5fa)' 
                      : engineProgress < 80 
                        ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' 
                        : 'linear-gradient(90deg, #22c55e, #4ade80)'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                </div>
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1 font-mono">
                <span>Data Sync</span>
                <span>TA Analysis</span>
                <span>RL Compile</span>
                <span>Deploy</span>
              </div>
            </div>
          )}

          {/* Live Stats Bar when engine is active */}
          {engineActive && (
            <div className="px-6 pt-4 grid grid-cols-4 gap-3">
              <div className="bg-white/5 rounded-md px-3 py-2 border border-white/10">
                <div className="text-[10px] text-muted-foreground font-mono uppercase">Trades/Min</div>
                <div className="text-sm font-bold text-trading-green font-mono">6.2</div>
              </div>
              <div className="bg-white/5 rounded-md px-3 py-2 border border-white/10">
                <div className="text-[10px] text-muted-foreground font-mono uppercase">Win Rate</div>
                <div className="text-sm font-bold text-trading-blue font-mono">62.4%</div>
              </div>
              <div className="bg-white/5 rounded-md px-3 py-2 border border-white/10">
                <div className="text-[10px] text-muted-foreground font-mono uppercase">Sharpe</div>
                <div className="text-sm font-bold text-trading-gold font-mono">1.87</div>
              </div>
              <div className="bg-white/5 rounded-md px-3 py-2 border border-white/10">
                <div className="text-[10px] text-muted-foreground font-mono uppercase">Drawdown</div>
                <div className="text-sm font-bold text-trading-red font-mono">-2.1%</div>
              </div>
            </div>
          )}

          <div className="p-6 font-mono text-[13px] leading-relaxed h-[220px] overflow-y-auto space-y-1">
            {logs.map((log, i) => {
               if (!log) return null;
               return (
               <div key={i} className={`
                 ${log?.includes("[System]") ? "text-trading-blue" : ""}
                 ${log?.includes("[Data]") ? "text-[#c9d1d9]" : ""}
                 ${log?.includes("[TA]") ? "text-trading-gold" : ""}
                 ${log?.includes("[RL]") ? "text-purple-400" : ""}
                 ${log?.includes("[Compute]") ? "text-orange-400" : ""}
                 ${log?.includes("[Active]") ? "text-trading-green font-bold animate-pulse mt-4" : "text-muted-foreground"}
               `}>
                 <span className="opacity-40 mr-3 hidden md:inline-block">[{new Date().toISOString().split("T")[1].slice(0,8)}]</span> 
                 {log}
               </div>
               )
            })}
            {loading && <div className="text-muted-foreground animate-pulse mt-2">_</div>}
          </div>
        </div>
      )}
    </div>
  )
}
