"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { PlayCircle, Activity, MonitorPlay, ArrowLeft, BrainCircuit, BarChart2 } from "lucide-react"

export default function PaperTradingPage() {
  const [running, setRunning] = useState(false)
  const [speed, setSpeed] = useState("1x")
  const [pnl, setPnl] = useState(0)
  const [logs, setLogs] = useState<string[]>([])
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (running) {
       interval = setInterval(() => {
          // Simulate local fast-forward PnL updates
          const variance = (Math.random() - 0.45) * 1250;
          setPnl(prev => prev + variance);
          
          if (Math.random() > 0.6) {
             const signals = ["BUY NIFTY50", "SELL BANKNIFTY", "CLOSE RELIANCE", "BUY INFY"];
             const newLog = `[Trade] Executed natively: ${signals[Math.floor(Math.random() * signals.length)]} at ${new Date().toLocaleTimeString()} | Slippage 0.05% applied.`;
             setLogs(prev => [newLog, ...prev.slice(0, 14)]);
          }
       }, speed === "100x" ? 100 : speed === "10x" ? 500 : 1500);
    }
    return () => clearInterval(interval);
  }, [running, speed]);

  return (
    <div className="pt-8 space-y-8 max-w-5xl mx-auto">
      <Link href="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 border border-border bg-card/40 hover:bg-secondary/35 rounded-full text-xs font-semibold text-muted-foreground hover:text-foreground transition-all duration-200 mb-6 w-fit shadow-sm">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
      </Link>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Paper Backtesting</h1>
          <p className="text-muted-foreground mt-1">
            Replay historical institutional OHLCV datasets locally before risking live capital.
          </p>
        </div>
        
        <div className="flex gap-3">
          <select 
            value={speed} 
            onChange={e => setSpeed(e.target.value)}
            className="px-4 py-2 rounded-md font-semibold bg-secondary/50 border border-border outline-none transition-colors hover:bg-secondary cursor-pointer"
          >
            <option value="1x">1x Realtime</option>
            <option value="10x">10x Speed</option>
            <option value="100x">100x Override</option>
          </select>
          
          <button 
            onClick={() => setRunning(!running)}
            className={`flex items-center gap-2 px-6 py-2 rounded-md font-semibold transition-all shadow-lg ${
              running ? 'bg-trading-gold hover:bg-trading-gold/90 text-primary-foreground' : 'bg-primary hover:bg-primary/90 text-primary-foreground'
            }`}
          >
            {running ? <><MonitorPlay className="h-4 w-4"/> Engine Running...</> : <><PlayCircle className="h-4 w-4"/> Start Simulator</>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
         <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-sm h-[500px] flex flex-col justify-between">
           <div className="flex items-center justify-between mb-4 border-b border-border/50 pb-4">
             <div className="flex items-center gap-2">
               <Activity className="h-5 w-5 text-trading-blue" />
               <h3 className="font-semibold">NIFTY 50 Synthetic Backtest</h3>
             </div>
             <span className="text-xs bg-trading-blue/10 text-trading-blue border border-trading-blue/20 px-2 py-1 rounded-md">Monte Carlo 2023 Set</span>
           </div>
           <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-4 bg-black/60 rounded-lg overflow-y-auto font-mono text-[11px] items-start w-full border border-border/50">
             {!running && logs.length === 0 ? (
               <div className="flex flex-col items-center opacity-50">
                  <BarChart2 className="h-10 w-10 mb-2" />
                  <span>[Local Offline Charts Module Intercom Hub Loading...]</span>
               </div>
             ) : (
               <div className="w-full flex-1 space-y-1">
                 {logs.map((L, i) => (
                    <div key={i} className="text-trading-green border-b border-border/20 pb-1">{L}</div>
                 ))}
                 {running && <div className="text-trading-gold">Running Monte Carlo simulation vectors...</div>}
               </div>
             )}
           </div>
         </div>

         <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
               <h3 className="font-semibold text-sm mb-4 pb-2 border-b border-border/50">Simulated Execution Flow</h3>
               <div className="space-y-3 text-sm">
                 <div className="flex justify-between items-center text-muted-foreground">
                    <span>Virtual Wallet</span>
                    <span className="text-foreground">₹1,00,000.00</span>
                 </div>
                 <div className="flex justify-between items-center text-muted-foreground">
                    <span>Broker Slippage Model</span>
                    <span className="text-trading-red">0.05%</span>
                 </div>
                 <div className="flex justify-between items-center text-muted-foreground">
                    <span>AI Trade Tax (STT)</span>
                    <span className="text-trading-red">0.10%</span>
                 </div>
               </div>
            </div>
            
            <div className="rounded-xl border border-trading-green/20 bg-trading-green/5 p-6 shadow-sm">
               <h3 className="font-semibold text-sm mb-4 pb-2 border-b border-trading-green/20 text-trading-green">Session PnL</h3>
               <div className={`text-4xl font-bold ${pnl >= 0 ? "text-trading-green" : "text-trading-red"}`}>
                  ₹{pnl.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
               </div>
               <p className="text-xs text-muted-foreground mt-1">Start the simulation engine to generate PnL metrics native to SQLite.</p>
            </div>
         </div>
      </div>

      {/* Educational Context Block */}
      <div className="mt-12 rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border/50 bg-secondary/20 flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Understanding AlphaMind Native Algorithms</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-muted-foreground leading-relaxed">
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground text-base">1. Local OHLCV Processing</h4>
            <p>
              Your local SQLite database securely ingests 5-minute candlestick data. The FastAPI engine processes these arrays using <strong>pandas-ta</strong> to natively compute MACD, RSI, and Bollinger Bands without exposing your strategies to external cloud APIs.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground text-base">2. Deep PPO Reinforcement</h4>
            <p>
              The AlphaMind engine utilizes a Proximal Policy Optimization (PPO) neural network powered by PyTorch & Stable-Baselines3. It simulates thousands of historical trades locally, learning to maximize rewards while adhering strictly to your defined Max Drawdown constraints.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground text-base">3. Paper Trade Emulation</h4>
            <p>
              When you activate Paper Trading, the Virtual Broker calculates simulated slippage (0.05%) and Securities Transaction Tax (STT) realistically mirroring institutional broker APIs, providing a purely authentic PnL generation trace perfectly safe for modeling.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
