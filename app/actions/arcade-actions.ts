'use server'

import { groq } from '@/lib/groq/client'
import { FAST_MODEL } from '@/lib/groq/models'
import { createServerClient } from '@/lib/supabase/server'
import type {
  VisionaryLevel,
  VisionaryUserSelections,
  VisionaryValidationResult,
  VisionaryCorrectAttributes,
} from '@/types/visionary'

export interface PromptEvaluationResult {
  score: number // 0-100
  feedback: string
  breakdown?: {
    accuracy: number
    completeness: number
    technicalQuality: number
  }
}

/**
 * Core function: Evaluate user's prompt against target context using Groq AI
 */
export async function evaluatePrompt(
  userPrompt: string,
  targetContext: string,
  gameType: 'VISIONARY' | 'AGENT_HANDLER' | 'ALGORITHM' | 'COACH_GPT',
  metadata?: Record<string, any>
): Promise<PromptEvaluationResult> {
  const systemPrompts = {
    VISIONARY: `You are an expert prompt engineer evaluating image generation prompts. Compare the user's prompt with the target prompt. Rate semantic similarity (0-100%) considering: style, lighting, composition, mood, technical details. Be strict but fair.`,
    AGENT_HANDLER: `You are an AI agent architect. Evaluate if the user's tool sequence would achieve the target outcome. Consider logical flow, dependencies, and completeness. Rate 0-100%.`,
    ALGORITHM: `You are a recommendation system expert. Evaluate if the user's persona description matches the shopping cart items. Consider demographics, preferences, behavior patterns. Rate 1-10, then convert to 0-100%.`,
    COACH_GPT: `You are a sports match simulator. Given the game state and user's strategic command, simulate the outcome. Rate the command's effectiveness 0-100% based on tactical soundness and win probability.`,
  }

  const userPrompts = {
    VISIONARY: `Target Prompt: "${targetContext}"\n\nUser Prompt: "${userPrompt}"\n\nRate similarity 0-100% and provide feedback.`,
    AGENT_HANDLER: `Target Outcome: "${targetContext}"\n\nUser's Tool Sequence: "${userPrompt}"\n\nWould this sequence achieve the outcome? Rate 0-100% and explain.`,
    ALGORITHM: `Shopping Cart Items: ${JSON.stringify(metadata?.items || [])}\n\nUser's Persona: "${userPrompt}"\n\nDoes this persona fit these items? Rate 1-10, then convert to 0-100%.`,
    COACH_GPT: `Game State: ${JSON.stringify(metadata?.gameState || {})}\n\nUser's Strategic Command: "${userPrompt}"\n\nSimulate the outcome. Rate command effectiveness 0-100% and predict win/loss.`,
  }

  try {
    const completion = await groq.chat.completions.create({
      model: FAST_MODEL, // Use FAST_MODEL for speed-critical prompt scoring (needs <200ms response)
      messages: [
        { role: 'system', content: systemPrompts[gameType] },
        { role: 'user', content: userPrompts[gameType] },
      ],
      temperature: 0.3, // Lower temperature for more consistent scoring
      max_tokens: 300,
      response_format: { type: 'json_object' },
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content returned from Groq')
    }

    const parsed = JSON.parse(content) as {
      score: number
      feedback: string
      breakdown?: {
        accuracy: number
        completeness: number
        technicalQuality: number
      }
    }

    // Ensure score is between 0-100
    const score = Math.max(0, Math.min(100, Math.round(parsed.score || 0)))

    return {
      score,
      feedback: parsed.feedback || 'Evaluation complete.',
      breakdown: parsed.breakdown,
    }
  } catch (error) {
    console.error('Error evaluating prompt:', error)
    // Fallback: Simple keyword matching
    const userLower = userPrompt.toLowerCase()
    const targetLower = targetContext.toLowerCase()
    const commonWords = userLower
      .split(' ')
      .filter((word) => word.length > 3 && targetLower.includes(word))
    const similarity = Math.min(100, (commonWords.length / targetLower.split(' ').length) * 100)

    return {
      score: Math.round(similarity),
      feedback: 'Basic similarity check completed. AI evaluation unavailable.',
    }
  }
}

/**
 * Generate dynamic upgrade cards for Tower Defense roguelite mode
 */
export async function generateUpgradeCards(
  currentWave: number,
  existingUpgrades: string[] = []
): Promise<Array<{ id: string; name: string; description: string; stats: Record<string, number> }>> {
  const systemPrompt = `You are a game designer creating upgrade cards for a Tower Defense game. Generate 3 unique upgrade cards with trade-offs. Each card should have:
- A creative name
- A description
- Stats that modify game mechanics (e.g., +10% damage, -5% range, +20% speed, -10% cost)
- Make them interesting with meaningful trade-offs
- Current wave: ${currentWave}
- Avoid duplicates of: ${existingUpgrades.join(', ')}

Return JSON array with: id, name, description, stats (object with numeric values).`

  try {
    const completion = await groq.chat.completions.create({
      model: FAST_MODEL, // Use FAST_MODEL for instant upgrade card generation between waves
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Generate 3 upgrade cards for wave ${currentWave}. Make them balanced and interesting.`,
        },
      ],
      temperature: 0.8,
      max_tokens: 800,
      response_format: { type: 'json_object' },
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content returned')
    }

    const parsed = JSON.parse(content) as {
      cards: Array<{
        id: string
        name: string
        description: string
        stats: Record<string, number>
      }>
    }

    return parsed.cards || getDefaultUpgradeCards(currentWave)
  } catch (error) {
    console.error('Error generating upgrade cards:', error)
    return getDefaultUpgradeCards(currentWave)
  }
}

function getDefaultUpgradeCards(wave: number): Array<{ id: string; name: string; description: string; stats: Record<string, number> }> {
  const defaults: Array<{ id: string; name: string; description: string; stats: Record<string, number> }> = [
    {
      id: `upgrade_${wave}_1`,
      name: 'Overclock',
      description: '+15% Attack Speed, -10% Range',
      stats: { attackSpeed: 15, range: -10 },
    },
    {
      id: `upgrade_${wave}_2`,
      name: 'Fortified Core',
      description: '+20% Health, -5% Movement Speed',
      stats: { health: 20, movementSpeed: -5 },
    },
    {
      id: `upgrade_${wave}_3`,
      name: 'Energy Surge',
      description: '+25% Damage, -15% Energy Regen',
      stats: { damage: 25, energyRegen: -15 },
    },
  ]
  return defaults
}

/**
 * Save prompt battle result
 */
export async function savePromptBattle(
  gameType: string,
  targetContext: string,
  userInput: string,
  aiScore: number,
  aiFeedback: string,
  metadata?: Record<string, any>
) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase.from('prompt_battles').insert({
      user_id: user.id,
      game_type: gameType,
      target_context: targetContext,
      user_input: userInput,
      ai_score: aiScore,
      ai_feedback: aiFeedback,
      metadata: metadata || {},
    } as any)

    if (error) {
      console.error('Error saving prompt battle:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in savePromptBattle:', error)
    return { success: false, error: 'Failed to save battle' }
  }
}

/**
 * Get leaderboard entries
 */
export async function getLeaderboardEntries(
  gameType: string,
  metricType: string = 'score',
  limit: number = 10
) {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('leaderboard_entries')
      .select('*, users(email, chosen_class)')
      .eq('game_type', gameType)
      .eq('metric_type', metricType)
      .order('metric_value', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching leaderboard:', error)
      return { success: false, data: [], error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error in getLeaderboardEntries:', error)
    return { success: false, data: [], error: 'Failed to fetch leaderboard' }
  }
}

/**
 * Get a random Visionary level (without correct_attributes)
 * Automatically syncs with available images in the directory
 */
export async function getVisionaryLevel(
  difficulty?: 'Easy' | 'Medium' | 'Hard'
): Promise<{ success: boolean; level: VisionaryLevel | null; error?: string }> {
  try {
    const supabase = await createServerClient()

    // First, ensure levels are synced with available images
    // This is a lightweight check - only runs if no levels exist
    const { data: existingLevels } = await supabase
      .from('visionary_levels')
      .select('id')
      .limit(1)

    // If no levels exist, try to auto-generate (but don't block if it fails)
    if (!existingLevels || existingLevels.length === 0) {
      try {
        const { autoGenerateVisionaryLevels } = await import('./visionary-actions')
        await autoGenerateVisionaryLevels()
      } catch (syncError) {
        console.warn('Failed to auto-sync levels:', syncError)
        // Continue anyway - maybe levels will be created manually
      }
    }

    // Get list of available images from filesystem
    const { scanVisionaryImages } = await import('./visionary-actions')
    const scanResult = await scanVisionaryImages()
    const availableImages = scanResult.success ? scanResult.images : []

    // Build query
    let query = supabase.from('visionary_levels_public').select('*')

    // Filter by difficulty if provided
    if (difficulty) {
      query = query.eq('difficulty', difficulty)
    }

    // Get all levels
    const { data, error } = await query

    if (error) {
      console.error('Error fetching visionary level:', error)
      return { success: false, level: null, error: error.message }
    }

    if (!data || data.length === 0) {
      return { success: false, level: null, error: 'No levels found. Please add images to /public/assets/visionary/ and run auto-generate.' }
    }

    // Filter to only include levels with images that actually exist
    const validLevels = data.filter((level: VisionaryLevel) => 
      availableImages.includes(level.image_path)
    )

    if (validLevels.length === 0) {
      return { 
        success: false, 
        level: null, 
        error: 'No valid levels found. Please sync levels in admin panel (/admin/visionary) to create levels for existing images.' 
      }
    }

    // Select random level from valid ones
    const randomIndex = Math.floor(Math.random() * validLevels.length)
    const level = validLevels[randomIndex] as VisionaryLevel

    return { success: true, level }
  } catch (error) {
    console.error('Error in getVisionaryLevel:', error)
    return { success: false, level: null, error: 'Failed to fetch level' }
  }
}

/**
 * Validate user's selections against correct attributes
 */
export async function validateVisionaryLevel(
  levelId: string,
  userSelections: VisionaryUserSelections
): Promise<{ success: boolean; result: VisionaryValidationResult | null; error?: string }> {
  try {
    const supabase = await createServerClient()

    // Fetch the level with correct_attributes (only server-side)
    const { data: level, error } = await supabase
      .from('visionary_levels')
      .select('correct_attributes, difficulty')
      .eq('id', levelId)
      .single()

    if (error || !level) {
      console.error('Error fetching level for validation:', error)
      return { success: false, result: null, error: 'Level not found' }
    }

    const correctAttributes = (level as any).correct_attributes as VisionaryCorrectAttributes

    // Validate each attribute
    const subjectCorrect = userSelections.subject === correctAttributes.subject
    const styleCorrect = userSelections.style === correctAttributes.style
    const lightingCorrect = userSelections.lighting === correctAttributes.lighting

    // Calculate score (each correct attribute = 33.33 points, rounded)
    const correctCount = [subjectCorrect, styleCorrect, lightingCorrect].filter(Boolean).length
    const score = Math.round((correctCount / 3) * 100)
    const isCorrect = correctCount === 3

    // Generate feedback
    const feedback = {
      subject: {
        correct: subjectCorrect,
        message: subjectCorrect
          ? '✓ Subject is correct!'
          : `✗ Subject is wrong. Correct: ${correctAttributes.subject}`,
      },
      style: {
        correct: styleCorrect,
        message: styleCorrect
          ? '✓ Style is correct!'
          : `✗ Style is wrong. Correct: ${correctAttributes.style}`,
      },
      lighting: {
        correct: lightingCorrect,
        message: lightingCorrect
          ? '✓ Lighting is correct!'
          : `✗ Lighting is wrong. Correct: ${correctAttributes.lighting}`,
      },
    }

    const result: VisionaryValidationResult = {
      score,
      isCorrect,
      feedback,
      // Only return correct attributes if user got it right
      ...(isCorrect ? { correctAttributes } : {}),
    }

    // Save to prompt_battles for tracking
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      await supabase.from('prompt_battles').insert({
        user_id: user.id,
        game_type: 'VISIONARY',
        target_context: JSON.stringify(correctAttributes),
        user_input: JSON.stringify(userSelections),
        ai_score: score,
        ai_feedback: JSON.stringify(feedback),
        metadata: { levelId, difficulty: (level as any).difficulty },
      } as any)
    }

    return { success: true, result }
  } catch (error) {
    console.error('Error in validateVisionaryLevel:', error)
    return { success: false, result: null, error: 'Failed to validate level' }
  }
}

/**
 * Calculate idle resources for Data Farm
 */
export async function calculateIdleResources(gameType: string) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, resources: 0 }
    }

    const { data, error } = await supabase.rpc('calculate_idle_resources', {
      p_user_id: user.id,
      p_game_type: gameType,
    } as any)

    if (error) {
      console.error('Error calculating idle resources:', error)
      return { success: false, resources: 0 }
    }

    // Update last_active timestamp
    await supabase
      .from('idle_production')
      .upsert({
        user_id: user.id,
        game_type: gameType,
        last_active: new Date().toISOString(),
        accumulated_resources: 0, // Reset after collection
      } as any)

    return { success: true, resources: Math.floor(data || 0) }
  } catch (error) {
    console.error('Error in calculateIdleResources:', error)
    return { success: false, resources: 0 }
  }
}


/**
 * Evaluate dashboard layout using Groq AI
 */
export async function evaluateDashboardLayout(
  widgets: Array<{ type: string; measureId: string | null; dimensionId: string | null }>,
  measures: Array<{ id: string; name: string; formula: string }>,
  dimensions: Array<{ id: string; name: string; type: string }>,
  businessQuestions: Array<{ question: string; recommendedWidget: string[]; requiredMeasure: string; requiredDimension?: string }>
): Promise<{ score: number; feedback: string }> {
  const { SMART_MODEL } = await import('@/lib/groq/models')

  const systemPrompt = `You are a Senior Data Visualization Expert evaluating a business dashboard.

Analyze the dashboard layout and provide:
1. **Readability Score (0-100)**: Based on:
   - Correct widget type for each metric (e.g., Line Chart for time series, not Pie Chart)
   - Appropriate use of dimensions (e.g., Date for trends, Category for comparisons)
   - Visual clarity and best practices
   
2. **Feedback**: Specific recommendations for improvement. Be constructive and educational.

Common issues:
- Pie Chart with 12+ categories = unreadable (use Bar Chart or Line Chart)
- KPI Card with dimension = inappropriate (KPIs should be single values)
- Line Chart for categorical data = suboptimal (use Bar Chart)
- Map without geographic dimension = invalid

Return JSON:
{
  "score": 85,
  "feedback": "Your dashboard is well-structured. However, using a Pie Chart for 12 months of data is unreadable. Consider a Line Chart for time series trends."
}`

  const widgetDescriptions = widgets.map((w) => {
    const measure = measures.find((m) => m.id === w.measureId)
    const dimension = dimensions.find((d) => d.id === w.dimensionId)
    return {
      type: w.type,
      measure: measure?.name || 'None',
      dimension: dimension?.name || 'None',
    }
  })

  const userPrompt = `Dashboard Widgets:
${JSON.stringify(widgetDescriptions, null, 2)}

Business Questions:
${JSON.stringify(businessQuestions.map((q) => ({
  question: q.question,
  recommendedWidgets: q.recommendedWidget,
  requiredMeasure: q.requiredMeasure,
  requiredDimension: q.requiredDimension,
})), null, 2)}

Evaluate this dashboard and provide a readability score with feedback.`

  try {
    const completion = await groq.chat.completions.create({
      model: SMART_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content returned from Groq')
    }

    const parsed = JSON.parse(content) as {
      score: number
      feedback: string
    }

    return {
      score: Math.max(0, Math.min(100, Math.round(parsed.score || 0))),
      feedback: parsed.feedback || 'Dashboard evaluation complete.',
    }
  } catch (error) {
    console.error('Error evaluating dashboard:', error)
    // Fallback scoring
    const hasAllWidgets = widgets.length >= 4
    const allHaveMeasures = widgets.every((w) => w.measureId)
    const baseScore = hasAllWidgets && allHaveMeasures ? 60 : 30

    return {
      score: baseScore,
      feedback: 'Dashboard evaluation completed. AI feedback unavailable.',
    }
  }
}


