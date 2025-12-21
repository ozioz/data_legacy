'use server'

import { createServerClient } from '@/lib/supabase/server'
import { generateCareerCoachFeedback } from './ai-actions'

export interface GameSessionData {
  gameType: string
  levelId: string
  score?: number
  duration?: number
  won: boolean
  xpEarned: number
  gameConfig?: Record<string, any>
}

/**
 * Save a game session to Supabase
 */
export async function saveGameSession(data: GameSessionData) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.warn('No user authenticated, skipping session save')
      return { success: false, error: 'Not authenticated' }
    }

    const { data: sessionData, error } = await supabase
      .from('game_sessions')
      .insert({
        user_id: user.id,
        game_type: data.gameType,
        level_id: data.levelId,
        score: data.score,
        duration: data.duration,
        won: data.won,
        xp_earned: data.xpEarned,
        game_config: data.gameConfig || {},
      } as any)
      .select()
      .single()

    if (error) {
      console.error('Error saving game session:', error)
      return { success: false, error: error.message, sessionId: null }
    }

    // Update user's total XP
    const { error: updateError } = await supabase.rpc('increment_user_xp', {
      user_id: user.id,
      xp_amount: data.xpEarned,
    } as any)

    // If RPC doesn't exist, do manual update
    if (updateError) {
      const { data: userData } = await supabase
        .from('users')
        .select('total_xp')
        .eq('id', user.id)
        .single()

      if (userData) {
        const updateData: any = { total_xp: ((userData as any).total_xp || 0) + data.xpEarned }
        const updateQuery: any = (supabase.from('users') as any).update(updateData)
        await updateQuery.eq('id', user.id)
      }
    }

    return { success: true, sessionId: (sessionData as any)?.id || null }
  } catch (error) {
    console.error('Error in saveGameSession:', error)
    return { success: false, error: 'Failed to save session' }
  }
}

/**
 * Save a behavioral choice
 */
export async function saveBehavioralChoice(
  sessionId: string,
  scenarioContext: string,
  chosenAction: number,
  choiceText: string,
  aiFeedback: string,
  score: number
) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase.from('behavioral_choices').insert({
      user_id: user.id,
      session_id: sessionId,
      scenario_context: scenarioContext,
      chosen_action: chosenAction,
      choice_text: choiceText,
      ai_feedback: aiFeedback,
      score: score,
    } as any)

    if (error) {
      console.error('Error saving behavioral choice:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in saveBehavioralChoice:', error)
    return { success: false, error: 'Failed to save choice' }
  }
}

/**
 * Get AI Career Coach feedback for a completed game
 */
export async function getCareerCoachFeedback(
  gameType: string,
  won: boolean,
  score: number,
  level: string,
  gameLogs?: Record<string, any>
): Promise<string> {
  return await generateCareerCoachFeedback(gameType, won, score, level, gameLogs)
}

/**
 * Get leaderboard data
 */
export async function getLeaderboard(limit: number = 10) {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .limit(limit)

    if (error) {
      console.error('Error fetching leaderboard:', error)
      return { success: false, data: [], error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error in getLeaderboard:', error)
    return { success: false, data: [], error: 'Failed to fetch leaderboard' }
  }
}

/**
 * Get game balance statistics
 */
export async function getGameBalanceStats(gameType?: string, levelId?: string) {
  try {
    const supabase = await createServerClient()
    let query = supabase.from('game_balance_stats').select('*')

    if (gameType) {
      query = query.eq('game_type', gameType)
    }
    if (levelId) {
      query = query.eq('level_id', levelId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching balance stats:', error)
      return { success: false, data: [], error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error in getGameBalanceStats:', error)
    return { success: false, data: [], error: 'Failed to fetch stats' }
  }
}

