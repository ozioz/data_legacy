'use client'

import { useState, useEffect } from 'react'
import { Terminal, Check, X, RotateCcw, Lightbulb, ArrowLeft } from 'lucide-react'
import { MASCOTS, GAME_STORIES, GAME_TYPES } from '@/lib/game/constants'
import StoryModal from '@/components/ui/StoryModal'
import VirtualCTO from '@/components/ui/VirtualCTO'
import { saveGameSession } from '@/app/actions/game-actions'

interface QueryMasterProps {
  level: any
  onComplete: (xp: number) => void
  onExit: () => void
  playerHero: { id: string; name: string; img: string } | null
}

export default function QueryMaster({ level, onComplete, onExit, playerHero }: QueryMasterProps) {
  const [targetBlocks, setTargetBlocks] = useState<string[]>([])
  const [availableBlocks, setAvailableBlocks] = useState<string[]>([])
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([])
  const [status, setStatus] = useState<'PLAYING' | 'WON' | 'ERROR'>('PLAYING')
  const [message, setMessage] = useState('')
  const [showDebriefing, setShowDebriefing] = useState(false)
  const [startTime] = useState(Date.now())

  useEffect(() => {
    if (!level?.config) {
      // Default config if not provided
      const defaultTarget = 'SELECT * FROM users WHERE active = true'
      const defaultBlocks = ['SELECT', '*', 'FROM', 'users', 'WHERE', 'active', '=', 'true']
      setTargetBlocks(defaultTarget.split(' '))
      setAvailableBlocks([...defaultBlocks].sort(() => Math.random() - 0.5))
      return
    }

    const target = level.config.target || 'SELECT * FROM users WHERE active = true'
    const blocks = level.config.blocks || target.split(' ')
    
    setTargetBlocks(target.split(' '))
    const shuffled = [...blocks].sort(() => Math.random() - 0.5)
    setAvailableBlocks(shuffled)
  }, [level])

  const handleBlockClick = (block: string, index: number) => {
    if (status === 'WON') return
    const newAvailable = [...availableBlocks]
    newAvailable.splice(index, 1)
    setAvailableBlocks(newAvailable)
    setSelectedBlocks([...selectedBlocks, block])
    setStatus('PLAYING')
    setMessage('')
  }

  const handleSelectedClick = (block: string, index: number) => {
    if (status === 'WON') return
    const newSelected = [...selectedBlocks]
    newSelected.splice(index, 1)
    setSelectedBlocks(newSelected)
    setAvailableBlocks([...availableBlocks, block])
    setStatus('PLAYING')
    setMessage('')
  }

  const handleExecute = () => {
    if (!level?.config?.target) {
      setStatus('ERROR')
      setMessage('Invalid level configuration.')
      return
    }

    const target = level.config.target.replace(/\s+/g, ' ').trim()
    const current = selectedBlocks.join(' ').replace(/\s+/g, ' ').trim()

    if (current === target) {
      setStatus('WON')
      setMessage('Query Executed Successfully!')
      setShowDebriefing(true)
    } else {
      setStatus('ERROR')
      setMessage('Query Failed! Check your syntax.')
    }
  }

  const handleComplete = async () => {
    const duration = Math.floor((Date.now() - startTime) / 1000)
    await saveGameSession({
      gameType: GAME_TYPES.QUERY,
      levelId: level.id,
      score: status === 'WON' ? 100 : 0,
      duration,
      won: status === 'WON',
      xpEarned: level.xpReward,
      gameConfig: {
        target: level?.config?.target || 'N/A',
        attempts: 1, // Could track this
      },
    })
    setShowDebriefing(false)
    onComplete(level.xpReward)
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>

      <div className="mb-6 flex flex-col items-center animate-float">
        <div className="w-32 h-32 rounded-full border-4 border-neon-blue overflow-hidden bg-slate-800 shadow-[0_0_30px_rgba(0,255,255,0.4)]">
          {playerHero ? (
            <img src={playerHero.img} alt="Player Hero" className="w-full h-full object-cover" />
          ) : (
            MASCOTS.query && (
              <img src={MASCOTS.query} alt="Query Bot" className="w-full h-full object-cover" />
            )
          )}
        </div>
        <h2 className="text-xl font-bold text-neon-blue mt-2">{level.name}</h2>
        <p className="text-gray-400 text-sm">{level.desc}</p>
        <button
          onClick={onExit}
          className="mt-4 px-3 py-1 bg-neon-blue text-black rounded-full hover:bg-cyan-400 transition-all flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div className="w-full max-w-3xl min-h-[100px] bg-black rounded-xl border-2 border-slate-700 p-6 flex flex-wrap gap-2 items-center font-mono text-lg shadow-inner relative mb-6">
        {selectedBlocks.length === 0 && (
          <span className="text-gray-600 italic">Select blocks to build query...</span>
        )}
        {selectedBlocks.map((block, index) => (
          <button
            key={`${block}-${index}`}
            onClick={() => handleSelectedClick(block, index)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded shadow transition-all"
          >
            {block}
          </button>
        ))}
        <div className="w-2 h-6 bg-green-500 animate-pulse ml-1"></div>
      </div>

      {message && (
        <div
          className={`px-6 py-3 rounded-full font-bold flex items-center gap-2 animate-bounce mb-6 ${
            status === 'WON'
              ? 'bg-green-500 text-black'
              : status === 'ERROR'
                ? 'bg-red-500 text-white'
                : 'bg-yellow-500 text-black'
          }`}
        >
          {status === 'WON' ? <Check /> : status === 'ERROR' ? <X /> : <Lightbulb size={16} />}
          {message}
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-3 max-w-3xl mb-6">
        {availableBlocks.map((block, index) => (
          <button
            key={`${block}-${index}`}
            onClick={() => handleBlockClick(block, index)}
            className="bg-slate-700 hover:bg-slate-600 border border-slate-500 text-gray-200 px-4 py-2 rounded shadow-lg hover:scale-105 transition-all font-mono"
          >
            {block}
          </button>
        ))}
      </div>

      {status === 'WON' && !showDebriefing ? (
        <button
          onClick={() => setShowDebriefing(true)}
          className="bg-green-500 text-black font-bold py-4 px-12 rounded-full text-xl hover:bg-green-400 shadow-[0_0_20px_rgba(0,255,65,0.5)] animate-pulse"
        >
          CONTINUE (+{level.xpReward} XP)
        </button>
      ) : (
        status !== 'WON' && (
          <div className="flex gap-4">
            <button
              onClick={() => {
                setSelectedBlocks([])
                const blocks = level?.config?.blocks || level?.config?.target?.split(' ') || []
                setAvailableBlocks([...blocks].sort(() => Math.random() - 0.5))
                setStatus('PLAYING')
                setMessage('')
              }}
              className="bg-slate-700 text-white font-bold py-3 px-6 rounded-full hover:bg-slate-600 flex items-center gap-2"
            >
              <RotateCcw size={20} /> RESET
            </button>
            <button
              onClick={handleExecute}
              className="bg-blue-600 text-white font-bold py-3 px-12 rounded-full text-lg hover:bg-blue-500 flex items-center gap-2 shadow-lg hover:shadow-blue-500/50 transition-all"
            >
              <Terminal size={20} /> RUN QUERY
            </button>
          </div>
        )
      )}

      <StoryModal
        isOpen={showDebriefing}
        type="debriefing"
        topic={GAME_STORIES[GAME_TYPES.QUERY]?.topic || 'Mission Complete'}
        story={GAME_STORIES[GAME_TYPES.QUERY]?.impact || 'Mission completed successfully.'}
        mascot={MASCOTS.query}
        levelName={level.name}
        onClose={() => {
          setShowDebriefing(false)
        }}
        onAction={handleComplete}
        actionLabel="RETURN TO HQ"
      />

      {/* Virtual CTO Companion */}
      <VirtualCTO
        currentStage={0}
        gameContext={{
          gameType: GAME_TYPES.QUERY,
          status: status === 'WON' ? 'SUCCESS' : status === 'ERROR' ? 'ERROR' : 'IDLE',
        }}
      />
    </div>
  )
}

