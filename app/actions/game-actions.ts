'use server'

import { createServerClient } from '@/lib/supabase/server'
import { generateCareerCoachFeedback } from './ai-actions'
import { ProjectState } from '@/lib/store/game-store'

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

/**
 * Save or update career progress (Startup Saga - Company State)
 */
export async function saveCareerProgress(companyState: {
  infrastructure_health: number
  budget: number
  reputation: number
  current_sprint: number
  data_quality_score: number
  last_game_type: string | null
  last_game_score: number
}) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.warn('No user authenticated, skipping career progress save')
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('career_progress')
      .upsert({
        user_id: user.id,
        infrastructure_health: companyState.infrastructure_health,
        budget: companyState.budget,
        reputation: companyState.reputation,
        current_sprint: companyState.current_sprint,
        data_quality_score: companyState.data_quality_score,
        last_game_type: companyState.last_game_type,
        last_game_score: companyState.last_game_score,
        updated_at: new Date().toISOString(),
      } as any, {
        onConflict: 'user_id',
      })

    if (error) {
      console.error('Error saving career progress:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in saveCareerProgress:', error)
    return { success: false, error: 'Failed to save career progress' }
  }
}

/**
 * Get career progress for current user
 */
export async function getCareerProgress() {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, data: null, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('career_progress')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No row found - return default state
        return {
          success: true,
          data: {
            infrastructure_health: 100,
            budget: 0,
            reputation: 0,
            current_sprint: 1,
            data_quality_score: 0,
            last_game_type: null,
            last_game_score: 0,
          },
        }
      }
      console.error('Error fetching career progress:', error)
      return { success: false, data: null, error: error.message }
    }

    return { success: true, data: data || null }
  } catch (error) {
    console.error('Error in getCareerProgress:', error)
    return { success: false, data: null, error: 'Failed to fetch career progress' }
  }
}

/**
 * Save or update project progress (Project Genesis)
 */
export async function saveProjectProgress(projectState: ProjectState) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.warn('No user authenticated, skipping project progress save')
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('career_progress')
      .upsert({
        user_id: user.id,
        raw_data_quality: projectState.raw_data_quality,
        model_integrity: projectState.model_integrity,
        semantic_layer_score: projectState.semantic_layer_score,
        business_value: projectState.business_value,
        current_stage: projectState.current_stage,
        stages_completed: projectState.stages_completed,
        last_game_type: projectState.last_game_type,
        last_game_score: projectState.last_game_score,
        updated_at: new Date().toISOString(),
      } as any, {
        onConflict: 'user_id',
      })

    if (error) {
      console.error('Error saving project progress:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in saveProjectProgress:', error)
    return { success: false, error: 'Failed to save project progress' }
  }
}

/**
 * Get project progress for current user
 */
export async function getProjectProgress() {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, data: null, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('career_progress')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No row found - return default state
        return {
          success: true,
          data: {
            raw_data_quality: 0,
            model_integrity: 0,
            semantic_layer_score: 0,
            business_value: 0,
            current_stage: 1,
            stages_completed: [],
            last_game_type: null,
            last_game_score: 0,
          } as ProjectState,
        }
      }
      console.error('Error fetching project progress:', error)
      return { success: false, data: null, error: error.message }
    }

    // Map database fields to ProjectState
    const projectState: ProjectState = {
      raw_data_quality: (data as any).raw_data_quality || 0,
      model_integrity: (data as any).model_integrity || 0,
      semantic_layer_score: (data as any).semantic_layer_score || 0,
      business_value: (data as any).business_value || 0,
      current_stage: ((data as any).current_stage || 1) as 1 | 2 | 3 | 4,
      stages_completed: (data as any).stages_completed || [],
      last_game_type: (data as any).last_game_type || null,
      last_game_score: (data as any).last_game_score || 0,
    }

    return { success: true, data: projectState }
  } catch (error) {
    console.error('Error in getProjectProgress:', error)
    return { success: false, data: null, error: 'Failed to fetch project progress' }
  }
}

