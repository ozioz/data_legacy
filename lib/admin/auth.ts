/**
 * Admin Authentication Utilities
 * Functions to check admin status and protect admin routes
 */

import { createServerClient } from '@/lib/supabase/server'

export interface AdminCheckResult {
  isAdmin: boolean
  userId: string | null
  error?: string
}

/**
 * Check if the current user is an admin
 */
export async function checkAdminStatus(): Promise<AdminCheckResult> {
  try {
    const supabase = await createServerClient()
    
    // First check session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    console.log('[Admin Check] Session:', { 
      hasSession: !!session, 
      sessionError: sessionError?.message,
      userId: session?.user?.id,
      email: session?.user?.email 
    })

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log('[Admin Check] Not authenticated:', authError?.message || 'No user')
      return { isAdmin: false, userId: null, error: 'Not authenticated' }
    }

    console.log('[Admin Check] Checking user:', { id: user.id, email: user.email })

    // Check admin status from database
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('is_admin, email')
      .eq('id', user.id)
      .single()

    if (dbError) {
      console.error('[Admin Check] Database error:', dbError)
      return { isAdmin: false, userId: user.id, error: dbError.message }
    }

    if (!userData) {
      console.log('[Admin Check] User not found in database')
      return { isAdmin: false, userId: user.id, error: 'User profile not found' }
    }

    const rawIsAdmin = (userData as any).is_admin
    const isAdminBoolean = rawIsAdmin === true
    const isAdminString = rawIsAdmin === 'true'
    const isAdmin = isAdminBoolean || isAdminString

    console.log('[Admin Check] Detailed Result:', {
      userId: user.id,
      email: (userData as any).email,
      rawIsAdmin,
      rawIsAdminType: typeof rawIsAdmin,
      isAdminBoolean,
      isAdminString,
      finalIsAdmin: isAdmin,
    })

    return {
      isAdmin,
      userId: user.id,
    }
  } catch (error: any) {
    console.error('[Admin Check] Exception:', error)
    return { isAdmin: false, userId: null, error: error.message }
  }
}

/**
 * Require admin status - throws error if not admin
 * Use in server actions or API routes
 */
export async function requireAdmin(): Promise<{ userId: string }> {
  const result = await checkAdminStatus()

  if (!result.isAdmin || !result.userId) {
    throw new Error('Admin access required')
  }

  return { userId: result.userId }
}

/**
 * Check if user is authenticated (for non-admin operations)
 */
export async function requireAuth(): Promise<{ userId: string }> {
  const supabase = await createServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error('Authentication required')
  }

  return { userId: user.id }
}

