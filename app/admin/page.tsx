'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Shield, Image, Settings, Users, BarChart3, ArrowRight } from 'lucide-react'
import { checkAdminStatus } from '@/lib/admin/auth'

export default function AdminDashboard() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    try {
      // Note: This is a client-side check, but the layout already protects the route
      // This is just for UI state
      setIsAdmin(true)
    } catch (error) {
      setIsAdmin(false)
      router.push('/auth?error=admin_required')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  const adminModules = [
    {
      title: 'Visionary Game',
      description: 'Manage image levels and sync with directory',
      icon: Image,
      href: '/admin/visionary',
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'User Management',
      description: 'View and manage users, set admin status',
      icon: Users,
      href: '/admin/users',
      color: 'from-blue-500 to-cyan-500',
      comingSoon: true,
    },
    {
      title: 'Analytics',
      description: 'Game statistics and performance metrics',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'from-green-500 to-emerald-500',
      comingSoon: true,
    },
    {
      title: 'Settings',
      description: 'System configuration and preferences',
      icon: Settings,
      href: '/admin/settings',
      color: 'from-gray-500 to-slate-500',
      comingSoon: true,
    },
  ]

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.5)]">
              <Shield size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-1">
                Admin Dashboard
              </h1>
              <p className="text-gray-400">Manage Data Legacy 2.0 system</p>
            </div>
          </div>
        </div>

        {/* Admin Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {adminModules.map((module) => {
            const Icon = module.icon
            const isComingSoon = module.comingSoon

            if (isComingSoon) {
              return (
                <div
                  key={module.href}
                  className="bg-slate-800/50 backdrop-blur-xl border-2 border-slate-700 rounded-2xl p-6 opacity-60 cursor-not-allowed"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center`}>
                      <Icon size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">{module.title}</h3>
                      <p className="text-sm text-gray-400">{module.description}</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-400 text-xs font-semibold inline-block">
                    Coming Soon
                  </div>
                </div>
              )
            }

            return (
              <Link
                key={module.href}
                href={module.href}
                className="bg-slate-800/90 backdrop-blur-xl border-2 border-slate-700 rounded-2xl p-6 hover:border-purple-500 transition-all group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">
                      {module.title}
                    </h3>
                    <p className="text-sm text-gray-400">{module.description}</p>
                  </div>
                  <ArrowRight size={20} className="text-gray-400 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            )
          })}
        </div>

        {/* Quick Info */}
        <div className="mt-8 bg-slate-800/50 backdrop-blur-xl border-2 border-slate-700 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-3">Admin Information</h3>
          <div className="space-y-2 text-sm text-gray-400">
            <p>• Admin access is granted via the <code className="text-purple-400">is_admin</code> column in the users table</p>
            <p>• To grant admin access, run: <code className="text-purple-400">UPDATE public.users SET is_admin = true WHERE email = 'your-email@example.com';</code></p>
            <p>• Admin routes are protected by server-side authentication checks</p>
          </div>
        </div>
      </div>
    </div>
  )
}

