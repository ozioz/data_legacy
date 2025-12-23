'use server'

import { Chess } from 'chess.js'
import { groq } from '@/lib/groq/client'
import { SMART_MODEL, FAST_MODEL } from '@/lib/groq/models'

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD'

/**
 * Get AI move for Neural Chess
 */
export async function getAIMove(
  fen: string,
  difficulty: Difficulty
): Promise<string | null> {
  try {
    const game = new Chess(fen)
    const moves = game.moves()

    if (moves.length === 0) {
      return null
    }

    if (difficulty === 'EASY') {
      // Random move
      const randomMove = moves[Math.floor(Math.random() * moves.length)]
      return randomMove
    }

    if (difficulty === 'MEDIUM') {
      // Use Groq FAST_MODEL for quick analysis
      const systemPrompt = `You are a chess engine. Given a chess position in FEN notation, return the best move in UCI format (e.g., "e2e4").
      
Return only the move in JSON format:
{
  "move": "e2e4"
}`

      const userPrompt = `Position: ${fen}
Available moves: ${moves.join(', ')}

Return the best move.`

      try {
        const completion = await groq.chat.completions.create({
          model: FAST_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.3,
          max_tokens: 50,
          response_format: { type: 'json_object' },
        })

        const content = completion.choices[0]?.message?.content
        if (content) {
          const parsed = JSON.parse(content) as { move?: string }
          if (parsed.move && moves.includes(parsed.move)) {
            return parsed.move
          }
        }
      } catch (error) {
        console.error('Error getting AI move from Groq:', error)
      }

      // Fallback: Random move
      return moves[Math.floor(Math.random() * moves.length)]
    }

    // HARD: Use SMART_MODEL for deeper analysis
    const systemPrompt = `You are a Grandmaster-level chess engine. Analyze the position and return the best move.

Consider:
- Material balance
- Piece activity
- King safety
- Pawn structure
- Tactical opportunities

Return JSON:
{
  "move": "e2e4",
  "reasoning": "Brief explanation of why this move is best"
}`

    const userPrompt = `Position (FEN): ${fen}
Available moves: ${moves.join(', ')}

Return the best move with reasoning.`

    try {
      const completion = await groq.chat.completions.create({
        model: SMART_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
        max_tokens: 200,
        response_format: { type: 'json_object' },
      })

      const content = completion.choices[0]?.message?.content
      if (content) {
        const parsed = JSON.parse(content) as { move?: string }
        if (parsed.move && moves.includes(parsed.move)) {
          return parsed.move
        }
      }
    } catch (error) {
      console.error('Error getting AI move from Groq:', error)
    }

    // Fallback: Random move
    return moves[Math.floor(Math.random() * moves.length)]
  } catch (error) {
    console.error('Error in getAIMove:', error)
    return null
  }
}

/**
 * Get hint move for Neural Chess (suggests a good move)
 */
export async function getHintMove(
  fen: string,
  difficulty: Difficulty
): Promise<string | null> {
  // Use the same logic as getAIMove but for hints
  return getAIMove(fen, difficulty)
}

/**
 * Analyze board position using Groq AI with Data Engineering metaphors
 */
export async function analyzeBoardPosition(
  fen: string,
  turn: string
): Promise<string> {
  try {
    const game = new Chess(fen)
    
    const systemPrompt = `You are a Data Architecture Grandmaster playing Neural Chess. 

In this game, chess pieces represent data infrastructure components:
- **King** = Production Database (most critical, must be protected)
- **Queen** = LLM Model (most powerful, can move anywhere)
- **Rook** = Firewall (defensive, moves in straight lines)
- **Bishop** = Data Pipeline (moves diagonally, processes data)
- **Knight** = API Gateway (jumps over obstacles, connects services)
- **Pawn** = Raw Data (basic unit, moves forward)

Analyze the current board state (FEN: ${fen}). Current turn: ${turn === 'w' ? 'White (Player)' : 'Black (AI)'}.

Explain the situation using Data Engineering metaphors. Be witty, educational, and concise (2-3 sentences max).

Examples:
- "Your Production DB is exposed without a Firewall! High security risk."
- "The LLM Model is dominating the center, but your Data Pipeline is blocked."
- "Your Raw Data (pawns) are creating a strong defensive structure."

Return JSON:
{
  "analysis": "Your witty analysis using data engineering metaphors",
  "riskLevel": "low" | "medium" | "high",
  "recommendation": "Brief recommendation"
}`

    const userPrompt = `Current Position (FEN): ${fen}
Turn: ${turn === 'w' ? 'White' : 'Black'}
Check: ${game.isCheck() ? 'Yes' : 'No'}
Checkmate: ${game.isCheckmate() ? 'Yes' : 'No'}
Stalemate: ${game.isStalemate() ? 'Yes' : 'No'}
Draw: ${game.isDraw() ? 'Yes' : 'No'}

Provide your analysis.`

    const completion = await groq.chat.completions.create({
      model: SMART_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 300,
      response_format: { type: 'json_object' },
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content returned from Groq')
    }

    const parsed = JSON.parse(content) as {
      analysis: string
      riskLevel?: 'low' | 'medium' | 'high'
      recommendation?: string
    }

    let result = parsed.analysis || 'Position analyzed.'
    
    if (parsed.recommendation) {
      result += `\n\n💡 Recommendation: ${parsed.recommendation}`
    }

    return result
  } catch (error) {
    console.error('Error analyzing board position:', error)
    return 'Failed to analyze position. The Grandmaster is offline.'
  }
}

/**
 * Analyze chess game using Groq AI
 */
export async function analyzeChessGame(
  moveHistory: string[],
  winner: 'WHITE' | 'BLACK' | null,
  playerColor: 'white' | 'black'
): Promise<string> {
  const { SMART_MODEL } = await import('@/lib/groq/models')

  const systemPrompt = `You are a chess Grandmaster analyzing a chess game.

Analyze the game and provide:
1. **Key Moments**: Critical moves that changed the game
2. **Tactical Patterns**: Any tactical themes (forks, pins, skewers, etc.)
3. **Strategic Themes**: Opening, middlegame, endgame strategies
4. **Mistakes**: If any obvious mistakes were made
5. **Strengths**: What was done well

Be educational and concise (3-4 paragraphs). Use chess notation when helpful.

Return JSON:
{
  "analysis": "Your detailed analysis text",
  "keyMoments": ["moment1", "moment2"],
  "tacticalPatterns": ["pattern1", "pattern2"],
  "mistakes": ["mistake1", "mistake2"],
  "strengths": ["strength1", "strength2"]
}`

  // Convert move history to readable format
  const game = new Chess()
  const moves: string[] = []
  
  for (let i = 0; i < moveHistory.length; i++) {
    try {
      game.load(moveHistory[i])
      const moveNumber = Math.floor(i / 2) + 1
      const isWhite = i % 2 === 0
      const lastMove = game.history({ verbose: true }).slice(-1)[0]
      if (lastMove) {
        moves.push(`${moveNumber}.${isWhite ? '' : '..'}${lastMove.san}`)
      }
    } catch (error) {
      // Skip invalid positions
    }
  }

  const userPrompt = `Game Result: ${winner ? (winner === 'WHITE' ? 'White wins' : 'Black wins') : 'Draw/Stalemate'}
Player Color: ${playerColor}

Move History:
${moves.join(' ') || 'No moves recorded'}

Provide your analysis.`

  try {
    const completion = await groq.chat.completions.create({
      model: SMART_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 800,
      response_format: { type: 'json_object' },
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content returned from Groq')
    }

    const parsed = JSON.parse(content) as {
      analysis: string
      keyMoments?: string[]
      tacticalPatterns?: string[]
      mistakes?: string[]
      strengths?: string[]
    }

    let result = parsed.analysis || 'Analysis complete.'

    if (parsed.keyMoments && parsed.keyMoments.length > 0) {
      result += '\n\n**Key Moments:**\n' + parsed.keyMoments.map((m) => `• ${m}`).join('\n')
    }

    if (parsed.tacticalPatterns && parsed.tacticalPatterns.length > 0) {
      result += '\n\n**Tactical Patterns:**\n' + parsed.tacticalPatterns.map((p) => `• ${p}`).join('\n')
    }

    if (parsed.mistakes && parsed.mistakes.length > 0) {
      result += '\n\n**Mistakes to Avoid:**\n' + parsed.mistakes.map((m) => `• ${m}`).join('\n')
    }

    if (parsed.strengths && parsed.strengths.length > 0) {
      result += '\n\n**Strengths:**\n' + parsed.strengths.map((s) => `• ${s}`).join('\n')
    }

    return result
  } catch (error) {
    console.error('Error analyzing chess game:', error)
    return 'Failed to generate analysis. Your game has been recorded for future improvements.'
  }
}

