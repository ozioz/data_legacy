'use client'

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react'

function ResetPasswordPageContent() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if we have a valid session (user clicked the reset link)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setMessage('⚠️ Invalid or expired reset link. Please request a new one.')
      }
    }
    checkSession()
  }, [])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    // Validate passwords
    if (password.length < 6) {
      setMessage('❌ Password must be at least 6 characters long.')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setMessage('❌ Passwords do not match.')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) throw error

      setSuccess(true)
      setMessage('✅ Password updated successfully! Redirecting...')

      // Redirect to home after 2 seconds
      setTimeout(() => {
        router.push('/')
        router.refresh()
      }, 2000)
    } catch (error: any) {
      console.error('Password reset error:', error)
      if (error.message?.includes('session')) {
        setMessage('⚠️ Your session has expired. Please request a new password reset link.')
      } else {
        setMessage(error.message || 'An error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800/90 border-2 border-neon-blue rounded-2xl p-8 shadow-[0_0_50px_rgba(0,255,255,0.3)]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-purple-500 mb-2">
            Reset Password
          </h1>
          <p className="text-gray-400">Enter your new password</p>
        </div>

        {success ? (
          <div className="text-center space-y-4">
            <CheckCircle className="mx-auto text-green-400" size={64} />
            <p className="text-green-400 font-bold">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-neon-blue pr-12"
                  placeholder="Min. 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-neon-blue pr-12"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-neon-blue text-black font-bold py-3 rounded-lg hover:bg-cyan-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Updating...
                </>
              ) : (
                <>
                  <Lock size={20} />
                  Update Password
                </>
              )}
            </button>
          </form>
        )}

        {message && !success && (
          <div
            className={`mt-4 p-3 rounded-lg text-center ${
              message.includes('✅')
                ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                : message.includes('⚠️')
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                  : 'bg-red-500/20 text-red-400 border border-red-500/50'
            }`}
          >
            {message}
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/auth')}
            className="text-gray-400 hover:text-white text-sm transition-colors underline"
          >
            ← Back to Sign In
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-purple-400 mx-auto mb-4" size={48} />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordPageContent />
    </Suspense>
  )
}

