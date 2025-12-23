'use client'

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, User, Loader2, Shield, Lock, Eye, EyeOff } from 'lucide-react'

function AuthPageContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [mode, setMode] = useState<'login' | 'signup' | 'anonymous' | 'forgot'>('login')
  const [resetEmailSent, setResetEmailSent] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check for error query parameter
    const error = searchParams?.get('error')
    if (error === 'admin_required') {
      setMessage('⚠️ Admin access required. Please sign in with an admin account.')
      // Store the intended destination (default to /admin)
      if (typeof window !== 'undefined') {
        const referrer = document.referrer || window.location.href
        // Try to extract the admin path from referrer
        const adminPathMatch = referrer.match(/\/admin(\/.*)?$/)
        if (adminPathMatch) {
          localStorage.setItem('admin_redirect', adminPathMatch[0])
        } else {
          localStorage.setItem('admin_redirect', '/admin')
        }
      }
    }
  }, [searchParams])

  const handleEmailPasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (mode === 'signup') {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (error) throw error

        if (data.user) {
          // Check if user profile already exists
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('id', data.user.id)
            .single()

          if (!existingUser) {
            // New user - create profile with is_admin: false
            const { error: profileError } = await supabase.from('users').insert({
              id: data.user.id,
              email: data.user.email,
              chosen_class: null,
              current_level: 1,
              total_xp: 0,
              unlocked_levels: [
                'ENGINEER_1',
                'SCIENTIST_1',
                'ANALYST_1',
                'ENGINEER_BEHAVIORAL_1',
                'SCIENTIST_BEHAVIORAL_1',
                'ANALYST_BEHAVIORAL_1',
              ],
              is_admin: false,
            } as any)

            if (profileError) console.error('Profile creation error:', profileError)
          }
          // If user exists, don't update anything (preserve is_admin and other fields)

          setMessage('✅ Account created! You can now sign in.')
          setMode('login')
        }
      } else {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        if (data.user) {
          // Check if user profile already exists
          const { data: existingUser } = await supabase
            .from('users')
            .select('id, is_admin')
            .eq('id', data.user.id)
            .single()

          if (!existingUser) {
            // New user - create profile with is_admin: false
            const { error: profileError } = await supabase.from('users').insert({
              id: data.user.id,
              email: data.user.email,
              chosen_class: null,
              current_level: 1,
              total_xp: 0,
              unlocked_levels: [
                'ENGINEER_1',
                'SCIENTIST_1',
                'ANALYST_1',
                'ENGINEER_BEHAVIORAL_1',
                'SCIENTIST_BEHAVIORAL_1',
                'ANALYST_BEHAVIORAL_1',
              ],
              is_admin: false,
            } as any)

            if (profileError) console.error('Profile creation error:', profileError)
          }
          // If user exists, don't update anything (preserve is_admin and other fields)

          // Check if admin access was requested
          const isAdminRequired = searchParams?.get('error') === 'admin_required'

          if (isAdminRequired) {
            // Check admin status after login
            const { data: userData, error: userDataError } = await supabase
              .from('users')
              .select('is_admin, email')
              .eq('id', data.user.id)
              .single()

            console.log('[Auth] Admin check:', {
              userId: data.user.id,
              email: data.user.email,
              userData,
              userDataError,
              is_admin: (userData as any)?.is_admin,
              is_admin_type: typeof (userData as any)?.is_admin,
            })

            // Check if user is admin (handle both boolean true and string 'true')
            const isAdmin = (userData as any)?.is_admin === true || (userData as any)?.is_admin === 'true'

            if (isAdmin) {
              // User is admin, redirect to the intended admin page
              const redirectPath = localStorage.getItem('admin_redirect') || '/admin'
              localStorage.removeItem('admin_redirect') // Clean up
              console.log('[Auth] Redirecting admin to:', redirectPath)
              // Use window.location for reliable redirect
              window.location.href = redirectPath
              return
            } else {
              // User is not admin, show error
              localStorage.removeItem('admin_redirect') // Clean up
              console.log('[Auth] User is not admin:', userData)
              setMessage('❌ This account does not have admin privileges. Please contact an administrator.')
              return
            }
          }

          // Default redirect to home
          window.location.href = '/'
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error)
      if (error.message?.includes('Invalid login credentials')) {
        setMessage('❌ Invalid email or password. Please try again.')
      } else if (error.message?.includes('User already registered')) {
        setMessage('⚠️ This email is already registered. Please sign in instead.')
        setMode('login')
      } else {
        setMessage(error.message || 'An error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      setResetEmailSent(true)
      setMessage('✅ Password reset link sent! Check your email (and spam folder).')
    } catch (error: any) {
      console.error('Password reset error:', error)
      if (error.message?.includes('rate limit')) {
        setMessage('⚠️ Too many requests. Please wait a few minutes and try again.')
      } else {
        setMessage(error.message || 'An error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAnonymousLogin = async () => {
    setLoading(true)
    setMessage('')

    try {
      // Try anonymous sign-in first
      const { data, error } = await supabase.auth.signInAnonymously()

      if (error) {
        // If anonymous sign-in is disabled, use local storage guest mode
        if (error.message?.includes('disabled') || error.message?.includes('Anonymous')) {
          // Create a guest session in local storage
          const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(7)}`
          localStorage.setItem('guest_user_id', guestId)
          localStorage.setItem('guest_mode', 'true')

          // Redirect to home - the app will handle guest mode
          window.location.href = '/'
          return
        }
        throw error
      }

      // Create user profile if anonymous sign-in worked
      if (data.user) {
        // Check if user profile already exists
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('id', data.user.id)
          .single()

        if (!existingUser) {
          // New user - create profile with is_admin: false
          const { error: profileError } = await supabase.from('users').insert({
            id: data.user.id,
            email: null,
            chosen_class: null,
            current_level: 1,
            total_xp: 0,
            unlocked_levels: [
              'ENGINEER_1',
              'SCIENTIST_1',
              'ANALYST_1',
              'ENGINEER_BEHAVIORAL_1',
              'SCIENTIST_BEHAVIORAL_1',
              'ANALYST_BEHAVIORAL_1',
            ],
            is_admin: false,
          } as any)

          if (profileError) console.error('Profile creation error:', profileError)
        }
        // If user exists, don't update anything (preserve is_admin and other fields)
      }

      router.push('/')
    } catch (error: any) {
      console.error('Anonymous login error:', error)
      // Fallback to guest mode
      const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(7)}`
      localStorage.setItem('guest_user_id', guestId)
      localStorage.setItem('guest_mode', 'true')
      window.location.href = '/'
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800/90 border-2 border-neon-blue rounded-2xl p-8 shadow-[0_0_50px_rgba(0,255,255,0.3)]">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-purple-500 mb-2">
            DATA LEGACY 2.0
          </h1>
          <p className="text-gray-400">Sign in to save your progress</p>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => {
              setMode('login')
              setMessage('')
              setResetEmailSent(false)
            }}
            className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all ${
              mode === 'login'
                ? 'bg-neon-blue text-black'
                : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
            }`}
          >
            <Lock size={16} className="inline mr-2" />
            Sign In
          </button>
          <button
            onClick={() => {
              setMode('signup')
              setMessage('')
              setResetEmailSent(false)
            }}
            className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all ${
              mode === 'signup'
                ? 'bg-neon-blue text-black'
                : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
            }`}
          >
            <Mail size={16} className="inline mr-2" />
            Sign Up
          </button>
          <button
            onClick={() => {
              setMode('anonymous')
              setMessage('')
              setResetEmailSent(false)
            }}
            className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all ${
              mode === 'anonymous'
                ? 'bg-neon-blue text-black'
                : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
            }`}
          >
            <User size={16} className="inline mr-2" />
            Guest
          </button>
        </div>

        {mode === 'forgot' ? (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            {!resetEmailSent ? (
              <>
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-neon-blue"
                    placeholder="your@email.com"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-neon-blue text-black font-bold py-3 rounded-lg hover:bg-cyan-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail size={20} />
                      Send Reset Link
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login')
                    setMessage('')
                    setResetEmailSent(false)
                  }}
                  className="w-full text-gray-400 hover:text-white text-sm transition-colors underline"
                >
                  ← Back to Sign In
                </button>
              </>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-gray-400">
                  Check your email for the password reset link. If you don't see it, check your spam folder.
                </p>
                <button
                  onClick={() => {
                    setMode('login')
                    setMessage('')
                    setResetEmailSent(false)
                  }}
                  className="w-full bg-slate-700 text-white font-bold py-3 rounded-lg hover:bg-slate-600 transition-all"
                >
                  Back to Sign In
                </button>
              </div>
            )}
          </form>
        ) : (mode === 'login' || mode === 'signup') ? (
          <form onSubmit={handleEmailPasswordAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-neon-blue"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={mode === 'signup'}
                  minLength={6}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-neon-blue pr-12"
                  placeholder={mode === 'signup' ? 'Min. 6 characters' : 'Enter your password'}
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
            {mode === 'login' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot')
                    setMessage('')
                    setResetEmailSent(false)
                  }}
                  className="text-sm text-gray-400 hover:text-neon-blue transition-colors underline"
                >
                  Forgot password?
                </button>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-neon-blue text-black font-bold py-3 rounded-lg hover:bg-cyan-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  {mode === 'signup' ? 'Creating Account...' : 'Signing in...'}
                </>
              ) : (
                <>
                  {mode === 'signup' ? (
                    <>
                      <Mail size={20} />
                      Create Account
                    </>
                  ) : (
                    <>
                      <Lock size={20} />
                      Sign In
                    </>
                  )}
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-400 text-sm text-center">
              Play without an account. Your progress will be saved locally.
            </p>
            <button
              onClick={handleAnonymousLogin}
              disabled={loading}
              className="w-full bg-neon-green text-black font-bold py-3 rounded-lg hover:bg-green-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Signing in...
                </>
              ) : (
                <>
                  <User size={20} />
                  Continue as Guest
                </>
              )}
            </button>
          </div>
        )}

        {message && (
          <div
            className={`mt-4 p-3 rounded-lg text-center ${
              message.includes('✅') || message.includes('created')
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
            onClick={() => {
              // Set guest mode and redirect
              const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(7)}`
              localStorage.setItem('guest_user_id', guestId)
              localStorage.setItem('guest_mode', 'true')
              window.location.href = '/'
            }}
            className="text-gray-400 hover:text-white text-sm transition-colors underline"
          >
            Skip for now →
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-purple-400 mx-auto mb-4" size={48} />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  )
}
