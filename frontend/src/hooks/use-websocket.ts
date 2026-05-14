import { useEffect, useRef, useState } from "react"
import { useSession } from "next-auth/react"

export function useMarketDataSocket() {
  const [data, setData] = useState<any>(null)
  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">("connecting")
  const ws = useRef<WebSocket | null>(null)

  useEffect(() => {
    // Connects to local FastAPI native build
    const socket = new WebSocket("ws://localhost:8000/ws/market_data")
    ws.current = socket

    socket.onopen = () => setStatus("connected")
    socket.onclose = () => setStatus("disconnected")
    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data)
        setData(payload)
      } catch (e) {
        console.error("WebSocket Parsing Error:", e)
      }
    }

    return () => {
      socket.close()
    }
  }, [])

  return { marketData: data, status }
}

export function useAISignalsSocket() {
  const { data: session } = useSession()
  const [signals, setSignals] = useState<any[]>([])
  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">("disconnected")
  const ws = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!session?.accessToken) return

    setStatus("connecting")
    const socket = new WebSocket(`ws://localhost:8000/ws/signals?token=${session.accessToken}`)
    ws.current = socket

    socket.onopen = () => setStatus("connected")
    socket.onclose = () => setStatus("disconnected")
    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data)
        setSignals(prev => [payload, ...prev].slice(0, 50)) // Keep last 50
      } catch (e) {
        console.error("AI Signal WebSocket Error:", e)
      }
    }

    return () => {
      socket.close()
    }
  }, [session?.accessToken])

  return { signals, status }
}
