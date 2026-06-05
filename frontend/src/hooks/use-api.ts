import { useCallback } from "react"
import axios from "axios"
import { useSession } from "next-auth/react"

const API_BASE_URL = "http://localhost:8000/api/v1"

export function useWalletAPI() {
  const { data: session } = useSession()

  const getHeaders = useCallback(() => {
    return {
      Authorization: `Bearer ${(session as any)?.accessToken}`
    }
  }, [(session as any)?.accessToken])

  const fetchWallet = async () => {
    const res = await axios.get(`${API_BASE_URL}/wallet/`, { headers: getHeaders() })
    return res.data
  }

  const deposit = async (amount: number) => {
    const res = await axios.post(`${API_BASE_URL}/wallet/deposit`, { amount }, { headers: getHeaders() })
    return res.data
  }

  const withdraw = async (amount: number) => {
    const res = await axios.post(`${API_BASE_URL}/wallet/withdraw`, { amount }, { headers: getHeaders() })
    return res.data
  }

  return { fetchWallet, deposit, withdraw }
}

export function useTradingAPI() {
  const { data: session } = useSession()

  const getHeaders = useCallback(() => {
    return {
      Authorization: `Bearer ${(session as any)?.accessToken}`
    }
  }, [(session as any)?.accessToken])

  const fetchConfig = async () => {
    const res = await axios.get(`${API_BASE_URL}/trading/config`, { headers: getHeaders() })
    return res.data
  }

  const updateConfig = async (configData: any) => {
    const res = await axios.put(`${API_BASE_URL}/trading/config`, configData, { headers: getHeaders() })
    return res.data
  }

  const toggleEngine = async (start: boolean) => {
    const action = start ? 'start' : 'stop'
    const res = await axios.post(`${API_BASE_URL}/trading/${action}`, {}, { headers: getHeaders() })
    return res.data
  }

  return { fetchConfig, updateConfig, toggleEngine }
}
