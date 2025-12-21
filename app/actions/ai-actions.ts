'use server'

import { groq } from '@/lib/groq/client'
import { SMART_MODEL } from '@/lib/groq/models'

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

