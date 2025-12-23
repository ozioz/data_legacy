import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createServerClient()
    await supabase.auth.exchangeCodeForSession(code)

    // Create user profile if doesn't exist
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      // Check if user profile already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, is_admin')
        .eq('id', user.id)
        .single()

      if (existingUser) {
        // User exists - only update email if changed, preserve is_admin
        const { error } = await (supabase as any)
          .from('users')
          .update({
            email: user.email,
            // Don't touch is_admin, chosen_class, current_level, total_xp, unlocked_levels
          })
          .eq('id', user.id)

        if (error) console.error('Profile update error:', error)
      } else {
        // New user - create profile with is_admin: false
        const { error } = await supabase.from('users').insert({
          id: user.id,
          email: user.email,
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

        if (error) console.error('Profile creation error:', error)
      }
    }
  }

  return NextResponse.redirect(new URL('/', requestUrl.origin))
}

