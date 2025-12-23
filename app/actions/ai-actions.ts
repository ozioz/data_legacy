'use server'

import { groq } from '@/lib/groq/client'
import { SMART_MODEL } from '@/lib/groq/models'
import { createServerClient } from '@/lib/supabase/server'
import type { ProjectState } from '@/lib/store/game-store'

export interface ScenarioResponse {
  scenario: string
  choices: Array<{
    text: string
    score: number
    feedback: string
  }>
  correctChoice: number
  context: string
}

/**
 * Generate a dynamic RPG scenario using Groq AI
 */
export async function generateScenario(
  userClass: 'ENGINEER' | 'SCIENTIST' | 'ANALYST',
  level: number
): Promise<ScenarioResponse> {
  const systemPrompt = `You are a Dungeon Master for a Data Career RPG. The user is a ${userClass} at Level ${level}. Generate a challenging workplace conflict scenario (Stakeholder management, Ethics, or Crisis) with 3 distinct choices (Bad, Neutral, Professional). Return ONLY valid JSON format with this exact structure:
{
  "scenario": "A detailed workplace scenario description",
  "choices": [
    {"text": "Bad choice description", "score": 0, "feedback": "Why this is bad"},
    {"text": "Neutral/suboptimal choice", "score": 50, "feedback": "Why this is okay but not ideal"},
    {"text": "Professional/best choice", "score": 100, "feedback": "Why this is excellent"}
  ],
  "correctChoice": 2,
  "context": "Brief context about the scenario type (Stakeholder/Ethics/Crisis)"
}`

  try {
    const completion = await groq.chat.completions.create({
      model: SMART_MODEL, // Use SMART_MODEL for complex ethical scenarios requiring nuanced reasoning
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Generate a ${userClass} scenario for level ${level}. Make it realistic and educational.`,
        },
      ],
      temperature: 0.8,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content returned from Groq')
    }

    const parsed = JSON.parse(content) as ScenarioResponse

    // Validate structure
    if (!parsed.scenario || !parsed.choices || parsed.choices.length !== 3) {
      throw new Error('Invalid scenario structure from AI')
    }

    return parsed
  } catch (error) {
    console.error('Error generating scenario:', error)
    // Fallback to a default scenario
    return {
      scenario: `As a ${userClass}, you face a challenging situation at level ${level}. How do you respond?`,
      choices: [
        {
          text: 'React impulsively without considering consequences',
          score: 0,
          feedback: 'This approach often leads to negative outcomes in professional settings.',
        },
        {
          text: 'Take a neutral approach',
          score: 50,
          feedback: 'A safe choice, but not the most effective.',
        },
        {
          text: 'Apply professional best practices and communicate clearly',
          score: 100,
          feedback: 'Excellent! This demonstrates strong professional judgment.',
        },
      ],
      correctChoice: 2,
      context: 'Professional Scenario',
    }
  }
}

/**
 * Generate AI feedback for a game session (Career Coach)
 */
export async function generateCareerCoachFeedback(
  gameType: string,
  won: boolean,
  score: number,
  level: string,
  gameLogs?: Record<string, any>
): Promise<string> {
  const systemPrompt = `You are an AI Career Coach for a Data Career game. Analyze the player's performance and provide encouraging, educational feedback that links game mechanics to real-world data career concepts. Be concise (2-3 sentences) and motivational.`

  const userPrompt = won
    ? `The player just WON the ${gameType} game at ${level} with a score of ${score}. Generate a congratulatory message that connects their victory to real-world data career skills.`
    : `The player just LOST the ${gameType} game at ${level} with a score of ${score}. Generate constructive feedback with specific tips on what they could improve, linking it to real-world data career concepts.`

  try {
    const completion = await groq.chat.completions.create({
      model: SMART_MODEL, // Use SMART_MODEL for professional, analytical career coaching feedback
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 200,
    })

    return completion.choices[0]?.message?.content || 'Great effort! Keep practicing to improve your data skills.'
  } catch (error) {
    console.error('Error generating career coach feedback:', error)
    return won
      ? `Excellent work! Your success in ${gameType} demonstrates strong data skills.`
      : `Keep practicing! Focus on the fundamentals to improve your ${gameType} performance.`
  }
}

/**
 * Generate consequence text for a behavioral choice
 */
export async function generateChoiceConsequence(
  scenario: string,
  choiceText: string,
  score: number
): Promise<{ immediateConsequence: string; realWorldImpact: string }> {
  const systemPrompt = `You are a Dungeon Master. Generate a brief consequence description (1-2 sentences) and a real-world impact statement (1 sentence) for a player's choice in a data career RPG scenario.`

  const userPrompt = `Scenario: ${scenario}\n\nPlayer chose: ${choiceText}\n\nScore: ${score}/100\n\nGenerate the immediate consequence and real-world impact.`

  try {
    const completion = await groq.chat.completions.create({
      model: SMART_MODEL, // Use SMART_MODEL for consequence generation requiring context understanding
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 300,
      response_format: { type: 'json_object' },
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content returned')
    }

    const parsed = JSON.parse(content) as {
      immediateConsequence: string
      realWorldImpact: string
    }

    return parsed
  } catch (error) {
    console.error('Error generating consequence:', error)
    return {
      immediateConsequence: score >= 100 ? 'Your choice had a positive outcome.' : score >= 50 ? 'Your choice was acceptable but could be improved.' : 'Your choice led to negative consequences.',
      realWorldImpact: score >= 100 ? 'This demonstrates strong professional judgment in real-world scenarios.' : 'Consider the long-term implications of your decisions.',
    }
  }
}

export interface AptitudeMetrics {
  coding_speed: number | null
  analytical_thinking: number | null
  crisis_management: number | null
  suggested_role: string | null
  ai_observation: string | null
}

/**
 * Analyze user's career path based on gameplay metrics (Phase 2: Adaptive AI Coach)
 * This is the "Shadow Observer" that watches user performance and suggests career pivots
 */
export async function analyzeCareerPath(userId: string): Promise<{
  success: boolean
  metrics?: AptitudeMetrics
  error?: string
}> {
  try {
    const supabase = await createServerClient()

    // Fetch last 5 game sessions for this user
    const { data: sessions, error: sessionsError } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)

    if (sessionsError) {
      console.error('Error fetching game sessions:', sessionsError)
      return { success: false, error: 'Failed to fetch game sessions' }
    }

    if (!sessions || sessions.length === 0) {
      return {
        success: true,
        metrics: {
          coding_speed: null,
          analytical_thinking: null,
          crisis_management: null,
          suggested_role: null,
          ai_observation: 'Not enough gameplay data yet. Complete a few games to get personalized career insights!',
        },
      }
    }

    // Get user's chosen class
    const { data: userData } = await supabase.from('users').select('chosen_class').eq('id', userId).single()
    const currentPath = (userData as any)?.chosen_class || 'ENGINEER'

    // Aggregate stats from sessions
    const typedSessions = sessions as Array<{
      duration?: number | null
      score?: number | null
      won?: boolean
      game_type?: string
    }>
    
    const stats = {
      totalSessions: typedSessions.length,
      avgDuration: typedSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / typedSessions.length,
      avgScore: typedSessions.reduce((sum, s) => sum + (s.score || 0), 0) / typedSessions.length,
      winRate: (typedSessions.filter((s) => s.won).length / typedSessions.length) * 100,
      gameTypes: typedSessions.map((s) => s.game_type || ''),
      pipelineGames: typedSessions.filter((s) => s.game_type === 'PIPELINE' || s.game_type === 'QUERY').length,
      puzzleGames: typedSessions.filter((s) => s.game_type === 'RUNNER' || s.game_type === 'FARM').length,
      crisisGames: typedSessions.filter((s) => s.game_type === 'TOWER' || s.game_type === 'BEHAVIORAL').length,
    }

    // Calculate metrics (0-100 scale)
    // Coding Speed: Based on PIPELINE/QUERY games - faster completion = higher score
    const codingSpeedGames = typedSessions.filter((s) => s.game_type === 'PIPELINE' || s.game_type === 'QUERY')
    const codingSpeed =
      codingSpeedGames.length > 0
        ? Math.min(
            100,
            Math.max(
              0,
              Math.round(
                100 - ((codingSpeedGames.reduce((sum, s) => sum + (s.duration || 300), 0) / codingSpeedGames.length) /
                  300) *
                  100
              )
            )
          )
        : null

    // Analytical Thinking: Based on puzzle/logic games - higher accuracy = higher score
    const analyticalGames = typedSessions.filter((s) => s.game_type === 'RUNNER' || s.game_type === 'FARM')
    const analyticalThinking =
      analyticalGames.length > 0
        ? Math.round(
            (analyticalGames.reduce((sum, s) => sum + (s.score || 0), 0) / analyticalGames.length / 100) * 100
          )
        : null

    // Crisis Management: Based on tower defense/behavioral - win rate and performance
    const crisisGames = typedSessions.filter((s) => s.game_type === 'TOWER' || s.game_type === 'BEHAVIORAL')
    const crisisManagement =
      crisisGames.length > 0
        ? Math.round(
            ((crisisGames.filter((s) => s.won).length / crisisGames.length) * 100 +
              crisisGames.reduce((sum, s) => sum + (s.score || 0), 0) / crisisGames.length / 100) /
              2
          )
        : null

    // Prepare data for AI analysis
    const systemPrompt = `You are a senior career mentor watching a junior data professional's gameplay metrics. Analyze their performance patterns and suggest career alignment.

Rules:
- High accuracy + Low speed = Research/Scientist material (analytical, methodical)
- High speed + High throughput = Engineering material (execution-focused, fast)
- Good crisis handling = Leadership material (calm under pressure)
- Suggest a pivot if their current chosen path doesn't match their natural strengths

Return JSON with:
{
  "suggested_role": "Data Engineer" | "Data Scientist" | "BI Analyst" | "Analytics Engineer",
  "ai_observation": "A personalized 2-3 sentence observation about their strengths and potential career fit"
}`

    const userPrompt = `Current Path: ${currentPath}
Game Sessions Analyzed: ${stats.totalSessions}
Average Duration: ${Math.round(stats.avgDuration)}s
Average Score: ${Math.round(stats.avgScore)}
Win Rate: ${Math.round(stats.winRate)}%
Coding Speed Metric: ${codingSpeed !== null ? codingSpeed : 'N/A'}
Analytical Thinking Metric: ${analyticalThinking !== null ? analyticalThinking : 'N/A'}
Crisis Management Metric: ${crisisManagement !== null ? crisisManagement : 'N/A'}

Game Types Played: ${stats.gameTypes.join(', ')}

Analyze these metrics and provide career guidance.`

    // Call Groq AI
    const completion = await groq.chat.completions.create({
      model: SMART_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 300,
      response_format: { type: 'json_object' },
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content returned from Groq')
    }

    const aiResponse = JSON.parse(content) as {
      suggested_role: string
      ai_observation: string
    }

    // Save to database
    const { error: insertError } = await (supabase as any).from('user_aptitude_metrics').insert({
      user_id: userId,
      coding_speed: codingSpeed,
      analytical_thinking: analyticalThinking,
      crisis_management: crisisManagement,
      suggested_role: aiResponse.suggested_role,
      ai_observation: aiResponse.ai_observation,
    })

    if (insertError) {
      console.error('Error saving aptitude metrics:', insertError)
    }

    return {
      success: true,
      metrics: {
        coding_speed: codingSpeed,
        analytical_thinking: analyticalThinking,
        crisis_management: crisisManagement,
        suggested_role: aiResponse.suggested_role,
        ai_observation: aiResponse.ai_observation,
      },
    }
  } catch (error) {
    console.error('Error analyzing career path:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze career path',
    }
  }
}

/**
 * Get latest aptitude metrics for a user
 */
export async function getLatestAptitudeMetrics(userId: string): Promise<{
  success: boolean
  metrics?: AptitudeMetrics | null
  error?: string
}> {
  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from('user_aptitude_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        return { success: true, metrics: null }
      }
      console.error('Error fetching aptitude metrics:', error)
      return { success: false, error: error.message }
    }

    return {
      success: true,
      metrics: {
        coding_speed: (data as any).coding_speed,
        analytical_thinking: (data as any).analytical_thinking,
        crisis_management: (data as any).crisis_management,
        suggested_role: (data as any).suggested_role,
        ai_observation: (data as any).ai_observation,
      },
    }
  } catch (error) {
    console.error('Error getting aptitude metrics:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch metrics',
    }
  }
}

/**
 * Get CTO hint based on current project state and game context
 */
export async function getCTOHint(
  projectState: ProjectState,
  currentStage: number,
  gameContext?: {
    gameType?: string
    status?: string
    score?: number
    metricValue?: number
  }
): Promise<string> {
  const systemPrompt = `You are a Senior CTO providing technical guidance to a data professional working on Project Genesis.

Analyze the current project state and provide a SPECIFIC, ACTIONABLE hint. Be concise (2-3 sentences max), technical, and educational.

Current Project State:
- Stage 1 (Source Ingestion): ${projectState.raw_data_quality}% data quality
- Stage 2 (Data Modeling): ${projectState.model_integrity}% model integrity
- Stage 3 (Semantic Layer): ${projectState.semantic_layer_score}% semantic layer score
- Stage 4 (Reporting): ${projectState.business_value}% business value
- Current Stage: ${currentStage}
- Stages Completed: ${projectState.stages_completed.join(', ') || 'None'}

Game Context: ${gameContext ? JSON.stringify(gameContext) : 'No specific game context'}

Provide a hint that:
1. Addresses the current stage's challenge
2. References specific technical concepts (ETL, Star Schema, measures, visualizations)
3. Gives actionable advice without spoiling the solution
4. Uses a professional but encouraging tone

Return ONLY the hint text, no JSON formatting.`

  try {
    const completion = await groq.chat.completions.create({
      model: SMART_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `I need a hint for Stage ${currentStage}. What should I focus on?`,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    })

    const hint = completion.choices[0]?.message?.content?.trim()
    return hint || "Focus on the fundamentals. Review the game instructions and think about best practices."
  } catch (error) {
    console.error('Error getting CTO hint:', error)
    
    // Fallback hints based on stage
    const fallbackHints: Record<number, string> = {
      1: "Remember: ETL pipelines follow Extract → Transform → Load. Check the order of your components!",
      2: "Star Schema: One Fact table connects to multiple Dimension tables. Avoid Fact-to-Fact relationships!",
      3: "Measures need aggregation functions. SUM for totals, COUNT for counts, AVERAGE for averages.",
      4: "Choose the right chart: Line charts for trends over time, Bar charts for categories, KPI cards for single values.",
    }
    
    return fallbackHints[currentStage] || "Review the game instructions and think about best practices for this stage."
  }
}
