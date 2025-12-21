'use server'

import { createServerClient } from '@/lib/supabase/server'

export interface UserPersona {
  // Basic Info
  email: string | null
  chosenClass: string | null
  currentLevel: number
  totalXP: number
  
  // Top Skills (from Arcade high scores)
  topSkills: Array<{
    skill: string
    gameType: string
    percentile: number
    avgScore: number
  }>
  
  // Soft Skills (from Behavioral choices)
  softSkills: Array<{
    skill: string
    proficiency: 'Expert' | 'Advanced' | 'Intermediate' | 'Beginner'
    scenarios: number
    avgScore: number
  }>
  
  // Coding Hours
  totalCodingHours: number
  totalSessions: number
  
  // Achievements
  achievements: string[]
}

/**
 * Generate user persona by analyzing game data
 */
export async function generateUserPersona(userId: string): Promise<{ success: boolean; persona: UserPersona | null; error?: string }> {
  try {
    const supabase = await createServerClient()
    
    // Get user basic info
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email, chosen_class, current_level, total_xp')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return { success: false, persona: null, error: 'User not found' }
    }

    // Get game sessions for coding hours calculation
    const { data: gameSessions } = await supabase
      .from('game_sessions')
      .select('duration, game_type, score, won')
      .eq('user_id', userId)

    // Calculate total coding hours
    // Handle both duration and duration_seconds field names
    const totalDuration = gameSessions?.reduce((sum, session) => {
      const duration = (session as any).duration || (session as any).duration_seconds || 0
      return sum + duration
    }, 0) || 0
    const totalCodingHours = Math.round((totalDuration / 3600) * 10) / 10 // Round to 1 decimal
    const totalSessions = gameSessions?.length || 0

    // Get top skills from Arcade games (prompt_battles)
    const { data: promptBattles } = await supabase
      .from('prompt_battles')
      .select('game_type, ai_score')
      .eq('user_id', userId)

    // Calculate skill percentiles
    const skillMap = new Map<string, number[]>()
    promptBattles?.forEach((battle: any) => {
      const gameType = battle.game_type
      if (!skillMap.has(gameType)) {
        skillMap.set(gameType, [])
      }
      skillMap.get(gameType)!.push(battle.ai_score || 0)
    })

    // Get all users' scores for percentile calculation
    const { data: allBattles } = await (supabase as any)
      .from('prompt_battles')
      .select('game_type, ai_score')

    const allScoresByGame = new Map<string, number[]>()
    allBattles?.forEach((battle: any) => {
      const gameType = battle.game_type
      if (!allScoresByGame.has(gameType)) {
        allScoresByGame.set(gameType, [])
      }
      allScoresByGame.get(gameType)!.push(battle.ai_score || 0)
    })

    const topSkills: UserPersona['topSkills'] = []
    skillMap.forEach((scores, gameType) => {
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length
      const allScores = allScoresByGame.get(gameType) || []
      const sortedScores = [...allScores].sort((a, b) => b - a)
      const percentile = Math.round(((sortedScores.filter(s => s < avgScore).length / sortedScores.length) * 100) || 0)

      const skillNames: Record<string, string> = {
        VISIONARY: 'Image Prompt Engineering',
        AGENT_HANDLER: 'AI Agent Architecture',
        ALGORITHM: 'Persona Analysis',
        COACH_GPT: 'Strategic Planning',
        PIPELINE: 'SQL Optimization',
        RUNNER: 'Data Processing',
        QUERY: 'Query Performance',
        FARM: 'Resource Management',
        TOWER: 'System Security',
        BEHAVIORAL: 'Behavioral Analysis',
      }

      topSkills.push({
        skill: skillNames[gameType] || gameType,
        gameType,
        percentile: Math.max(0, 100 - percentile), // Invert so higher is better
        avgScore: Math.round(avgScore),
      })
    })

    // Sort by percentile and take top 5
    topSkills.sort((a, b) => b.percentile - a.percentile)
    const top5Skills = topSkills.slice(0, 5)

    // Get soft skills from behavioral choices
    const { data: behavioralChoices } = await (supabase as any)
      .from('behavioral_choices')
      .select('scenario_context, score, ai_feedback')
      .eq('user_id', userId)

    // Analyze behavioral scenarios to extract soft skills
    const softSkillMap = new Map<string, { scores: number[]; scenarios: number }>()
    
    behavioralChoices?.forEach((choice: any) => {
      const context = choice.scenario_context?.toLowerCase() || ''
      const score = choice.score || 0
      
      // Map scenarios to soft skills
      if (context.includes('stakeholder') || context.includes('client') || context.includes('manager')) {
        const skill = 'Stakeholder Management'
        if (!softSkillMap.has(skill)) {
          softSkillMap.set(skill, { scores: [], scenarios: 0 })
        }
        softSkillMap.get(skill)!.scores.push(score)
        softSkillMap.get(skill)!.scenarios++
      }
      if (context.includes('crisis') || context.includes('emergency') || context.includes('urgent')) {
        const skill = 'Crisis Management'
        if (!softSkillMap.has(skill)) {
          softSkillMap.set(skill, { scores: [], scenarios: 0 })
        }
        softSkillMap.get(skill)!.scores.push(score)
        softSkillMap.get(skill)!.scenarios++
      }
      if (context.includes('ethics') || context.includes('ethical') || context.includes('moral')) {
        const skill = 'Ethical Decision Making'
        if (!softSkillMap.has(skill)) {
          softSkillMap.set(skill, { scores: [], scenarios: 0 })
        }
        softSkillMap.get(skill)!.scores.push(score)
        softSkillMap.get(skill)!.scenarios++
      }
      if (context.includes('team') || context.includes('collaboration') || context.includes('colleague')) {
        const skill = 'Team Collaboration'
        if (!softSkillMap.has(skill)) {
          softSkillMap.set(skill, { scores: [], scenarios: 0 })
        }
        softSkillMap.get(skill)!.scores.push(score)
        softSkillMap.get(skill)!.scenarios++
      }
    })

    const softSkills: UserPersona['softSkills'] = []
    softSkillMap.forEach((data, skill) => {
      const avgScore = data.scores.reduce((a, b) => a + b, 0) / data.scores.length
      let proficiency: 'Expert' | 'Advanced' | 'Intermediate' | 'Beginner'
      
      if (avgScore >= 80) proficiency = 'Expert'
      else if (avgScore >= 60) proficiency = 'Advanced'
      else if (avgScore >= 40) proficiency = 'Intermediate'
      else proficiency = 'Beginner'

      softSkills.push({
        skill,
        proficiency,
        scenarios: data.scenarios,
        avgScore: Math.round(avgScore),
      })
    })

    // Sort by proficiency and avgScore
    softSkills.sort((a, b) => {
      const order = { Expert: 4, Advanced: 3, Intermediate: 2, Beginner: 1 }
      if (order[a.proficiency] !== order[b.proficiency]) {
        return order[b.proficiency] - order[a.proficiency]
      }
      return b.avgScore - a.avgScore
    })

    // Generate achievements
    const achievements: string[] = []
    const userXP = (user as any).total_xp || 0
    if (userXP >= 10000) achievements.push('Elite Data Professional')
    if (userXP >= 5000) achievements.push('Senior Data Specialist')
    if (userXP >= 1000) achievements.push('Certified Data Engineer')
    if (totalCodingHours >= 100) achievements.push('Century Coder')
    if (totalCodingHours >= 50) achievements.push('Dedicated Developer')
    if (top5Skills.some(s => s.percentile >= 95)) achievements.push('Top Performer')
    if (softSkills.some(s => s.proficiency === 'Expert')) achievements.push('Expert Problem Solver')

    const persona: UserPersona = {
      email: (user as any).email,
      chosenClass: (user as any).chosen_class,
      currentLevel: (user as any).current_level,
      totalXP: userXP,
      topSkills: top5Skills,
      softSkills,
      totalCodingHours,
      totalSessions,
      achievements,
    }

    return { success: true, persona }
  } catch (error) {
    console.error('Error generating user persona:', error)
    return { success: false, persona: null, error: 'Failed to generate persona' }
  }
}

