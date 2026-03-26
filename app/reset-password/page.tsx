"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { Navbar } from "@/components/navbar"
import { resetPassword } from "@/app/admin/actions"
import { Lock, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    const result = await resetPassword(token, password)
    setLoading(false)

    if (result.success) {
      setSuccess(true)
      toast.success("Password reset successfully!")
    } else {
      setError(result.error || "Failed to reset password.")
    }
  }

  if (!token) {
    return (
      <div className="bg-background-stitch min-h-screen">
        <Navbar />
        <main className="pt-32 pb-24 px-6 max-w-lg mx-auto text-center">
          <div className="bg-white rounded-3xl p-12 border border-stone-100 shadow-sm">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-serif font-bold text-stone-900 mb-2">Invalid Link</h1>
            <p className="text-stone-500 text-sm">This password reset link is invalid or expired.</p>
            <a href="/login" className="inline-block mt-6 bg-stone-900 text-white px-6 py-3 rounded-xl hover:bg-red-800 transition-colors text-sm font-medium">
              Back to Login
            </a>
          </div>
        </main>
      </div>
    )
  }

  if (success) {
    return (
      <div className="bg-background-stitch min-h-screen">
        <Navbar />
        <main className="pt-32 pb-24 px-6 max-w-lg mx-auto text-center">
          <div className="bg-white rounded-3xl p-12 border border-stone-100 shadow-sm">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-serif font-bold text-stone-900 mb-2">Password Reset!</h1>
            <p className="text-stone-500 text-sm mb-6">Your password has been updated successfully. You can now log in with your new password.</p>
            <a href="/login" className="inline-block bg-stone-900 text-white px-6 py-3 rounded-xl hover:bg-red-800 transition-colors text-sm font-medium">
              Go to Login
            </a>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="bg-background-stitch min-h-screen">
      <Navbar />
      <main className="pt-32 pb-24 px-6 max-w-lg mx-auto">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-100 shadow-sm">
          <div className="flex items-center justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
              <Lock className="w-7 h-7 text-red-800" />
            </div>
          </div>
          <h1 className="text-2xl font-serif font-bold text-stone-900 text-center mb-2">Reset Password</h1>
          <p className="text-stone-500 text-sm text-center mb-8">Enter your new password below.</p>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-red-800/20 focus:border-red-800/40 text-sm"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-red-800/20 focus:border-red-800/40 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-stone-900 text-white rounded-xl font-medium hover:bg-red-800 transition-colors disabled:opacity-50 text-sm"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background-stitch flex items-center justify-center text-stone-400">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
