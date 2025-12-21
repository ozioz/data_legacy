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
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { isAdmin: false, userId: null, error: 'Not authenticated' }
    }

    // Check admin status from database
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (dbError) {
      console.error('Error checking admin status:', dbError)
      return { isAdmin: false, userId: user.id, error: dbError.message }
    }

    return {
      isAdmin: (userData as any)?.is_admin === true,
      userId: user.id,
    }
  } catch (error: any) {
    console.error('Error in checkAdminStatus:', error)
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

