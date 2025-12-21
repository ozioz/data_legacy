'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Sparkles,
  GraduationCap,
  Users,
  ShoppingCart,
  MessageSquare,
  User,
  Menu,
  X,
  LogOut,
  Cpu,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { GAME_ASSETS } from '@/lib/game/assets'

export default function Navigation() {
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    checkUser()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      checkUser()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    checkAdmin()
  }, [user])

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setUser(user)
  }

  const checkAdmin = async () => {
    if (!user) {
      setIsAdmin(false)
      return
    }
    try {
      const { data } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single()
      setIsAdmin((data as any)?.is_admin === true)
    } catch (error) {
      setIsAdmin(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/auth'
  }

  const navItems = [
    { href: '/', label: 'Career Mode', icon: GraduationCap, show: true },
    { href: '/arcade', label: 'Prompt Lab', icon: Sparkles, show: true },
    { href: '/interview', label: 'AI Interview', icon: MessageSquare, show: !!user },
    // Admin-only modules
    { href: '/core', label: 'The Core', icon: Cpu, show: isAdmin, badge: 'In Progress' },
    { href: '/guilds', label: 'Guilds', icon: Users, show: isAdmin, badge: 'In Progress' },
    { href: '/market', label: 'Marketplace', icon: ShoppingCart, show: isAdmin, badge: 'In Progress' },
    { href: '/profile', label: 'Profile', icon: User, show: isAdmin, badge: 'In Progress' },
  ]

  const activeItems = navItems.filter((item) => item.show)

  // Don't show navigation on auth page
  if (pathname?.startsWith('/auth')) {
    return null
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Home */}
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-purple-500 to-pink-500 hover:opacity-80 transition-opacity"
          >
            <div className="relative w-8 h-8 flex items-center justify-center">
              <Image
                src={GAME_ASSETS.logo}
                alt="Data Legacy Logo"
                fill
                className="object-contain"
                onError={(e) => {
                  // Hide image on error, show icon fallback
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  const parent = target.parentElement
                  if (parent) {
                    const fallback = parent.querySelector('.logo-fallback') as HTMLElement
                    if (fallback) {
                      fallback.style.display = 'block'
                      fallback.style.position = 'absolute'
                    }
                  }
                }}
              />
              <Home className="w-5 h-5 text-neon-blue logo-fallback" style={{ display: 'none' }} />
            </div>
            <span className="hidden sm:inline">Data Legacy 2.0</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {activeItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href === '/' && pathname === '/career')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/50'
                      : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 rounded">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
            {user && (
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-slate-800/50 transition-all ml-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:inline">Sign Out</span>
              </button>
            )}
            {!user && (
              <Link
                href="/auth"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-slate-800/50 transition-all ml-2"
              >
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-slate-800/50 transition-all"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-slate-800 mt-2 pt-4">
            <div className="flex flex-col gap-2">
              {activeItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || (item.href === '/' && pathname === '/career')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-purple-600/20 text-purple-300 border border-purple-500/50'
                        : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 rounded ml-auto">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
              {user && (
                <button
                  onClick={() => {
                    handleSignOut()
                    setIsMobileMenuOpen(false)
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-red-400 hover:bg-slate-800/50 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              )}
              {!user && (
                <Link
                  href="/auth"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-slate-800/50 transition-all"
                >
                  <User className="w-5 h-5" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

