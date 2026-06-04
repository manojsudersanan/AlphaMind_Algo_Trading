"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { Activity, Wallet, BrainCircuit, LogOut } from "lucide-react"

export function NavBar() {
  const { data: session } = useSession()

  if (!session) return null

  return (
    <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
            <BrainCircuit className="h-6 w-6 text-primary animate-pulse-slow" />
            <span className="hidden font-bold sm:inline-block">
              AlphaMind Native
            </span>
          </Link>
          <div className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/dashboard" className="transition-colors hover:text-foreground/80 text-foreground">
              Overview
            </Link>
            <Link href="/trading" className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center gap-2">
              <Activity className="h-4 w-4" /> Trading Engine
            </Link>
            <Link href="/paper-trading" className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center gap-2">
              <BrainCircuit className="h-4 w-4" /> Backtesting
            </Link>
            <Link href="/wallet" className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center gap-2">
              <Wallet className="h-4 w-4" /> Wallet
            </Link>
          </div>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <div className="text-sm border border-border px-3 py-1 rounded-full bg-card/50">
            <span className="text-muted-foreground">Session: </span>
            <span className="font-semibold text-primary">{session.user?.email}</span>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-muted-foreground hover:text-destructive transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <LogOut className="h-4 w-4" /> Disconnect
          </button>
        </div>
      </div>
    </nav>
  )
}
