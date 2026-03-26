"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { Navbar } from "@/components/navbar"
import Link from "next/link"

export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          email: email.toLowerCase().trim(), 
          password 
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Something went wrong.")
        setLoading(false)
        return
      }

      // Auto-login after successful registration
      const result = await signIn("credentials", {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      })

      setLoading(false)

      if (result?.error) {
        setError(result.error)
      } else {
        window.location.href = "/profile"
      }
    } catch (err) {
      setLoading(false)
      setError("A network error occurred. Please try again.")
    }
  }

  return (
    <div className="bg-background-stitch text-on-surface font-body selection:bg-primary-container selection:text-white min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-6">
        <div className="w-full max-w-md bg-white rounded-3xl p-10 shadow-xl border border-stone-100 flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-3xl text-red-800">person_add</span>
          </div>
          
          <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">Join the Family</h1>
          <p className="text-stone-500 text-sm text-center mb-8">
            Create an account to track orders, save favorites, and get early access to limited batches.
          </p>

          {error && (
            <div className="w-full bg-red-50 border border-red-200 text-red-800 text-sm rounded-xl px-4 py-3 mb-6 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="w-full space-y-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Full Name</label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ayush Singh"
                required
                className="w-full border border-stone-200 rounded-xl px-4 py-3 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-red-800/20 focus:border-red-800 transition-all text-stone-900 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Email Address</label>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full border border-stone-200 rounded-xl px-4 py-3 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-red-800/20 focus:border-red-800 transition-all text-stone-900 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Password</label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-red-800/20 focus:border-red-800 transition-all text-stone-900 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Confirm Password</label>
              <input 
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-red-800/20 focus:border-red-800 transition-all text-stone-900 text-sm"
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-red-800 hover:bg-red-900 disabled:opacity-50 text-white font-medium py-3.5 rounded-xl transition-colors shadow-lg shadow-red-800/10 flex items-center justify-center gap-2"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="w-full flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-stone-200"></div>
            <span className="text-xs text-stone-400 uppercase tracking-wider font-medium">or</span>
            <div className="flex-1 h-px bg-stone-200"></div>
          </div>

          <button 
            onClick={() => signIn('google', { callbackUrl: '/profile' })}
            className="w-full bg-stone-900 hover:bg-stone-800 text-white font-medium py-3.5 rounded-xl transition-colors shadow-lg shadow-stone-900/10 flex items-center justify-center gap-3 mb-6 group"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign up with Google
          </button>

          <div className="text-center text-sm text-stone-500">
            Already have an account?{' '}
            <Link href="/login" className="text-red-800 font-semibold hover:underline">
              Log in
            </Link>
          </div>
        </div>
      </main>
      
      <footer className="w-full py-8 text-center text-stone-500 text-xs tracking-widest uppercase">
          © 2024 Gharana Pickles
      </footer>
    </div>
  )
}
