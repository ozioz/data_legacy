'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react'
import { generateScenario, generateChoiceConsequence } from '@/app/actions/ai-actions'
import { saveBehavioralChoice, saveGameSession } from '@/app/actions/game-actions'
import VirtualCTO from '@/components/ui/VirtualCTO'
import { GAME_TYPES } from '@/lib/game/constants'

interface BehavioralGameProps {
  level: any
  onComplete: (xp: number) => void
  onExit: () => void
  playerHero: { id: string; name: string; img: string } | null
}

type GameState = 'LOADING' | 'PLAYING' | 'WON' | 'LOST'

export default function BehavioralGame({
  level,
  onComplete,
  onExit,
  playerHero,
}: BehavioralGameProps) {
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [gameState, setGameState] = useState<GameState>('LOADING')
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiScenario, setAiScenario] = useState<any>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)

  // Determine user class and level number from level ID
  const getUserClass = (): 'ENGINEER' | 'SCIENTIST' | 'ANALYST' => {
    if (level.id.includes('ENGINEER')) return 'ENGINEER'
    if (level.id.includes('SCIENTIST')) return 'SCIENTIST'
    return 'ANALYST'
  }

  const getLevelNumber = (): number => {
    const parts = level.id.split('_')
    return parseInt(parts[parts.length - 1]) || 1
  }

  // Load AI-generated scenario on mount
  useEffect(() => {
    const loadScenario = async () => {
      setIsGenerating(true)
      try {
        // Check if level has hardcoded config (for backward compatibility)
        if (level.config?.scenario && level.config?.choices) {
          setAiScenario({
            scenario: level.config.scenario,
            choices: level.config.choices,
            correctChoice: level.config.correctChoice || 2,
            context: 'Hardcoded Scenario',
          })
          setGameState('PLAYING')
        } else {
          // Generate AI scenario
          const userClass = getUserClass()
          const levelNum = getLevelNumber()
          const scenario = await generateScenario(userClass, levelNum)
          setAiScenario(scenario)
          setGameState('PLAYING')
        }
      } catch (error) {
        console.error('Error loading scenario:', error)
        // Fallback to hardcoded if available
        if (level.config?.scenario) {
          setAiScenario({
            scenario: level.config.scenario,
            choices: level.config.choices || [],
            correctChoice: level.config.correctChoice || 2,
            context: 'Fallback Scenario',
          })
          setGameState('PLAYING')
        }
      } finally {
        setIsGenerating(false)
      }
    }

    loadScenario()
  }, [level])

  const handleChoiceSelect = async (choiceIndex: number) => {
    if (showFeedback || !aiScenario) return

    setSelectedChoice(choiceIndex)
    setShowFeedback(true)
    setIsGenerating(true)

    const choice = aiScenario.choices[choiceIndex]
    const isCorrect = choiceIndex === aiScenario.correctChoice

    try {
      // Generate AI feedback for the choice
      const consequence = await generateChoiceConsequence(
        aiScenario.scenario,
        choice.text,
        choice.score
      )

      // Save behavioral choice to Supabase
      if (sessionId) {
        await saveBehavioralChoice(
          sessionId,
          aiScenario.scenario,
          choiceIndex,
          choice.text,
          consequence.realWorldImpact || choice.feedback,
          choice.score
        )
      }

      // Determine game state
      if (isCorrect) {
        setGameState('WON')
      } else if (choice.score === 0) {
        setGameState('LOST')
      } else {
        // Partial score
        setTimeout(() => {
          setGameState('WON')
        }, 2000)
      }
    } catch (error) {
      console.error('Error processing choice:', error)
      // Fallback to original feedback
      if (isCorrect) {
        setGameState('WON')
      } else if (choice.score === 0) {
        setGameState('LOST')
      } else {
        setGameState('WON')
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handleContinue = async () => {
    if (gameState === 'WON') {
      // Save game session
      try {
        const result = await saveGameSession({
          gameType: 'BEHAVIORAL',
          levelId: level.id,
          score: aiScenario?.choices[selectedChoice!]?.score || 0,
          won: true,
          xpEarned: level.xpReward,
          gameConfig: {
            scenario: aiScenario?.scenario,
            choiceIndex: selectedChoice,
          },
        })
        if (result.success && result.sessionId) {
          setSessionId(result.sessionId)
        }
      } catch (error) {
        console.error('Error saving session:', error)
      }

      onComplete(level.xpReward)
    } else {
      // Retry on loss
      setSelectedChoice(null)
      setShowFeedback(false)
      setGameState('PLAYING')
    }
  }

  if (gameState === 'LOADING' || !aiScenario) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
        <Loader2 className="animate-spin text-neon-blue" size={48} />
        <p className="mt-4 text-gray-400">AI is generating your scenario...</p>
      </div>
    )
  }

  const scenario = aiScenario.scenario
  const choices = aiScenario.choices
  const correctChoice = aiScenario.correctChoice

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4 relative">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>

      {/* Back Button */}
      <button
        onClick={onExit}
        className="fixed top-16 sm:top-4 left-4 z-30 px-3 py-1 bg-neon-blue/90 backdrop-blur text-black rounded-full hover:bg-cyan-400 transition-all flex items-center gap-2 shadow-lg"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Header */}
      <div className="mb-8 mt-16 sm:mt-8 text-center animate-fadeIn">
        <h2 className="text-3xl font-bold text-neon-blue mb-2">{level.name}</h2>
        <p className="text-gray-400 text-lg">{level.desc}</p>
      </div>

      {/* Scenario Card */}
      <div className="w-full max-w-4xl mb-8 animate-fadeIn">
        <div className="bg-slate-800/90 border-2 border-slate-700 rounded-2xl p-8 shadow-[0_0_30px_rgba(0,255,255,0.1)]">
          <div className="flex items-center gap-3 mb-6 text-neon-blue">
            <div className="w-16 h-16 rounded-full border-2 border-neon-blue overflow-hidden bg-slate-900 flex items-center justify-center">
              {playerHero ? (
                <img src={playerHero.img} alt="Player Hero" className="w-full h-full object-cover" />
              ) : (
                <AlertCircle size={32} className="text-neon-blue" />
              )}
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-gray-500">SITUATION</div>
              <div className="text-sm text-gray-400">Professional Scenario</div>
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
            <p className="text-xl leading-relaxed text-gray-200">{scenario}</p>
          </div>
        </div>
      </div>

      {/* Choices */}
      {!showFeedback && (
        <div className="w-full max-w-4xl space-y-4 animate-fadeIn">
          <h3 className="text-xl font-bold text-center mb-4 text-neon-blue">What do you do?</h3>
          {choices.map((choice: any, index: number) => (
            <button
              key={index}
              onClick={() => handleChoiceSelect(index)}
              className="w-full bg-slate-800/90 border-2 border-slate-700 rounded-xl p-6 text-left hover:border-neon-blue hover:bg-slate-800 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center flex-shrink-0 group-hover:border-neon-blue transition-colors">
                  <span className="text-sm font-bold text-gray-400 group-hover:text-neon-blue">
                    {String.fromCharCode(65 + index)}
                  </span>
                </div>
                <p className="text-lg text-gray-200 flex-1">{choice.text}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Feedback */}
      {showFeedback && selectedChoice !== null && (
        <div className="w-full max-w-4xl animate-fadeIn">
          {isGenerating ? (
            <div className="bg-slate-800/90 border-2 border-neon-blue rounded-2xl p-8 flex items-center justify-center">
              <Loader2 className="animate-spin text-neon-blue" size={32} />
              <p className="ml-4 text-gray-400">AI is analyzing your choice...</p>
            </div>
          ) : (
            <div
              className={`bg-slate-800/90 border-2 rounded-2xl p-8 ${
                gameState === 'WON' && selectedChoice === correctChoice
                  ? 'border-green-500 shadow-[0_0_30px_rgba(0,255,65,0.3)]'
                  : gameState === 'LOST'
                    ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]'
                    : 'border-yellow-500 shadow-[0_0_30px_rgba(255,215,0,0.3)]'
              }`}
            >
              <div className="flex items-center gap-4 mb-6">
                {gameState === 'WON' && selectedChoice === correctChoice ? (
                  <>
                    <CheckCircle size={48} className="text-green-400" />
                    <div>
                      <h3 className="text-2xl font-bold text-green-400">Excellent Choice!</h3>
                      <p className="text-gray-400">You demonstrated professional leadership.</p>
                    </div>
                  </>
                ) : gameState === 'LOST' ? (
                  <>
                    <XCircle size={48} className="text-red-400" />
                    <div>
                      <h3 className="text-2xl font-bold text-red-400">Poor Decision</h3>
                      <p className="text-gray-400">This choice had negative consequences.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle size={48} className="text-yellow-400" />
                    <div>
                      <h3 className="text-2xl font-bold text-yellow-400">Partially Correct</h3>
                      <p className="text-gray-400">Good instinct, but not the best approach.</p>
                    </div>
                  </>
                )}
              </div>

              <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
                <p className="text-lg leading-relaxed text-gray-200">
                  {choices[selectedChoice]?.feedback}
                </p>
              </div>

              <div className="mt-6 flex justify-center">
                {gameState === 'WON' ? (
                  <button
                    onClick={handleContinue}
                    className="px-8 py-3 bg-green-500 text-black font-bold rounded-full text-lg hover:bg-green-400 transition-all shadow-[0_0_20px_rgba(0,255,65,0.5)]"
                  >
                    CONTINUE (+{level.xpReward} XP)
                  </button>
                ) : (
                  <button
                    onClick={handleContinue}
                    className="px-8 py-3 bg-slate-700 text-white font-bold rounded-full text-lg hover:bg-slate-600 transition-all"
                  >
                    TRY AGAIN
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Virtual CTO Companion */}
      <VirtualCTO
        currentStage={0}
        gameContext={{
          gameType: GAME_TYPES.BEHAVIORAL,
          status: gameState === 'WON' ? 'SUCCESS' : gameState === 'LOST' ? 'ERROR' : 'IDLE',
        }}
      />
    </div>
  )
}

