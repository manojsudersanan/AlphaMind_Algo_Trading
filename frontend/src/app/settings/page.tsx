"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { ArrowLeft, Eye, EyeOff, Sun, Moon, Monitor, Shield, DollarSign, Cpu, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"
import axios from "axios"

export default function SettingsPage() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])
  
  const activeTheme = mounted ? theme : "system"
  
  // State for Trading Config (Token Limiter)
  const [config, setConfig] = useState<any>({
    token_limiter_enabled: false,
    token_limit_amount: 10.00
  })
  
  // State for Credentials Form
  const [credentials, setCredentials] = useState({
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  
  // Password Visibility States
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // Status Alerts
  const [configSuccess, setConfigSuccess] = useState(false)
  const [configError, setConfigError] = useState("")
  const [credSuccess, setCredSuccess] = useState(false)
  const [credError, setCredError] = useState("")

  useEffect(() => {
    const token = (session as any)?.accessToken
    if (token) {
      // Fetch Trading Config
      axios.get("http://127.0.0.1:8000/api/v1/trading/config", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setConfig({
          token_limiter_enabled: res.data.token_limiter_enabled,
          token_limit_amount: Number(res.data.token_limit_amount) || 10.00
        })
      })
      .catch(console.error)

      // Prepopulate email
      if (session?.user?.email) {
        setCredentials((prev: any) => ({ ...prev, email: session?.user?.email || "" }))
      }
    }
  }, [session])

  // Save Trading Config (Token Limiter)
  const saveConfig = async (updatedFields: any) => {
    const token = (session as any)?.accessToken
    if (!token) return

    try {
      setConfigError("")
      setConfigSuccess(false)
      const res = await axios.put("http://127.0.0.1:8000/api/v1/trading/config", updatedFields, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setConfig({
        token_limiter_enabled: res.data.token_limiter_enabled,
        token_limit_amount: Number(res.data.token_limit_amount) || 10.00
      })
      setConfigSuccess(true)
      setTimeout(() => setConfigSuccess(false), 3000)
    } catch (err: any) {
      setConfigError(err.response?.data?.detail || "Failed to update configuration.")
    }
  }

  // Save Credentials
  const saveCredentials = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = (session as any)?.accessToken
    if (!token) return

    setCredError("")
    setCredSuccess(false)

    if (credentials.newPassword && credentials.newPassword !== credentials.confirmPassword) {
      setCredError("New passwords do not match.")
      return
    }

    try {
      const payload: any = { email: credentials.email }
      if (credentials.newPassword) {
        payload.password = credentials.newPassword
        payload.current_password = credentials.currentPassword
      }

      await axios.put("http://127.0.0.1:8000/api/v1/auth/update", payload, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setCredSuccess(true)
      setCredentials((prev: any) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }))
      setTimeout(() => setCredSuccess(false), 3000)
    } catch (err: any) {
      setCredError(err.response?.data?.detail || "Failed to update credentials. Check your current password.")
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto pb-10 relative">
      
      {/* Floating Back to Dashboard Navigation Pill */}
      <div className="flex">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 px-4 py-2 border border-border bg-card/40 hover:bg-secondary/35 rounded-full text-xs font-semibold text-muted-foreground hover:text-foreground transition-all duration-200 shadow-sm"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile & Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage system theme preferences, AI token budgets, and security credentials.
        </p>
      </div>

      <div className="grid gap-6">
        
        {/* Module A: Theme Configuration */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 top-0 h-24 w-24 translate-x-1/3 -translate-y-1/3 rounded-full bg-primary/5 blur-xl transition-all" />
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
            <Monitor className="h-5 w-5 text-muted-foreground" /> Interface Theme Settings
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Adjust the visual scheme of your trading interface dashboard.
          </p>

          <div className="flex bg-secondary/40 p-1 rounded-lg border border-border max-w-sm w-full relative">
            <button
              onClick={() => setTheme("light")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-semibold transition-all ${
                activeTheme === "light" 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sun className="h-3.5 w-3.5" /> Light
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-semibold transition-all ${
                activeTheme === "dark" 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Moon className="h-3.5 w-3.5" /> Dark
            </button>
            <button
              onClick={() => setTheme("system")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-semibold transition-all ${
                activeTheme === "system" 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Monitor className="h-3.5 w-3.5" /> System
            </button>
          </div>
        </div>

        {/* Module B: Token Cost Limiter (AI Compute Budget) */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 top-0 h-24 w-24 translate-x-1/3 -translate-y-1/3 rounded-full bg-trading-gold/5 blur-xl transition-all" />
          
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Cpu className="h-5 w-5 text-trading-gold" /> AI Compute Token Limiter
            </h3>
            
            {/* Toggle Switch */}
            <button
              onClick={() => saveConfig({ token_limiter_enabled: !config.token_limiter_enabled })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                config.token_limiter_enabled ? 'bg-primary' : 'bg-secondary'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-card shadow ring-0 transition duration-200 ease-in-out ${
                  config.token_limiter_enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          
          <p className="text-sm text-muted-foreground mb-6">
            Limit API consumption rates and query token budgets incurred during real-time asset model scanning.
          </p>

          {config.token_limiter_enabled && (
            <div className="space-y-6 pt-4 border-t border-border/50 animate-in fade-in duration-300">
              
              {/* Range Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Adjust Limit Budget</span>
                  <span className="font-bold text-foreground font-mono">${config.token_limit_amount.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="50.00"
                  step="0.10"
                  value={config.token_limit_amount}
                  onChange={(e) => setConfig((prev: any) => ({ ...prev, token_limit_amount: Number(e.target.value) }))}
                  onMouseUp={() => saveConfig({ token_limit_amount: config.token_limit_amount })}
                  onTouchEnd={() => saveConfig({ token_limit_amount: config.token_limit_amount })}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>$0.10</span>
                  <span>$5.00</span>
                  <span>$10.00</span>
                  <span>$25.00</span>
                  <span>$50.00</span>
                </div>
              </div>

              {/* Custom Dollar Threshold Input */}
              <div className="flex items-center gap-4 max-w-xs">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">$</span>
                  <input
                    type="number"
                    min="0.10"
                    step="0.01"
                    value={config.token_limit_amount}
                    onChange={(e) => setConfig((prev: any) => ({ ...prev, token_limit_amount: Number(e.target.value) || 0 }))}
                    className="w-full bg-background border border-border rounded-md pl-7 pr-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary font-mono"
                    placeholder="Enter limit"
                  />
                </div>
                <button
                  onClick={() => saveConfig({ token_limit_amount: config.token_limit_amount })}
                  className="bg-secondary text-foreground hover:bg-secondary/80 border border-border px-4 py-2 rounded-md text-xs font-semibold transition-all"
                >
                  Apply Custom
                </button>
              </div>

            </div>
          )}

          {configSuccess && (
            <div className="flex items-center gap-2 mt-4 text-xs text-trading-green bg-trading-green/10 border border-trading-green/20 p-3 rounded-lg animate-in fade-in">
              <CheckCircle2 className="h-4 w-4" /> Config saved successfully!
            </div>
          )}

          {configError && (
            <div className="flex items-center gap-2 mt-4 text-xs text-trading-red bg-trading-red/10 border border-trading-red/20 p-3 rounded-lg animate-in fade-in">
              <AlertCircle className="h-4 w-4" /> {configError}
            </div>
          )}

        </div>

        {/* Module C: Account Credentials Form */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 top-0 h-24 w-24 translate-x-1/3 -translate-y-1/3 rounded-full bg-trading-blue/5 blur-xl transition-all" />
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-muted-foreground" /> Account Credentials
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Modify active profile login credentials and security passwords.
          </p>

          <form onSubmit={saveCredentials} className="space-y-4 max-w-md">
            
            {/* Username/Email */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Account Username / Email</label>
              <input
                type="email"
                required
                value={credentials.email}
                onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div className="pt-4 border-t border-border/50 space-y-4">
              <p className="text-xs text-muted-foreground font-semibold">Change Password (leave empty to keep current)</p>
              
              {/* Current Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    value={credentials.currentPassword}
                    onChange={(e) => setCredentials(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full bg-background border border-border rounded-md pl-3 pr-10 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">New Security Password</label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    value={credentials.newPassword}
                    onChange={(e) => setCredentials(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full bg-background border border-border rounded-md pl-3 pr-10 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={credentials.confirmPassword}
                    onChange={(e) => setCredentials(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full bg-background border border-border rounded-md pl-3 pr-10 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

            </div>

            {credSuccess && (
              <div className="flex items-center gap-2 text-xs text-trading-green bg-trading-green/10 border border-trading-green/20 p-3 rounded-lg animate-in fade-in">
                <CheckCircle2 className="h-4 w-4" /> Profile credentials updated successfully!
              </div>
            )}

            {credError && (
              <div className="flex items-center gap-2 text-xs text-trading-red bg-trading-red/10 border border-trading-red/20 p-3 rounded-lg animate-in fade-in">
                <AlertCircle className="h-4 w-4" /> {credError}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/95 px-6 py-2.5 rounded-md text-sm font-semibold transition-all shadow-sm"
              >
                Save Configuration
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  )
}
