'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Sparkles,
  GraduationCap,
  Users,
  MessageSquare,
  User,
  Menu,
  X,
  LogOut,
  Cpu,
  ChevronDown,
  Shield,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { GAME_ASSETS } from '@/lib/game/assets'

export default function Navigation() {
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showInProgress, setShowInProgress] = useState(false)

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

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showInProgress) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.in-progress-dropdown')) {
        setShowInProgress(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showInProgress])

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

  // Memoize navigation items to prevent unnecessary re-renders
  const navItems = useMemo(() => [
    { href: '/', label: 'Career Mode', icon: GraduationCap, show: true, priority: 1 },
    { href: '/arcade', label: 'Quick Play', icon: Sparkles, show: true, priority: 2 },
    { href: '/interview', label: 'AI Interview', icon: MessageSquare, show: !!user, priority: 3 },
    { href: '/profile', label: 'Profile', icon: User, show: !!user, priority: 4 },
  ], [user])

  // Admin-only modules (shown separately)
  const adminItems = useMemo(() => [
    { href: '/admin', label: 'Admin', icon: Cpu, show: isAdmin, badge: 'Admin' },
  ], [isAdmin])

  // In-progress admin modules (grouped under a dropdown or separate section)
  const inProgressItems = useMemo(() => [
    { href: '/guilds', label: 'Guilds', icon: Users, show: isAdmin },
  ], [isAdmin])

  // Separate main nav items and admin items for better organization
  const mainNavItems = useMemo(() => navItems.filter((item) => item.show), [navItems])
  const activeAdminItems = useMemo(() => adminItems.filter((item) => item.show), [adminItems])
  const activeInProgressItems = useMemo(() => inProgressItems.filter((item) => item.show), [inProgressItems])

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
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {/* Main Navigation Items */}
            <div className="flex items-center gap-1">
              {mainNavItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || (item.href === '/' && pathname === '/career')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-purple-600/20 text-purple-300 border border-purple-500/50'
                        : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                )
              })}
            </div>

            {/* Admin Items Separator */}
            {activeAdminItems.length > 0 && (
              <div className="h-6 w-px bg-slate-700 mx-2" />
            )}

            {/* Admin Navigation Items */}
            {activeAdminItems.length > 0 && (
              <div className="flex items-center gap-1">
                {activeAdminItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
                        isActive
                          ? 'bg-purple-600/20 text-purple-300 border border-purple-500/50'
                          : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">{item.label}</span>
                      {item.badge && (
                        <span className={`px-1.5 py-0.5 text-xs rounded ${
                          item.badge === 'Admin'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
                
                {/* In-Progress Dropdown */}
                {activeInProgressItems.length > 0 && (
                  <div className="relative in-progress-dropdown">
                    <button
                      onClick={() => setShowInProgress(!showInProgress)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap text-gray-400 hover:text-white hover:bg-slate-800/50"
                    >
                      <span className="text-sm">In Progress</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${showInProgress ? 'rotate-180' : ''}`} />
                    </button>
                    {showInProgress && (
                      <div className="absolute top-full left-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl min-w-[180px] z-50">
                        {activeInProgressItems.map((item) => {
                          const Icon = item.icon
                          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setShowInProgress(false)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                                isActive
                                  ? 'bg-purple-600/20 text-purple-300'
                                  : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
                              }`}
                            >
                              <Icon className="w-4 h-4 flex-shrink-0" />
                              <span className="text-sm">{item.label}</span>
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center gap-1 ml-auto">
            {user && isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-purple-400 hover:bg-slate-800/50 transition-all"
                title="Admin Panel"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden lg:inline text-sm">Admin</span>
              </Link>
            )}
            {user && (
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-slate-800/50 transition-all"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:inline text-sm">Sign Out</span>
              </button>
            )}
            {!user && (
              <Link
                href="/auth"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-slate-800/50 transition-all"
              >
                <User className="w-4 h-4" />
                <span className="text-sm">Sign In</span>
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
              {/* Main Navigation Items */}
              {mainNavItems.map((item) => {
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
                  </Link>
                )
              })}

              {/* Admin Section Separator */}
              {activeAdminItems.length > 0 && (
                <>
                  <div className="h-px bg-slate-700 my-2" />
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Admin
                  </div>
                </>
              )}

              {/* Admin Navigation Items */}
              {activeAdminItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
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
                      <span className={`px-2 py-0.5 text-xs rounded ml-auto ${
                        item.badge === 'Admin'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}

              {/* In-Progress Section (Mobile) */}
              {activeInProgressItems.length > 0 && (
                <>
                  <div className="h-px bg-slate-700 my-2" />
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    In Progress
                  </div>
                  {activeInProgressItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
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
                      </Link>
                    )
                  })}
                </>
              )}
              {user && isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-purple-400 hover:bg-slate-800/50 transition-all"
                >
                  <Shield className="w-5 h-5" />
                  <span>Admin Panel</span>
                </Link>
              )}
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

