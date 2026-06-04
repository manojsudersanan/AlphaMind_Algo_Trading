import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import axios from "axios"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "AlphaMind Algo Trading Account",
      credentials: {
        username: { label: "Email", type: "email", placeholder: "trader@alphamind.ai" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null
        
        try {
          // FastAPI backend runs on 8000 natively
          // Changed localhost to 127.0.0.1 to bypass Node.js IPv6 connection drops
          const res = await axios.post("http://127.0.0.1:8000/api/v1/auth/login", new URLSearchParams({
            username: credentials.username,
            password: credentials.password,
          }), {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          })
          
          const token = res.data.access_token
          
          const userRes = await axios.get("http://127.0.0.1:8000/api/v1/auth/me", {
            headers: { "Authorization": `Bearer ${token}` }
          })
          
          if (userRes.data) {
            return {
              id: userRes.data.id,
              name: userRes.data.full_name,
              email: userRes.data.email,
              accessToken: token
            }
          }
          return null
        } catch (e) {
          console.error("Login failed", e)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      return session
    }
  },
  pages: {
    signIn: '/login'
  },
  session: { strategy: "jwt" }
}
