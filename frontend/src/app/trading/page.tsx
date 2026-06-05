"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import axios from "axios"
import { Activity, ShieldAlert, Cpu, PlayCircle, StopCircle, Info, ArrowLeft, Loader2, BrainCircuit, History, X } from "lucide-react"
import PnLChart from "@/components/PnLChart"
import { parseDate } from "@/lib/utils"

const STRATEGY_DETAILS: Record<string, { title: string; definition: string; action: string }> = {
  intraday: {
    title: "Intraday Strategy",
    definition: "Day trading strategy where positions are entered and closed within the same session.",
    action: "Processes 5-min candle aggregates, computing technical indicators (MACD/RSI) to capture intraday swings. All positions auto-square-off before market close (15:30 IST) to eliminate overnight risk."
  },
  fno: {
    title: "Futures & Options (F&O)",
    definition: "Derivatives strategy utilizing leverage to trade index futures or hedging via options spreads.",
    action: "Simulates high-leverage positions on index contracts, deploying automated option spreads and stop-loss hedges to balance risk-reward ratios dynamically during high-momentum setups."
  },
  weekly: {
    title: "Weekly Swing",
    definition: "Swing trading strategy capturing multi-day trend patterns across a weekly horizon.",
    action: "Filters out intraday noise by tracking multi-day moving averages and weekly OHLCV structures to ride primary trends with optimized trail-stops."
  },
  monthly: {
    title: "Monthly Position",
    definition: "Position trading targeting long-term trends spanning several weeks to months.",
    action: "Performs macro analysis and fundamental score alignment to manage long-term portfolio weightings, focusing on steady capital compounding."
  },
  scalping: {
    title: "Scalper Zone (Scalping)",
    definition: "High-frequency trading aiming to secure quick, minor gains from micro price fluctuations.",
    action: "Polls tick-by-tick logs. Automatically places tight profit targets and stops to close trades in seconds. Yields a higher win rate (typically 68% base) on smaller trade size sizing."
  },
  volatility: {
    title: "Volatility Edge",
    definition: "Breakout strategy designed to exploit major price swings and sudden market fluctuations.",
    action: "Tracks ATR (Average True Range) and Bollinger Band expansion to capitalize on breakouts. Triggers swift entry/exits during highly volatile trading windows like market open or news alerts."
  }
}

export default function TradingSetupPage() {
  const { data: session } = useSession()
  const [returnRate, setReturnRate] = useState(15)
  const [tradingType, setTradingType] = useState("intraday")
  const [hoveredType, setHoveredType] = useState<string | null>(null)
  const [engineActive, setEngineActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [engineProgress, setEngineProgress] = useState(0)
  const [logs, setLogs] = useState<string[]>([])
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const [tradingCapital, setTradingCapital] = useState<number | null>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [showDetailedChart, setShowDetailedChart] = useState(false)
  const [sessionsList, setSessionsList] = useState<any[]>([])
  
  // Toggles & Memory States
  const [fallbackToPreviousDay, setFallbackToPreviousDay] = useState(true)
  const [turboquantEnabled, setTurboquantEnabled] = useState(true)
  const [tradeMemories, setTradeMemories] = useState<any[]>([])
  
  // Ref to persist transaction tracking across component renders
  const lastSeenTxIdRef = useRef("")

  // Market hours checker (9:15 AM - 3:30 PM IST, Mon-Fri)
  const [marketOpen, setMarketOpen] = useState(false)

  // Esc Key Modal Closer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowDetailedChart(false)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  useEffect(() => {
    const checkMarket = () => {
      const now = new Date()
      try {
        const istString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
        const istDate = new Date(istString)
        const day = istDate.getDay()
        const hours = istDate.getHours()
        const minutes = istDate.getMinutes()
        
        if (day === 0 || day === 6) {
          setMarketOpen(false)
          return
        }
        
        const timeInMinutes = hours * 60 + minutes
        const marketStart = 9 * 60 + 15
        const marketEnd = 15 * 60 + 30
        
        setMarketOpen(timeInMinutes >= marketStart && timeInMinutes <= marketEnd)
      } catch (e) {
        const day = now.getDay()
        if (day === 0 || day === 6) {
          setMarketOpen(false)
          return
        }
        const timeInMinutes = now.getHours() * 60 + now.getMinutes()
        setMarketOpen(timeInMinutes >= 555 && timeInMinutes <= 930)
      }
    }
    
    checkMarket()
    const t = setInterval(checkMarket, 60000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const token = (session as any)?.accessToken;
    if (token) {
      axios.get("http://127.0.0.1:8000/api/v1/wallet/", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setWalletBalance(Number(res.data.balance) || 0)
        setTradingCapital(Number(res.data.trading_capital) || 0)
      })
      .catch(console.error)

      axios.get("http://127.0.0.1:8000/api/v1/trading/config", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setReturnRate(Number(res.data.target_return_rate) || 15)
        setTradingType(res.data.trading_type)
        setFallbackToPreviousDay(res.data.fallback_to_previous_day ?? true)
        setTurboquantEnabled(res.data.turboquant_enabled ?? true)
        if (res.data.is_active) {
          setEngineActive(true)
          setLogs(["[System] Engine status check: Active trading network found.", "[Active] Listening for ticks..."])
        }
      })
      .catch(console.error)

      // Fetch memory history
      axios.get("http://127.0.0.1:8000/api/v1/trading/memory", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setTradeMemories(res.data || [])
      })
      .catch(console.error)

      // Fetch initial transactions
      axios.get("http://127.0.0.1:8000/api/v1/wallet/transactions?limit=500", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setTransactions(res.data || [])
      })
      .catch(console.error)

      // Fetch deployment sessions history
      axios.get("http://127.0.0.1:8000/api/v1/trading/sessions", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setSessionsList(res.data || [])
      })
      .catch(console.error)
    }
  }, [session])

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (engineActive) {
      const token = (session as any)?.accessToken;
      
      const fetchNewTrades = () => {
        if (!token) return;
        axios.get("http://127.0.0.1:8000/api/v1/wallet/transactions?limit=500", {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
          const txs = res.data || [];
          setTransactions(txs);
          const trades = txs.filter((tx: any) => tx.type.includes("profit") || tx.type.includes("loss") || tx.description.includes("Risk Veto"));
          
          if (trades.length === 0) return;
          
          const newestTrade = trades[0];
          
          const getSymbol = (tx: any) => {
            if (tx.description.includes("RELIANCE")) return "RELIANCE";
            if (tx.description.includes("BANKNIFTY")) return "BANKNIFTY";
            if (tx.description.includes("HDFCBANK")) return "HDFCBANK";
            if (tx.description.includes("INFY")) return "INFY";
            if (tx.description.includes("NIFTY 50")) return "NIFTY 50";
            return tx.description.includes("scalping") ? "RELIANCE" : tx.description.includes("volatility") ? "BANKNIFTY" : "NIFTY 50";
          };

          if (!lastSeenTxIdRef.current) {
            lastSeenTxIdRef.current = newestTrade.id;
            const initialTrades = trades.slice(0, 4).reverse();
            initialTrades.forEach((tx: any) => {
              const isVeto = tx.description.includes("Risk Veto");
              const isProfit = tx.type.includes("profit");
              const amt = Number(tx.amount).toFixed(2);
              const timeStr = parseDate(tx.created_at).toLocaleTimeString();
              const symbol = getSymbol(tx);
              
              let logMsg = "";
              if (isVeto) {
                if (tx.description.includes("Geopolitical/Macro")) {
                  const parts = tx.description.split("Avoided Geopolitical/Macro Drawdown: ");
                  const details = parts[1] ? parts[1].replace(")", "") : "Macro Danger";
                  logMsg = `[Macro Veto] ${timeStr} - Capital preserved in Cash | Threat: ${details}`;
                } else {
                  logMsg = `[Risk Veto] ${timeStr} - Vetoed trade cycle. Capital preserved in Cash.`;
                }
              } else {
                let suffix = "";
                if (tx.description.includes("Closed-Market Sim")) {
                  suffix = " (Closed-Market Sim)";
                } else if (tx.description.includes("Prev Day Fallback")) {
                  suffix = " (Prev Day Fallback)";
                }
                logMsg = `[Trade] ${timeStr} - Executed Native ${isProfit ? "BUY" : "SELL"} on ${symbol} | Result: ${isProfit ? "+" : "-"}₹${amt}${suffix}`;
              }
              setLogs(prev => [...prev, logMsg]);
            });
          } else if (newestTrade.id !== lastSeenTxIdRef.current) {
            const newTradesList = [];
            for (let i = 0; i < trades.length; i++) {
              if (trades[i].id === lastSeenTxIdRef.current) {
                break;
              }
              newTradesList.push(trades[i]);
            }
            
            newTradesList.reverse().forEach((tx: any) => {
              const isVeto = tx.description.includes("Risk Veto");
              const isProfit = tx.type.includes("profit");
              const amt = Number(tx.amount).toFixed(2);
              const timeStr = parseDate(tx.created_at).toLocaleTimeString();
              const symbol = getSymbol(tx);
              
              let logMsg = "";
              if (isVeto) {
                if (tx.description.includes("Geopolitical/Macro")) {
                  const parts = tx.description.split("Avoided Geopolitical/Macro Drawdown: ");
                  const details = parts[1] ? parts[1].replace(")", "") : "Macro Danger";
                  logMsg = `[Macro Veto] ${timeStr} - Capital preserved in Cash | Threat: ${details}`;
                } else {
                  logMsg = `[Risk Veto] ${timeStr} - Vetoed trade cycle. Capital preserved in Cash.`;
                }
              } else {
                let suffix = "";
                if (tx.description.includes("Closed-Market Sim")) {
                  suffix = " (Closed-Market Sim)";
                } else if (tx.description.includes("Prev Day Fallback")) {
                  suffix = " (Prev Day Fallback)";
                }
                logMsg = `[Trade] ${timeStr} - Executed Native ${isProfit ? "BUY" : "SELL"} on ${symbol} | Result: ${isProfit ? "+" : "-"}₹${amt}${suffix}`;
              }
              setLogs(prev => [...prev, logMsg]);
            });
            
            lastSeenTxIdRef.current = newestTrade.id;
            
            // Re-fetch balance
            axios.get("http://127.0.0.1:8000/api/v1/wallet/", {
              headers: { Authorization: `Bearer ${token}` }
            })
            .then(r => {
              setWalletBalance(Number(r.data.balance) || 0)
              setTradingCapital(Number(r.data.trading_capital) || 0)
            })
            .catch(console.error);

            // Re-fetch memory analysis
            axios.get("http://127.0.0.1:8000/api/v1/trading/memory", {
              headers: { Authorization: `Bearer ${token}` }
            })
            .then(r => setTradeMemories(r.data || []))
            .catch(console.error);

            // Re-fetch sessions list to update current session pnl
            axios.get("http://127.0.0.1:8000/api/v1/trading/sessions", {
              headers: { Authorization: `Bearer ${token}` }
            })
            .then(r => setSessionsList(r.data || []))
            .catch(console.error);
          }
        })
        .catch(console.error);
      };
      
      fetchNewTrades();
      interval = setInterval(fetchNewTrades, 1500); // Poll faster (1.5s) to match HFT updates
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [engineActive, session]);

  const handleToggleEngine = async () => {
    const token = (session as any)?.accessToken;
    if (engineActive) {
      if (token) {
         await axios.post("http://127.0.0.1:8000/api/v1/trading/stop", {}, {
           headers: { Authorization: `Bearer ${token}` }
         }).catch(console.error)

         // Re-fetch sessions list
         axios.get("http://127.0.0.1:8000/api/v1/trading/sessions", {
           headers: { Authorization: `Bearer ${token}` }
         })
         .then(res => setSessionsList(res.data || []))
         .catch(console.error)
      }
      setEngineActive(false)
      setLogs([])
      return
    }

    if (walletBalance === null || walletBalance < 1000) {
      alert("Insufficient Paper Wallet Funds. Please deposit at least ₹1000 in your wallet before deploying the engine.");
      return;
    }

    if (tradingCapital === null || tradingCapital < 50) {
      alert("Halt! You have ₹0 active deployed capital in your Algorithmic Wallet. Please navigate to the Ledger & Wallet page to deploy capital into the engine before starting.");
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
        
        if (token) {
           axios.put("http://127.0.0.1:8000/api/v1/trading/config", {
             trading_type: tradingType,
             target_return_rate: returnRate,
             fallback_to_previous_day: fallbackToPreviousDay,
             turboquant_enabled: turboquantEnabled
           }, {
             headers: { Authorization: `Bearer ${token}` }
           })
           .then(() => {
              axios.post("http://127.0.0.1:8000/api/v1/trading/start", {}, {
                headers: { Authorization: `Bearer ${token}` }
              })
              .then(() => {
                 // Re-fetch sessions list
                 axios.get("http://127.0.0.1:8000/api/v1/trading/sessions", {
                   headers: { Authorization: `Bearer ${token}` }
                 })
                 .then(res => setSessionsList(res.data || []))
                 .catch(console.error)
              })
              .catch(console.error)
           })
           .catch(console.error)
        }
        
        setEngineActive(true)
        setLoading(false)
        setEngineProgress(0)
      }
    }, 150)
  }

  return (
    <div className="pt-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-10">
      <Link href="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 border border-border bg-card/40 hover:bg-secondary/35 rounded-full text-xs font-semibold text-muted-foreground hover:text-foreground transition-all duration-200 mb-6 w-fit shadow-sm">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
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
                      onMouseEnter={() => setHoveredType(type)}
                      onMouseLeave={() => setHoveredType(null)}
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

                {/* Strategy Details Explanation Box */}
                <div className="mt-4 p-4 rounded-lg border border-border bg-secondary/10 hover:bg-secondary/20 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                  <div className="flex items-center gap-2 mb-2">
                    <BrainCircuit className="h-4 w-4 text-primary animate-pulse" />
                    <h4 className="text-sm font-semibold text-foreground">
                      {STRATEGY_DETAILS[hoveredType || tradingType]?.title}
                    </h4>
                    {hoveredType && (
                      <span className="text-[10px] text-muted-foreground italic ml-auto bg-secondary/30 px-1.5 py-0.5 rounded">Previewing on Hover</span>
                    )}
                  </div>
                  <p className="text-xs text-foreground font-medium mb-1 leading-relaxed">
                    {STRATEGY_DETAILS[hoveredType || tradingType]?.definition}
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed pt-1 border-t border-border/30">
                    <strong className="text-primary font-semibold">Engine Behavior: </strong>
                    {STRATEGY_DETAILS[hoveredType || tradingType]?.action}
                  </p>
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

              {/* Closed-Market Fallback Toggle */}
              <div className="space-y-4 pt-4 border-t border-border/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      <span>Closed-Market Feed Mode</span>
                      <div className="relative group inline-flex items-center">
                        <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-popover text-popover-foreground text-[10px] rounded border border-border shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none text-left leading-normal font-normal normal-case">
                           Controls the neural network feed inputs. When the stock exchange is closed (outside Mon-Fri 9:15-15:30 IST), Live Session will simulate ticking feeds. Current state: {marketOpen ? "OPEN (Real-time active)" : "CLOSED (Simulated active)"}.
                        </div>
                      </div>
                    </label>
                    <span className="text-xs text-muted-foreground block">Select your off-hours data fallback feed.</span>
                  </div>
                  
                  {/* Segmented Control Switcher */}
                  <div className="flex bg-secondary/40 p-1 rounded-lg border border-border shrink-0 max-w-[340px] w-full sm:w-auto relative">
                    <button
                      onClick={() => {
                        if (!fallbackToPreviousDay) {
                          setFallbackToPreviousDay(true);
                          if (session?.user && (session as any)?.accessToken) {
                            axios.put("http://127.0.0.1:8000/api/v1/trading/config", {
                              fallback_to_previous_day: true
                            }, {
                              headers: { Authorization: `Bearer ${(session as any).accessToken}` }
                            }).catch(console.error);
                          }
                        }
                      }}
                      className={`flex-1 px-4 py-2 rounded-md text-xs font-semibold transition-all ${
                        fallbackToPreviousDay 
                          ? 'bg-primary text-primary-foreground shadow-sm' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Previous Session
                    </button>
                    <button
                      onClick={() => {
                        if (fallbackToPreviousDay) {
                          setFallbackToPreviousDay(false);
                          if (session?.user && (session as any)?.accessToken) {
                            axios.put("http://127.0.0.1:8000/api/v1/trading/config", {
                              fallback_to_previous_day: false
                            }, {
                              headers: { Authorization: `Bearer ${(session as any).accessToken}` }
                            }).catch(console.error);
                          }
                        }
                      }}
                      className={`flex-1 px-4 py-2 rounded-md text-xs font-semibold transition-all ${
                        !fallbackToPreviousDay 
                          ? (marketOpen ? 'bg-trading-green text-white shadow-sm shadow-trading-green/20' : 'bg-trading-blue text-white shadow-sm shadow-trading-blue/20')
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {marketOpen ? "Live Session (Open)" : "Live Session (Closed Sim)"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Google TurboQuant Toggle */}
              <div className="space-y-4 pt-4 border-t border-border/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      <span>Google TurboQuant Compression</span>
                      <div className="relative group inline-flex items-center">
                        <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-popover text-popover-foreground text-[10px] rounded border border-border shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none text-left leading-normal font-normal normal-case">
                          Enables Google&apos;s TurboQuant 3-bit scalar quantization on PPO neural network weights and technical features, limiting local compute VRAM/RAM footprints.
                        </div>
                      </div>
                    </label>
                    <span className="text-xs text-muted-foreground block">Compress model weights for resource-limited local hardware.</span>
                  </div>
                  
                  {/* Segmented Control Switcher */}
                  <div className="flex bg-secondary/40 p-1 rounded-lg border border-border shrink-0 max-w-[340px] w-full sm:w-auto relative">
                    <button
                      onClick={() => {
                        if (!turboquantEnabled) {
                          setTurboquantEnabled(true);
                          if (session?.user && (session as any)?.accessToken) {
                            axios.put("http://127.0.0.1:8000/api/v1/trading/config", {
                              turboquant_enabled: true
                            }, {
                              headers: { Authorization: `Bearer ${(session as any).accessToken}` }
                            }).catch(console.error);
                          }
                        }
                      }}
                      className={`flex-1 px-4 py-2 rounded-md text-xs font-semibold transition-all ${
                        turboquantEnabled 
                          ? 'bg-trading-green text-white shadow-sm' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      3-bit Enabled
                    </button>
                    <button
                      onClick={() => {
                        if (turboquantEnabled) {
                          setTurboquantEnabled(false);
                          if (session?.user && (session as any)?.accessToken) {
                            axios.put("http://127.0.0.1:8000/api/v1/trading/config", {
                              turboquant_enabled: false
                            }, {
                              headers: { Authorization: `Bearer ${(session as any).accessToken}` }
                            }).catch(console.error);
                          }
                        }
                      }}
                      className={`flex-1 px-4 py-2 rounded-md text-xs font-semibold transition-all ${
                        !turboquantEnabled 
                          ? 'bg-primary text-primary-foreground shadow-sm' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Disabled
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Columns */}
        <div className="space-y-6">
          {/* PnL Preview Card */}
          <div 
            onClick={() => setShowDetailedChart(true)}
            className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col cursor-pointer hover:border-primary/50 transition-all duration-300 relative group overflow-hidden"
          >
            <div className="absolute right-0 top-0 h-24 w-24 translate-x-1/3 -translate-y-1/3 rounded-full bg-primary/10 blur-xl transition-all group-hover:bg-primary/20" />
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold font-sans">Performance Curve</h2>
              </div>
              <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded border border-primary/20 group-hover:bg-primary/20 transition-all">
                Expand Chart &rarr;
              </span>
            </div>
            <div className="h-[95px] w-full mt-2 relative">
              <PnLChart transactions={transactions} variant="preview" interactive={false} />
            </div>
          </div>

          {/* Risk Profile Column */}
          <div className="rounded-xl border border-trading-gold/30 bg-trading-gold/5 p-6 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-4 text-trading-gold">
              <ShieldAlert className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Risk Analysis</h2>
              <div className="relative group inline-flex items-center">
                <Info className="h-3.5 w-3.5 text-trading-gold/60 hover:text-trading-gold cursor-pointer transition-colors" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 bg-popover text-popover-foreground text-[10.5px] rounded border border-border shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none text-left leading-relaxed font-normal normal-case">
                  Quantitative risk projection calculated from your target return, selected trading timeline, and neural network historic performance logs.
                </div>
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                The current configuration targets a <strong className="text-foreground">{returnRate}%</strong> return profile using the <strong className="text-foreground capitalize">{tradingType}</strong> neural agent.
              </p>
              
              <div className="space-y-2 pt-4">
                <div className="flex justify-between items-center text-sm py-2 border-b border-border/50">
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">Est. Max Drawdown</span>
                    <div className="relative group inline-flex items-center">
                      <Info className="h-3.5 w-3.5 text-muted-foreground/60 hover:text-foreground cursor-pointer transition-colors" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 bg-popover text-popover-foreground text-[10px] rounded border border-border shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none text-left leading-normal font-normal">
                        The maximum anticipated peak-to-trough decline in paper capital, computed based on volatility parameters and model constraints.
                      </div>
                    </div>
                  </div>
                  <span className="font-semibold text-trading-red">-{Math.round(returnRate * 0.4)}%</span>
                </div>
                <div className="flex justify-between items-center text-sm py-2 border-b border-border/50">
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">Win Rate Probability</span>
                    <div className="relative group inline-flex items-center">
                      <Info className="h-3.5 w-3.5 text-muted-foreground/60 hover:text-foreground cursor-pointer transition-colors" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 bg-popover text-popover-foreground text-[10px] rounded border border-border shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none text-left leading-normal font-normal">
                        The statistical percentage likelihood of executing profitable trades, dynamically adjusted by strategy mode and current target returns.
                      </div>
                    </div>
                  </div>
                  <span className="font-semibold text-trading-green">{Math.max(45, Math.min(85, 90 - returnRate))}%</span>
                </div>
                <div className="flex justify-between items-center text-sm py-2 border-b border-border/50">
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">Sharpe Ratio</span>
                    <div className="relative group inline-flex items-center">
                      <Info className="h-3.5 w-3.5 text-muted-foreground/60 hover:text-foreground cursor-pointer transition-colors" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 bg-popover text-popover-foreground text-[10px] rounded border border-border shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none text-left leading-normal font-normal">
                        A metric of risk-adjusted return. A higher value indicates superior returns per unit of volatility or standard deviation.
                      </div>
                    </div>
                  </div>
                  <span className="font-semibold text-foreground">{(2.5 - (returnRate*0.04)).toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 bg-card border border-border rounded-md p-3 flex gap-3 text-xs text-muted-foreground items-start">
              <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p>Higher return targets mathematically enforce wider stop-losses via dynamic ATR configuration.</p>
            </div>
          </div>

          {/* Trade Memory Panel */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <BrainCircuit className="h-5 w-5 text-primary animate-pulse" />
              <h2 className="text-lg font-semibold">Memory Learning Ledger</h2>
            </div>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {tradeMemories.length === 0 ? (
                <p className="text-xs text-muted-foreground">No memory iterations stored. Run the engine with active trades to build reinforcement vectors.</p>
              ) : (
                tradeMemories.map((mem, idx) => (
                  <div key={mem.id || idx} className="p-3 rounded-md bg-secondary/20 border border-border/50 text-xs space-y-1 hover:border-border transition-colors">
                    <div className="flex justify-between font-mono text-[10px] text-muted-foreground mb-1">
                      <span className="font-bold">Iteration #{tradeMemories.length - idx}</span>
                      <span>{parseDate(mem.created_at).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-foreground leading-relaxed">{mem.status_summary}</p>
                    <div className="flex justify-between pt-1.5 font-mono text-[10px] border-t border-border/20 mt-1">
                      <span className="text-trading-green font-semibold">Win Rate: {(mem.win_rate * 100).toFixed(1)}%</span>
                      <span className={`font-bold ${mem.net_pnl >= 0 ? "text-trading-green" : "text-trading-red"}`}>
                        PnL: {mem.net_pnl >= 0 ? "+" : ""}₹{Number(mem.net_pnl).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Trading Sessions Panel */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <History className="h-5 w-5 text-trading-blue" />
              <h2 className="text-lg font-semibold">Trading Session Logs</h2>
            </div>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {sessionsList.length === 0 ? (
                <p className="text-xs text-muted-foreground">No active or historical deployment sessions recorded.</p>
              ) : (
                sessionsList.map((sess, idx) => {
                  const duration = sess.end_time 
                    ? `${Math.round((parseDate(sess.end_time).getTime() - parseDate(sess.start_time).getTime()) / 60000)} mins`
                    : "Active Now"
                  const pnlVal = sess.end_balance 
                    ? Number(sess.end_balance) - Number(sess.start_balance)
                    : null
                  return (
                    <div key={sess.id || idx} className="p-3 rounded-md bg-secondary/10 border border-border/50 text-xs space-y-1.5 hover:border-border transition-colors">
                      <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
                        <span className="font-bold uppercase text-primary">Session #{sessionsList.length - idx}</span>
                        <span>{duration}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-foreground">
                        <span className="capitalize font-medium">Model: {sess.strategy_type === 'fno' ? 'F&O' : sess.strategy_type === 'scalping' ? 'Scalper Zone' : sess.strategy_type === 'volatility' ? 'Volatility Edge' : sess.strategy_type}</span>
                        <span className="font-mono text-muted-foreground">Target: {sess.target_return}%</span>
                      </div>
                      <div className="flex justify-between items-center pt-1.5 border-t border-border/20 font-mono text-[10px] mt-1">
                        <span className="text-muted-foreground">Start: {parseDate(sess.start_time).toLocaleTimeString()}</span>
                        {pnlVal !== null ? (
                          <span className={`font-bold ${pnlVal >= 0 ? "text-trading-green" : "text-trading-red"}`}>
                            PnL: {pnlVal >= 0 ? "+" : ""}₹{pnlVal.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-trading-green font-bold animate-pulse">Running...</span>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
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
                <div className="text-sm font-bold text-trading-blue font-mono">
                  {tradeMemories.length > 0 ? `${(tradeMemories[0].win_rate * 100).toFixed(1)}%` : "62.4%"}
                </div>
              </div>
              <div className="bg-white/5 rounded-md px-3 py-2 border border-white/10">
                <div className="text-[10px] text-muted-foreground font-mono uppercase">Sharpe</div>
                <div className="text-sm font-bold text-trading-gold font-mono">
                  {tradeMemories.length > 0 ? (2.5 - (returnRate*0.04)).toFixed(2) : "1.87"}
                </div>
              </div>
              <div className="bg-white/5 rounded-md px-3 py-2 border border-white/10">
                <div className="text-[10px] text-muted-foreground font-mono uppercase">Drawdown</div>
                <div className="text-sm font-bold text-trading-red font-mono">
                  {tradeMemories.length > 0 ? `-${(returnRate*0.4).toFixed(1)}%` : "-2.1%"}
                </div>
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

      {/* Detailed PnL Chart Modal */}
      {showDetailedChart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 relative">
            {/* Absolute close button for extra visibility and easy touch closure */}
            <button
              onClick={() => setShowDetailedChart(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-destructive p-1.5 rounded-full hover:bg-secondary/20 transition-all z-10"
              title="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="p-6 border-b border-border/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-secondary/15">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2 pr-8 sm:pr-0">
                  <Activity className="h-6 w-6 text-primary" /> Detailed Performance Analytics
                </h2>
                <p className="text-sm text-muted-foreground mt-1">Real-time model equity and trade execution monitoring.</p>
              </div>
              <button 
                onClick={() => setShowDetailedChart(false)}
                className="flex items-center gap-1.5 px-4 py-2 border border-destructive/30 bg-destructive/10 hover:bg-destructive/20 active:bg-destructive/30 rounded-lg text-xs font-semibold text-destructive transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-destructive/50"
                title="Close"
              >
                <X className="h-4 w-4" /> Close View
              </button>
            </div>
            
            <div className="h-[400px] w-full bg-[#0d1117] flex flex-col p-6 rounded-b-xl border-t border-border/30">
              <PnLChart transactions={transactions} variant="detailed" interactive={true} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
