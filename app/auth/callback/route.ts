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
      const { error } = await supabase.from('users').upsert({
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

  return NextResponse.redirect(new URL('/', requestUrl.origin))
}

