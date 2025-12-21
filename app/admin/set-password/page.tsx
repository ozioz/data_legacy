'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Lock, Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function SetPasswordPage() {
  const [email, setEmail] = useState('oozdwh@gmail.com')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (password.length < 6) {
      setMessage('❌ Password must be at least 6 characters long.')
      setLoading(false)
      return
    }

    try {
      // First, try to sign in to check if user exists
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: 'dummy_password_to_check_user', // This will fail, but we can check the error
      })

      // If user doesn't exist, create new account
      if (signInError?.message?.includes('Invalid login credentials') || signInError?.message?.includes('Email not confirmed')) {
        // User exists but no password - we need to use a different method
        // Try to sign up (this will fail if user exists, but we can handle it)
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        })

        if (signUpError) {
          if (signUpError.message?.includes('already registered')) {
            setMessage('⚠️ User already exists. Please use "Reset Password" feature or delete and recreate the user.')
          } else {
            throw signUpError
          }
        } else if (signUpData.user) {
          setMessage('✅ Account created with password! You can now sign in.')
          setTimeout(() => {
            router.push('/auth')
          }, 2000)
        }
      } else {
        throw signInError
      }
    } catch (error: any) {
      console.error('Set password error:', error)
      setMessage(error.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAndRecreate = async () => {
    if (!confirm('⚠️ This will delete the user and all their data. Are you sure?')) {
      return
    }

    setLoading(true)
    setMessage('')

    try {
      // Note: We can't delete users from client-side
      // This requires server-side admin access
      setMessage('⚠️ User deletion requires server-side admin access. Please use Supabase Dashboard > Authentication > Users to delete the user, then sign up again.')
    } catch (error: any) {
      console.error('Delete error:', error)
      setMessage(error.message || 'An error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800/90 border-2 border-neon-blue rounded-2xl p-8 shadow-[0_0_50px_rgba(0,255,255,0.3)]">
        <div className="mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Admin
          </Link>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-purple-500 mb-2">
            Set User Password
          </h1>
          <p className="text-gray-400 text-sm">
            Set password for existing user (if user was created via magic link)
          </p>
        </div>

        <form onSubmit={handleSetPassword} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-neon-blue"
              placeholder="user@email.com"
            />
          </div>
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
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-neon-blue text-black font-bold py-3 rounded-lg hover:bg-cyan-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Processing...
              </>
            ) : (
              <>
                <Lock size={20} />
                Set Password
              </>
            )}
          </button>
        </form>

        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg">
          <p className="text-yellow-400 text-sm font-bold mb-2">⚠️ Important Note:</p>
          <p className="text-gray-400 text-xs mb-3">
            If the user already exists without a password (created via magic link), you need to:
          </p>
          <ol className="text-gray-400 text-xs list-decimal list-inside space-y-1">
            <li>Delete the user from Supabase Dashboard → Authentication → Users</li>
            <li>Go to /auth page and sign up with email/password</li>
            <li>Run the admin SQL script to set admin status</li>
          </ol>
        </div>

        {message && (
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
      </div>
    </div>
  )
}

