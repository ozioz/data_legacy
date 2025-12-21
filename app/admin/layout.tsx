import { redirect } from 'next/navigation'
import { checkAdminStatus } from '@/lib/admin/auth'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAdmin, error } = await checkAdminStatus()

  if (!isAdmin) {
    redirect('/auth?error=admin_required')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {children}
    </div>
  )
}

