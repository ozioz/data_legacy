'use server'

import { createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

type Guild = Database['public']['Tables']['guilds']['Row']
type GuildMember = Database['public']['Tables']['guild_members']['Row']
type GuildInsert = Database['public']['Tables']['guilds']['Insert']
type GuildMemberInsert = Database['public']['Tables']['guild_members']['Insert']

/**
 * Create a new guild
 */
export async function createGuild(data: { name: string; description?: string }) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Check if user is already in a guild
    const { data: existingMember } = await supabase
      .from('guild_members')
      .select('guild_id')
      .eq('user_id', user.id)
      .single()

    if (existingMember) {
      return { success: false, error: 'You are already a member of a guild' }
    }

    // Create guild
    const { data: guild, error: guildError } = await (supabase as any)
      .from('guilds')
      .insert({
        name: data.name,
        description: data.description || '',
        leader_id: user.id,
        total_xp: 0,
        member_count: 1,
      })
      .select()
      .single()

    if (guildError) {
      console.error('Error creating guild:', guildError)
      return { success: false, error: guildError.message }
    }

    // Add leader as member
    const { error: memberError } = await (supabase as any).from('guild_members').insert({
      guild_id: guild.id,
      user_id: user.id,
      role: 'leader',
      contributed_xp: 0,
    })

    if (memberError) {
      console.error('Error adding leader to guild:', memberError)
      // Rollback guild creation
      await supabase.from('guilds').delete().eq('id', guild.id)
      return { success: false, error: 'Failed to create guild' }
    }

    return { success: true, guild }
  } catch (error) {
    console.error('Error in createGuild:', error)
    return { success: false, error: 'Failed to create guild' }
  }
}

/**
 * Get all guilds
 */
export async function getGuilds(limit: number = 50) {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('guilds')
      .select('*')
      .order('total_xp', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching guilds:', error)
      return { success: false, data: [], error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error in getGuilds:', error)
    return { success: false, data: [], error: 'Failed to fetch guilds' }
  }
}

/**
 * Get guild by ID with members
 */
export async function getGuildById(guildId: string) {
  try {
    const supabase = await createServerClient()
    
    // Get guild
    const { data: guild, error: guildError } = await supabase
      .from('guilds')
      .select('*')
      .eq('id', guildId)
      .single()

    if (guildError || !guild) {
      return { success: false, guild: null, members: [], error: 'Guild not found' }
    }

    // Get members with user info
    const { data: members, error: membersError } = await supabase
      .from('guild_members')
      .select(`
        *,
        user:users!guild_members_user_id_fkey (
          id,
          email,
          chosen_class,
          total_xp
        )
      `)
      .eq('guild_id', guildId)
      .order('contributed_xp', { ascending: false })

    if (membersError) {
      console.error('Error fetching members:', membersError)
      return { success: true, guild, members: [] }
    }

    return { success: true, guild, members: members || [] }
  } catch (error) {
    console.error('Error in getGuildById:', error)
    return { success: false, guild: null, members: [], error: 'Failed to fetch guild' }
  }
}

/**
 * Join a guild
 */
export async function joinGuild(guildId: string) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Check if user is already in a guild
    const { data: existingMember } = await supabase
      .from('guild_members')
      .select('guild_id')
      .eq('user_id', user.id)
      .single()

    if (existingMember) {
      return { success: false, error: 'You are already a member of a guild' }
    }

    // Check if guild exists
    const { data: guild } = await supabase.from('guilds').select('id').eq('id', guildId).single()
    if (!guild) {
      return { success: false, error: 'Guild not found' }
    }

    // Add member
    const { error: memberError } = await (supabase as any).from('guild_members').insert({
      guild_id: guildId,
      user_id: user.id,
      role: 'member',
      contributed_xp: 0,
    })

    if (memberError) {
      console.error('Error joining guild:', memberError)
      return { success: false, error: memberError.message }
    }

    // Update member count
    const { data: guildData } = await supabase
      .from('guilds')
      .select('member_count')
      .eq('id', guildId)
      .single()

    if (guildData) {
      await (supabase as any)
        .from('guilds')
        .update({ member_count: ((guildData as any).member_count || 0) + 1 })
        .eq('id', guildId)
    }

    return { success: true }
  } catch (error) {
    console.error('Error in joinGuild:', error)
    return { success: false, error: 'Failed to join guild' }
  }
}

/**
 * Leave a guild
 */
export async function leaveGuild(guildId: string) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Check if user is the leader
    const { data: guild } = await supabase
      .from('guilds')
      .select('leader_id, member_count')
      .eq('id', guildId)
      .single()

    if (!guild) {
      return { success: false, error: 'Guild not found' }
    }

    if ((guild as any).leader_id === user.id) {
      return { success: false, error: 'Leaders cannot leave their guild. Transfer leadership or delete the guild instead.' }
    }

    // Get member's contributed XP
    const { data: member } = await supabase
      .from('guild_members')
      .select('contributed_xp')
      .eq('guild_id', guildId)
      .eq('user_id', user.id)
      .single()

    // Remove member
    const { error } = await supabase
      .from('guild_members')
      .delete()
      .eq('guild_id', guildId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error leaving guild:', error)
      return { success: false, error: error.message }
    }

    // Update guild XP and member count
    if ((member as any)?.contributed_xp) {
      const currentXp = (guild as any).total_xp || 0
      const memberXp = (member as any).contributed_xp || 0
      await (supabase as any)
        .from('guilds')
        .update({ total_xp: Math.max(0, currentXp - memberXp) })
        .eq('id', guildId)
    }

    await (supabase as any)
      .from('guilds')
      .update({ member_count: Math.max(0, ((guild as any).member_count || 1) - 1) })
      .eq('id', guildId)

    return { success: true }
  } catch (error) {
    console.error('Error in leaveGuild:', error)
    return { success: false, error: 'Failed to leave guild' }
  }
}

/**
 * Get guild leaderboard
 */
export async function getGuildLeaderboard(limit: number = 10) {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('guild_leaderboard')
      .select('*')
      .order('total_xp', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching guild leaderboard:', error)
      return { success: false, data: [], error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error in getGuildLeaderboard:', error)
    return { success: false, data: [], error: 'Failed to fetch leaderboard' }
  }
}

/**
 * Get user's current guild
 */
export async function getUserGuild() {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, guild: null, error: 'Not authenticated' }
    }

    const { data: member } = await supabase
      .from('guild_members')
      .select('guild_id, role, contributed_xp')
      .eq('user_id', user.id)
      .single()

    if (!member) {
      return { success: true, guild: null }
    }

    const { data: guild } = await supabase
      .from('guilds')
      .select('*')
      .eq('id', (member as any).guild_id)
      .single()

    return { success: true, guild, member }
  } catch (error) {
    console.error('Error in getUserGuild:', error)
    return { success: false, guild: null, error: 'Failed to fetch guild' }
  }
}

