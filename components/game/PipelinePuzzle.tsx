'use client'

import { useState, useEffect } from 'react'
import { ITEMS, MASCOTS, GAME_STORIES, GAME_TYPES } from '@/lib/game/constants'
import { ArrowRight, Play, ArrowLeft } from 'lucide-react'
import StoryModal from '@/components/ui/StoryModal'
import VirtualCTO from '@/components/ui/VirtualCTO'
import { saveGameSession } from '@/app/actions/game-actions'
import { useGameStore } from '@/lib/store/game-store'

interface PipelinePuzzleProps {
  level: any
  onComplete: (xp: number, gameResult?: { won: boolean; score: number }) => void
  onExit: () => void
  playerHero: { id: string; name: string; img: string } | null
}

export default function PipelinePuzzle({
  level,
  onComplete,
  onExit,
  playerHero,
}: PipelinePuzzleProps) {
  const correctSequence = level.config?.sequence || []
  const extraItems = level.config?.extra || []
  const inventory = [...correctSequence, ...extraItems]

  const [slots, setSlots] = useState<(string | null)[]>(Array(correctSequence.length).fill(null))
  const [status, setStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE')
  const [message, setMessage] = useState('')
  const [showBriefing, setShowBriefing] = useState(true) // Start with briefing
  const [showDebriefing, setShowDebriefing] = useState(false)
  const [showSprintReport, setShowSprintReport] = useState(false)
  const [calculatedMetrics, setCalculatedMetrics] = useState<{
    efficiency: number
    budgetEarned: number
    dataQuality: number
    throughput: number
  } | null>(null)
  const [hintCount, setHintCount] = useState(0)
  const [startTime] = useState(Date.now())
  const [throughput, setThroughput] = useState(0) // Items processed per second

  const handleInventoryClick = (itemId: string) => {
    if (status === 'SUCCESS') return
    const emptyIndex = slots.findIndex((s) => s === null)
    if (emptyIndex !== -1) {
      const newSlots = [...slots]
      newSlots[emptyIndex] = itemId
      setSlots(newSlots)
      setStatus('IDLE')
      setMessage('')
    }
  }

  const handleSlotClick = (index: number) => {
    if (status === 'SUCCESS') return
    const newSlots = [...slots]
    newSlots[index] = null
    setSlots(newSlots)
    setStatus('IDLE')
    setMessage('')
  }

  const handleHint = () => {
    if (status === 'SUCCESS') return
    const incorrectIndex = slots.findIndex(
      (itemId, index) => itemId !== correctSequence[index]
    )
    if (incorrectIndex !== -1) {
      const newSlots = [...slots]
      newSlots[incorrectIndex] = correctSequence[incorrectIndex]
      setSlots(newSlots)
      setHintCount((prev) => prev + 1)
      setMessage(`Hint used! XP reduced by 20%. (Total: -${(hintCount + 1) * 20}%)`)
    } else {
      setMessage('All filled slots are correct so far!')
    }
  }

  const handleExecute = () => {
    if (slots.includes(null)) {
      setStatus('ERROR')
      setMessage('Pipeline incomplete! Fill all slots.')
      return
    }
    const isCorrect = slots.every((id, index) => id === correctSequence[index])
    if (isCorrect) {
      setStatus('SUCCESS')
      setMessage('Pipeline Executed Successfully!')
    } else {
      setStatus('ERROR')
      setMessage('Pipeline Failed! Invalid sequence logic.')
    }
  }

  const handleContinue = () => {
    // Calculate metrics for Sprint Report
    if (status === 'SUCCESS') {
      const duration = (Date.now() - startTime) / 1000
      const calculatedThroughput = duration > 0 ? correctSequence.length / duration : 0
      const rawDataQuality = calculateRawDataQuality(calculatedThroughput, hintCount, true)
      const efficiency = Math.min(100, Math.round((calculatedThroughput * 100) / 0.5)) // Normalize to 0-100
      
      setCalculatedMetrics({
        efficiency,
        budgetEarned: 0, // Not used in Project Genesis
        dataQuality: rawDataQuality,
        throughput: calculatedThroughput,
      })
      setShowSprintReport(true)
    }
  }

  const { calculateRawDataQuality, saveStageResult, syncProjectStateToDB } = useGameStore()

  const handleReturnToHQ = async () => {
    const penaltyMultiplier = Math.max(0, 1 - hintCount * 0.2)
    const finalXP = Math.floor(level.xpReward * penaltyMultiplier)
    const duration = Math.floor((Date.now() - startTime) / 1000)
    const calculatedThroughput = duration > 0 ? (correctSequence.length / duration) : 0
    const won = status === 'SUCCESS'
    
    // Calculate Raw Data Quality (Project Genesis - Stage 1)
    const rawDataQuality = won 
      ? calculateRawDataQuality(calculatedThroughput, hintCount, won)
      : 0
    
    // Save stage result (Stage 1: Source Ingestion)
    saveStageResult(1, won ? 100 : 0, won, rawDataQuality)
    await syncProjectStateToDB()
    
    // Save game session with throughput
    await saveGameSession({
      gameType: GAME_TYPES.PIPELINE,
      levelId: level.id,
      score: won ? 100 : 0,
      duration,
      won,
      xpEarned: finalXP,
      gameConfig: {
        hintCount,
        penaltyMultiplier,
        sequence: slots,
        throughput: calculatedThroughput,
        raw_data_quality: rawDataQuality, // Save for analytics
      },
    })

    // Save to leaderboard
    if (won) {
      const { getLeaderboardEntries } = await import('@/app/actions/arcade-actions')
      // Leaderboard will be updated via the game_config
    }

    setShowDebriefing(false)
    onComplete(finalXP, { won, score: won ? 100 : 0 })
  }

  // Calculate throughput in real-time
  useEffect(() => {
    if (status === 'SUCCESS') {
      const duration = (Date.now() - startTime) / 1000
      const calculatedThroughput = duration > 0 ? correctSequence.length / duration : 0
      setThroughput(calculatedThroughput)
    }
  }, [status, startTime, correctSequence.length])

  return (
    <div className="h-screen bg-slate-900 flex flex-col text-white relative">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>

      {/* Narrative Briefing (Slack/Email style) */}
      <StoryModal
        isOpen={showBriefing}
        type="briefing"
        sender="CTO"
        message={`Hey team! 👋\n\nOur data pipeline is a mess right now. We're losing money because we can't process customer data fast enough.\n\n${level.scenario || 'We need you to clean this up ASAP.'}\n\nIf we can get this pipeline running efficiently, we'll have budget left over to invest in better security infrastructure. Think of it as an investment in our future! 💰`}
        impact="Reward: Budget earned from this sprint will be available for Server Defense in the next sprint."
        onClose={() => setShowBriefing(false)}
        onAction={() => setShowBriefing(false)}
        actionLabel="ACCEPT TASK"
      />

      <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
        <div>
          <h2 className="font-bold text-xl text-neon-blue">{level.name}</h2>
          <p className="text-sm text-gray-400">{level.desc}</p>
        </div>
        <div className="flex items-center gap-4">
          {throughput > 0 && (
            <div className="bg-slate-700 px-3 py-1 rounded-lg">
              <div className="text-xs text-gray-400">Throughput</div>
              <div className="text-sm font-bold text-neon-green">{throughput.toFixed(2)} items/s</div>
            </div>
          )}
          <button
            onClick={onExit}
            className="px-3 py-1 bg-neon-blue text-black rounded-full hover:bg-cyan-400 transition-all flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
          {/* Pipeline Slots */}
          <div className="flex flex-wrap justify-center items-center gap-2 mb-8">
            {slots.map((itemId, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  onClick={() => handleSlotClick(index)}
                  className={`w-20 h-20 md:w-24 md:h-24 border-2 rounded-xl flex items-center justify-center cursor-pointer transition-all relative ${
                    itemId
                      ? 'bg-slate-700 border-neon-blue shadow-[0_0_15px_rgba(0,255,255,0.3)]'
                      : 'bg-slate-800/50 border-slate-600 border-dashed hover:border-gray-400'
                  }`}
                >
                  {itemId ? (
                    <div className="text-center p-1 w-full overflow-hidden">
                      <div className="font-bold text-[10px] md:text-xs leading-tight break-words">
                        {ITEMS[itemId as keyof typeof ITEMS]?.name || itemId}
                      </div>
                      <div className="text-[8px] text-gray-400 mt-1 hidden md:block">
                        {ITEMS[itemId as keyof typeof ITEMS]?.type || ''}
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-600 font-mono text-xl">{index + 1}</span>
                  )}
                </div>
                {index < slots.length - 1 && <ArrowRight className="text-gray-600" />}
              </div>
            ))}
          </div>

          {/* Status Message */}
          {message && (
            <div
              className={`px-6 py-3 rounded-full font-bold text-center mb-6 ${
                status === 'SUCCESS'
                  ? 'bg-green-500 text-black'
                  : status === 'ERROR'
                    ? 'bg-red-500 text-white'
                    : 'bg-yellow-500 text-black'
              }`}
            >
              {message}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mb-8">
            {status === 'SUCCESS' && !showDebriefing ? (
              <button
                onClick={handleContinue}
                className="bg-neon-green text-black font-bold py-4 px-12 rounded-full text-xl hover:bg-green-400 shadow-[0_0_20px_rgba(0,255,65,0.5)] animate-pulse"
              >
                CONTINUE (+{Math.floor(level.xpReward * Math.max(0, 1 - hintCount * 0.2))} XP)
              </button>
            ) : (
              status !== 'SUCCESS' && (
                <div className="flex gap-4">
                  <button
                    onClick={handleHint}
                    disabled={false}
                    className="flex items-center gap-2 px-4 py-2 rounded border font-bold transition-all bg-yellow-500/10 border-yellow-500 text-yellow-400 hover:bg-yellow-500/20"
                  >
                    HINT (-20%)
                  </button>
                  <button
                    onClick={handleExecute}
                    className="bg-blue-600 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-blue-500 flex items-center gap-2 shadow-lg hover:shadow-blue-500/50 transition-all"
                  >
                    <Play fill="currentColor" size={20} /> RUN PIPELINE
                  </button>
                </div>
              )
            )}
          </div>

          {/* Available Components */}
          <div className="bg-slate-800 p-4 border-t border-slate-700 rounded-xl">
            <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">
              Available Components
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {inventory.map((itemId, idx) => (
                <button
                  key={`${itemId}-${idx}`}
                  onClick={() => handleInventoryClick(itemId)}
                  className="bg-slate-700 hover:bg-slate-600 p-3 rounded border border-slate-600 hover:border-neon-blue transition-all text-left group h-full"
                >
                  <div className="font-bold text-[10px] md:text-xs text-white truncate group-hover:text-neon-blue">
                    {ITEMS[itemId as keyof typeof ITEMS]?.name || itemId}
                  </div>
                  <div className="text-[8px] text-gray-400">
                    {ITEMS[itemId as keyof typeof ITEMS]?.type || ''}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sprint Report Modal */}
      {calculatedMetrics && (
        <StoryModal
          isOpen={showSprintReport}
          type="sprint-report"
          sprintMetrics={calculatedMetrics}
          onClose={() => {
            setShowSprintReport(false)
          }}
          onAction={handleReturnToHQ}
          actionLabel="DEPLOY TO PRODUCTION"
        />
      )}

      {/* Virtual CTO Companion */}
      <VirtualCTO
        currentStage={1}
        gameContext={{
          gameType: GAME_TYPES.PIPELINE,
          status: status === 'SUCCESS' ? 'SUCCESS' : status === 'ERROR' ? 'ERROR' : 'IDLE',
        }}
      />
    </div>
  )
}

