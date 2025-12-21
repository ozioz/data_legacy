import { redirect } from 'next/navigation'
import { checkAdminStatus } from '@/lib/admin/auth'

export const dynamic = 'force-dynamic'

export default async function GuildsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAdmin } = await checkAdminStatus()

  if (!isAdmin) {
    redirect('/auth?error=admin_required')
  }

  return <>{children}</>
}

