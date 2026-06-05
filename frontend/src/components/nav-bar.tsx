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
            <Link href="/journal" className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center gap-2">
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-book-open h-4 w-4"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                Journal
              </span>
            </Link>
            <Link href="/logs" className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center gap-2">
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-terminal h-4 w-4"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
                Logs
              </span>
            </Link>
            <Link href="/settings" className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center gap-2">
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings h-4 w-4"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                Settings
              </span>
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
