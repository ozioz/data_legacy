import { redirect } from 'next/navigation'
import { checkAdminStatus } from '@/lib/admin/auth'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const result = await checkAdminStatus()
  
  console.log('[Admin Layout] Admin check result:', {
    isAdmin: result.isAdmin,
    userId: result.userId,
    error: result.error,
  })

  if (!result.isAdmin) {
    console.log('[Admin Layout] Redirecting to auth page - not admin')
    redirect('/auth?error=admin_required')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {children}
    </div>
  )
}

