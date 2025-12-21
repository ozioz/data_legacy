'use client'

import { useState, useEffect } from 'react'
import { Sprout, Database, CloudRain, ArrowLeft, Clock } from 'lucide-react'
import { MASCOTS, GAME_STORIES, GAME_TYPES } from '@/lib/game/constants'
import StoryModal from '@/components/ui/StoryModal'
import { saveGameSession } from '@/app/actions/game-actions'
import { calculateIdleResources } from '@/app/actions/arcade-actions'
import { supabase } from '@/lib/supabase/client'

interface DataFarmProps {
  level: any
  onComplete: (xp: number) => void
  onExit: () => void
  playerHero: { id: string; name: string; img: string } | null
}

interface Plot {
  id: number
  status: 'EMPTY' | 'GROWING' | 'READY'
  progress: number
}

export default function DataFarm({ level, onComplete, onExit, playerHero }: DataFarmProps) {
  const [plots, setPlots] = useState<Plot[]>(
    Array(16)
      .fill(null)
      .map((_, i) => ({ id: i, status: 'EMPTY' as const, progress: 0 }))
  )
  const [harvested, setHarvested] = useState(0)
  const [status, setStatus] = useState<'PLAYING' | 'WON'>('PLAYING')
  const [showDebriefing, setShowDebriefing] = useState(false)
  const [startTime] = useState(Date.now())
  const [idleResources, setIdleResources] = useState(0)
  const [productionRate, setProductionRate] = useState(1)
  const [lastActive, setLastActive] = useState<Date | null>(null)

  const TARGET = level.config.target || 10

  // Load idle resources on mount
  useEffect(() => {
    const loadIdleResources = async () => {
      try {
        const result = await calculateIdleResources(GAME_TYPES.FARM)
        if (result.success) {
          setIdleResources(result.resources)
          setHarvested((h) => h + result.resources)
        }

        // Get production rate from database
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          const { data } = await supabase
            .from('idle_production')
            .select('production_rate, last_active')
            .eq('user_id', user.id)
            .eq('game_type', GAME_TYPES.FARM)
            .single()

          if (data) {
            const idleData = data as any
            setProductionRate(idleData.production_rate || 1)
            setLastActive(idleData.last_active ? new Date(idleData.last_active) : null)
          }
        }
      } catch (error) {
        console.error('Error loading idle resources:', error)
      }
    }
    loadIdleResources()
  }, [])

  useEffect(() => {
    if (harvested >= TARGET) {
      setStatus('WON')
      setShowDebriefing(true)
    }
  }, [harvested, TARGET])

  useEffect(() => {
    const interval = setInterval(() => {
      setPlots((prev) =>
        prev.map((plot) => {
          if (plot.status === 'GROWING') {
            const newProgress = plot.progress + 10
            if (newProgress >= 100) {
              return { ...plot, status: 'READY' as const, progress: 100 }
            }
            return { ...plot, progress: newProgress }
          }
          return plot
        })
      )
    }, 100)

    return () => clearInterval(interval)
  }, [])

  const handlePlotClick = (index: number) => {
    const plot = plots[index]

    if (plot.status === 'EMPTY') {
      const newPlots = [...plots]
      newPlots[index] = { ...plot, status: 'GROWING' as const, progress: 0 }
      setPlots(newPlots)
    } else if (plot.status === 'READY') {
      const newPlots = [...plots]
      newPlots[index] = { ...plot, status: 'EMPTY' as const, progress: 0 }
      setPlots(newPlots)
      setHarvested((h) => h + 1)
    }
  }

  const handleComplete = async () => {
    const duration = Math.floor((Date.now() - startTime) / 1000)
    
    // Update idle production
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('idle_production').upsert({
        user_id: user.id,
        game_type: GAME_TYPES.FARM,
        last_active: new Date().toISOString(),
        production_rate: productionRate + (harvested / TARGET) * 0.5, // Increase rate based on performance
        accumulated_resources: 0,
      } as any)
    }

    await saveGameSession({
      gameType: GAME_TYPES.FARM,
      levelId: level.id,
      score: harvested,
      duration,
      won: true,
      xpEarned: level.xpReward,
      gameConfig: {
        target: TARGET,
        idleResourcesCollected: idleResources,
        productionRate,
      },
    })
    setShowDebriefing(false)
    onComplete(level.xpReward)
  }

  return (
    <div className="h-screen bg-slate-900 flex flex-col items-center justify-center text-white relative overflow-hidden p-4">
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
            MASCOTS.farm && (
              <img src={MASCOTS.farm} alt="Farmer" className="w-full h-full object-cover" />
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

      <div className="relative w-full max-w-2xl bg-slate-800/50 rounded-xl border border-slate-700 p-6 shadow-2xl backdrop-blur-sm flex flex-col">
        <div className="p-4 bg-slate-800 border-b border-green-500/30 flex justify-between items-center z-20 rounded-t-xl">
          <div>
            <h2 className="font-bold text-xl text-green-400 flex items-center gap-2">
              <Sprout size={20} /> DATA FARM
            </h2>
            <p className="text-sm text-gray-400">Grow and Harvest Data!</p>
          </div>
          <div className="flex items-center gap-6">
            {idleResources > 0 && (
              <div className="bg-green-500/20 border border-green-500/50 px-3 py-1 rounded-lg">
                <div className="text-xs text-green-400 flex items-center gap-1">
                  <Clock size={12} />
                  Idle: +{idleResources}
                </div>
              </div>
            )}
            <div className="font-mono font-bold text-2xl text-green-400 flex items-center gap-2">
              <Database size={24} /> {harvested} / {TARGET} TB
            </div>
            <div className="text-sm text-gray-400">
              Rate: {productionRate.toFixed(1)}/s
            </div>
          </div>
        </div>

        <div className="flex-1 relative bg-slate-900 flex items-center justify-center p-4 rounded-b-xl">
          <div className="grid grid-cols-4 gap-4 max-w-md w-full">
            {plots.map((plot, index) => (
              <div
                key={plot.id}
                onClick={() => handlePlotClick(index)}
                className={`
                  aspect-square rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden
                  ${
                    plot.status === 'EMPTY'
                      ? 'bg-slate-800 border-slate-700 hover:border-green-500/50 hover:bg-slate-700'
                      : plot.status === 'GROWING'
                        ? 'bg-green-900/20 border-green-800'
                        : 'bg-green-500 border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.5)]'
                  }
                `}
              >
                {plot.status === 'EMPTY' && <CloudRain size={32} className="text-gray-600" />}

                {plot.status === 'GROWING' && (
                  <>
                    <Sprout size={32} className="text-green-600 animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-700">
                      <div
                        className="h-full bg-green-500 transition-all duration-100"
                        style={{ width: `${plot.progress}%` }}
                      ></div>
                    </div>
                  </>
                )}

                {plot.status === 'READY' && <Database size={40} className="text-white" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <StoryModal
        isOpen={showDebriefing}
        type="debriefing"
        topic={GAME_STORIES[GAME_TYPES.FARM]?.topic || 'Mission Complete'}
        story={GAME_STORIES[GAME_TYPES.FARM]?.impact || 'Mission completed successfully.'}
        mascot={MASCOTS.farm}
        levelName={level.name}
        onClose={() => {
          setShowDebriefing(false)
        }}
        onAction={handleComplete}
        actionLabel="RETURN TO HQ"
      />

      <div className="p-4 text-center text-gray-500 text-sm">
        Tap Empty to Plant • Wait • Tap Ready to Harvest
      </div>
    </div>
  )
}

