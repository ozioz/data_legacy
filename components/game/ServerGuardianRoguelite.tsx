'use client'

import { useState, useEffect, useRef } from 'react'
import { Shield, Bug, Zap, Database, AlertTriangle, CreditCard } from 'lucide-react'
import { MASCOTS, GAME_STORIES, GAME_TYPES } from '@/lib/game/constants'
import StoryModal from '@/components/ui/StoryModal'
import { generateUpgradeCards } from '@/app/actions/arcade-actions'
import { supabase } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

interface ServerGuardianRogueliteProps {
  level: any
  onComplete: (xp: number) => void
  onExit: () => void
  playerHero: { id: string; name: string; img: string } | null
}

interface Enemy {
  id: number
  x: number
  hp: number
  maxHp: number
}

interface Tower {
  id: number
  x: number
  cooldown: number
  upgrades: Record<string, number> // Applied upgrade stats
}

interface Projectile {
  id: number
  x: number
  targetId: number
}

interface UpgradeCard {
  id: string
  name: string
  description: string
  stats: Record<string, number>
}

export default function ServerGuardianRoguelite({
  level,
  onComplete,
  onExit,
  playerHero,
}: ServerGuardianRogueliteProps) {
  const [enemies, setEnemies] = useState<Enemy[]>([])
  const [towers, setTowers] = useState<Tower[]>([])
  const [projectiles, setProjectiles] = useState<Projectile[]>([])
  const [energy, setEnergy] = useState(100)
  const [health, setHealth] = useState(3)
  const [wave, setWave] = useState(1)
  const [status, setStatus] = useState<'PLAYING' | 'WON' | 'LOST' | 'UPGRADE_SELECTION'>('PLAYING')
  const [isShaking, setIsShaking] = useState(false)
  const [showDebriefing, setShowDebriefing] = useState(false)
  const [upgradeCards, setUpgradeCards] = useState<UpgradeCard[]>([])
  const [selectedUpgrades, setSelectedUpgrades] = useState<string[]>([])
  const [loadingUpgrades, setLoadingUpgrades] = useState(false)
  const [startTime] = useState(Date.now())

  const gameLoopRef = useRef<number>()
  const lastSpawnRef = useRef(0)

  const WAVES_TO_WIN = level.config.waves || 5
  const SPAWN_RATE = (level.config.spawnRate || 1000) - wave * 50 // Gets faster each wave
  const ENEMY_SPEED = 0.2 + wave * 0.05
  const PROJECTILE_SPEED = 2
  const TOWER_COST = 40
  const TOWER_RANGE = 30
  const TOWER_COOLDOWN = 60

  // Calculate tower stats with upgrades
  const getTowerStats = (tower: Tower) => {
    const baseDamage = 35
    const baseRange = TOWER_RANGE
    const baseCooldown = TOWER_COOLDOWN

    return {
      damage: baseDamage * (1 + (tower.upgrades.damage || 0) / 100),
      range: baseRange * (1 + (tower.upgrades.range || 0) / 100),
      cooldown: Math.max(10, baseCooldown * (1 - (tower.upgrades.attackSpeed || 0) / 100)),
    }
  }

  useEffect(() => {
    if (health < 3) {
      setIsShaking(true)
      const timer = setTimeout(() => setIsShaking(false), 500)
      return () => clearTimeout(timer)
    }
  }, [health])

  // Game loop
  useEffect(() => {
    let frameId: number
    const loop = (time: number) => {
      if (status !== 'PLAYING') return

      if (time - lastSpawnRef.current > SPAWN_RATE) {
        setEnemies((prev) => [
          ...prev,
          { id: Date.now(), x: 0, hp: 100 + wave * 20, maxHp: 100 + wave * 20 },
        ])
        lastSpawnRef.current = time
      }

      setEnemies((prev) => {
        const next: Enemy[] = []
        prev.forEach((e) => {
          const newX = e.x + ENEMY_SPEED
          if (newX >= 95) {
            setHealth((h) => h - 1)
          } else {
            next.push({ ...e, x: newX })
          }
        })
        return next
      })

      setTowers((prev) =>
        prev.map((t) => {
          const stats = getTowerStats(t)
          if (t.cooldown > 0) return { ...t, cooldown: t.cooldown - 1 }

          const target = enemies.find((e) => Math.abs(e.x - t.x) < stats.range)
          if (target) {
            setProjectiles((p) => [...p, { id: Date.now() + Math.random(), x: t.x, targetId: target.id }])
            return { ...t, cooldown: stats.cooldown }
          }
          return t
        })
      )

      setProjectiles((prev) => {
        const next: Projectile[] = []
        prev.forEach((p) => {
          const target = enemies.find((e) => e.id === p.targetId)
          if (target) {
            const tower = towers.find((t) => Math.abs(t.x - p.x) < 5)
            const stats = tower ? getTowerStats(tower) : { damage: 35, range: 30, cooldown: 60 }

            const dir = target.x > p.x ? 1 : -1
            const newX = p.x + PROJECTILE_SPEED * dir

            if (Math.abs(newX - target.x) < 2) {
              setEnemies((es) =>
                es.map((e) => (e.id === target.id ? { ...e, hp: e.hp - stats.damage } : e)).filter((e) => e.hp > 0)
              )
            } else {
              next.push({ ...p, x: newX })
            }
          }
        })
        return next
      })

      frameId = requestAnimationFrame(loop)
    }

    if (status === 'PLAYING') {
      frameId = requestAnimationFrame(loop)
    }
    return () => {
      if (frameId) cancelAnimationFrame(frameId)
    }
  }, [enemies, status, SPAWN_RATE, wave, towers])

  // Wave completion check
  useEffect(() => {
    if (status !== 'PLAYING') return

    // Check if wave is complete (no enemies, time passed)
    const checkWaveComplete = setInterval(() => {
      if (enemies.length === 0 && wave < WAVES_TO_WIN) {
        setStatus('UPGRADE_SELECTION')
        loadUpgradeCards()
      } else if (enemies.length === 0 && wave >= WAVES_TO_WIN) {
        setStatus('WON')
        setShowDebriefing(true)
      }
    }, 1000)

    if (health <= 0) setStatus('LOST')

    return () => clearInterval(checkWaveComplete)
  }, [enemies.length, wave, health, status, WAVES_TO_WIN])

  const loadUpgradeCards = async () => {
    setLoadingUpgrades(true)
    try {
      const cards = await generateUpgradeCards(wave, selectedUpgrades)
      setUpgradeCards(cards)
    } catch (error) {
      console.error('Error loading upgrades:', error)
    } finally {
      setLoadingUpgrades(false)
    }
  }

  const handleUpgradeSelect = (cardId: string) => {
    setSelectedUpgrades([...selectedUpgrades, cardId])
    const card = upgradeCards.find((c) => c.id === cardId)
    if (card) {
      // Apply upgrade to all towers
      setTowers((prev) =>
        prev.map((t) => ({
          ...t,
          upgrades: { ...t.upgrades, ...card.stats },
        }))
      )
    }
    setWave((w) => w + 1)
    setStatus('PLAYING')
    setEnergy(100) // Refill energy between waves
  }

  const placeTower = (x: number) => {
    if (energy >= TOWER_COST && status === 'PLAYING') {
      setTowers([...towers, { id: Date.now(), x, cooldown: 0, upgrades: {} }])
      setEnergy((e) => e - TOWER_COST)
    }
  }

  const handleComplete = async () => {
    const duration = Math.floor((Date.now() - startTime) / 1000)
    const { saveGameSession } = await import('@/app/actions/game-actions')
    await saveGameSession({
      gameType: GAME_TYPES.TOWER,
      levelId: level.id,
      score: health * 100 + (WAVES_TO_WIN - wave) * 50,
      duration,
      won: true,
      xpEarned: level.xpReward,
      gameConfig: {
        waves: wave,
        towersPlaced: towers.length,
        upgrades: selectedUpgrades,
      },
    })
    setShowDebriefing(false)
    onComplete(level.xpReward)
  }

  return (
    <div className="h-screen bg-slate-900 flex flex-col items-center justify-center text-white relative overflow-hidden p-4">
      {/* Upgrade Selection Modal */}
      {status === 'UPGRADE_SELECTION' && (
        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center">
          <div className="bg-slate-800 border-2 border-neon-blue rounded-2xl p-8 max-w-3xl w-full mx-4">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard size={32} className="text-neon-blue" />
              <div>
                <h2 className="text-2xl font-bold text-white">Wave {wave} Complete!</h2>
                <p className="text-gray-400">Choose an upgrade for the next wave</p>
              </div>
            </div>

            {loadingUpgrades ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-neon-blue" size={48} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {upgradeCards.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => handleUpgradeSelect(card.id)}
                    className="bg-slate-700 border-2 border-slate-600 rounded-xl p-6 text-left hover:border-neon-blue hover:bg-slate-600 transition-all group"
                  >
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-neon-blue">
                      {card.name}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">{card.description}</p>
                    <div className="space-y-1">
                      {Object.entries(card.stats).map(([stat, value]) => (
                        <div
                          key={stat}
                          className={`text-sm ${value > 0 ? 'text-green-400' : 'text-red-400'}`}
                        >
                          {value > 0 ? '+' : ''}
                          {value}% {stat}
                        </div>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rest of the game UI (same as original ServerGuardian) */}
      <div className="mb-6 flex flex-col items-center">
        <div className="w-32 h-32 rounded-full border-4 border-neon-blue overflow-hidden bg-slate-800 shadow-[0_0_30px_rgba(0,255,255,0.4)]">
          {playerHero ? (
            <img src={playerHero.img} alt="Player Hero" className="w-full h-full object-cover" />
          ) : (
            MASCOTS.defense && (
              <img src={MASCOTS.defense} alt="Defense Bot" className="w-full h-full object-cover" />
            )
          )}
        </div>
        <h2 className="text-xl font-bold text-neon-blue mt-2">{level.name} (Roguelite)</h2>
        <p className="text-gray-400 text-sm">Wave {wave} / {WAVES_TO_WIN}</p>
      </div>

      <div className="relative w-full max-w-4xl h-[500px] bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-2xl flex flex-col">
        <div className="p-4 bg-slate-800 border-b border-red-500/30 flex justify-between items-center z-20 shadow-md">
          <div>
            <h2 className="font-bold text-xl text-red-400 flex items-center gap-2">
              <Shield size={20} /> SERVER GUARDIAN
            </h2>
            <p className="text-sm text-gray-400">Protect the Database!</p>
          </div>
          <div className="flex items-center gap-6 font-mono font-bold">
            <div className="text-yellow-400 flex items-center gap-1">
              <Zap size={16} /> {energy}
            </div>
            <div className="text-red-400 flex items-center gap-1">
              <AlertTriangle size={16} /> {health} HP
            </div>
            <button
              onClick={onExit}
              className="ml-4 px-3 py-1 bg-neon-blue text-black rounded-full hover:bg-cyan-400 transition-all"
            >
              Back
            </button>
            <div className="text-white text-xl">Wave {wave}</div>
          </div>
        </div>

        <div className="flex-1 relative bg-slate-900 flex items-center justify-center overflow-hidden">
          <div className="w-full max-w-5xl h-32 bg-slate-800 relative border-y-2 border-slate-700 flex items-center">
            {/* Game area - same as original */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 p-4 z-10">
              <div
                className={`w-24 h-24 rounded-full border-4 border-blue-500 overflow-hidden bg-slate-900 shadow-[0_0_20px_rgba(59,130,246,0.5)] ${
                  isShaking ? 'animate-shake border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]' : ''
                }`}
              >
                {MASCOTS.defense && (
                  <img src={MASCOTS.defense} alt="Base" className="w-full h-full object-cover" />
                )}
              </div>
            </div>

            {[10, 20, 30, 40, 50, 60, 70, 80].map((pos) => (
              <div
                key={pos}
                onClick={() => placeTower(pos)}
                className="absolute top-[-60px] w-12 h-12 -ml-6 border-2 border-dashed border-slate-600 rounded-full flex items-center justify-center cursor-pointer hover:border-yellow-400 transition-colors"
                style={{ left: `${pos}%` }}
              >
                {towers.find((t) => t.x === pos) ? (
                  <div className="w-10 h-10 bg-yellow-500 rounded-full shadow-[0_0_15px_rgba(255,215,0,0.5)] flex items-center justify-center">
                    <Zap size={20} className="text-black" />
                  </div>
                ) : (
                  <span className="text-xs text-gray-600">{TOWER_COST}</span>
                )}
              </div>
            ))}

            {enemies.map((e) => (
              <div
                key={e.id}
                className="absolute top-1/2 -translate-y-1/2 -ml-4 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(255,0,0,0.5)] transition-transform"
                style={{ left: `${e.x}%` }}
              >
                <Bug size={16} className="text-black" />
                <div className="absolute -top-3 left-0 w-full h-1 bg-slate-700 rounded">
                  <div className="h-full bg-green-500 rounded" style={{ width: `${(e.hp / e.maxHp) * 100}%` }}></div>
                </div>
              </div>
            ))}

            {projectiles.map((p) => (
              <div
                key={p.id}
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-yellow-300 rounded-full shadow-[0_0_5px_rgba(255,255,0,0.8)]"
                style={{ left: `${p.x}%` }}
              ></div>
            ))}
          </div>
        </div>

        {status === 'LOST' && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[200]">
            <div className="bg-slate-800 p-8 rounded-2xl border-2 border-slate-600 text-center max-w-sm w-full">
              <h2 className="text-3xl font-bold text-red-500 mb-4">SYSTEM BREACHED</h2>
              <p className="text-gray-300 mb-8">Too many bugs reached the database!</p>
              <button
                onClick={onExit}
                className="w-full bg-slate-700 text-white font-bold py-3 rounded-full hover:bg-slate-600"
              >
                RETREAT
              </button>
            </div>
          </div>
        )}
      </div>

      <StoryModal
        isOpen={showDebriefing}
        type="debriefing"
        topic={GAME_STORIES[GAME_TYPES.TOWER]?.topic || 'Mission Complete'}
        story={GAME_STORIES[GAME_TYPES.TOWER]?.impact || 'Mission completed successfully.'}
        mascot={MASCOTS.defense}
        levelName={level.name}
        onClose={() => {
          setShowDebriefing(false)
        }}
        onAction={handleComplete}
        actionLabel="RETURN TO HQ"
      />
    </div>
  )
}

