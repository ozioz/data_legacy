'use client'

import { useGameStore } from '@/lib/store/game-store'
import ModeSelection from '@/components/game/ModeSelection'
import HeroSelection from '@/components/game/HeroSelection'
import PathSelection from '@/components/game/PathSelection'
import CareerMap from '@/components/game/CareerMap'
import PipelinePuzzle from '@/components/game/PipelinePuzzle'
import QueryMaster from '@/components/game/QueryMaster'
import KimballArchitect from '@/components/game/KimballArchitect'
import MetricLab from '@/components/game/MetricLab'
import DashboardCanvas from '@/components/game/DashboardCanvas'
import BehavioralGame from '@/components/game/BehavioralGame'
import StoryModal from '@/components/ui/StoryModal'
import CareerCoachModal from '@/components/ui/CareerCoachModal'
import Leaderboard from '@/components/ui/Leaderboard'
import { Star, Trophy } from 'lucide-react'
import { GAME_TYPES, MASCOTS, LEVELS } from '@/lib/game/constants'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const {
    gameState,
    playerHero,
    selectedPath,
    currentLevel,
    unlockedLevels,
    totalXP,
    showBriefing,
    setGameState,
    setPlayerHero,
    setSelectedPath,
    setCurrentLevel,
    addUnlockedLevel,
    addXP,
    setShowBriefing,
  } = useGameStore()

  const [showCareerCoach, setShowCareerCoach] = useState(false)
  const [lastGameResult, setLastGameResult] = useState<{
    gameType: string
    won: boolean
    score: number
    level: string
  } | null>(null)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  // Check auth and redirect if not logged in
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      
      // Check for guest mode (only on client)
      let isGuestMode = false
      let guestUserId = null
      if (typeof window !== 'undefined') {
        isGuestMode = localStorage.getItem('guest_mode') === 'true'
        guestUserId = localStorage.getItem('guest_user_id')
      }
      
      // If user selected Career Mode but not logged in, enable guest mode automatically
      if (!user && !isGuestMode && gameState === 'HERO_SELECTION') {
        // Auto-enable guest mode for Career Mode exploration
        if (typeof window !== 'undefined') {
          const autoGuestId = `guest_${Date.now()}_${Math.random().toString(36).substring(7)}`
          localStorage.setItem('guest_user_id', autoGuestId)
          localStorage.setItem('guest_mode', 'true')
          setUser({ id: autoGuestId, email: 'Guest', isGuest: true })
        }
        return
      }
      
      // Set guest user if in guest mode
      if (isGuestMode && guestUserId && !user) {
        setUser({ id: guestUserId, email: 'Guest', isGuest: true })
      }

      // Check if user is a guest (only sync real users, not guests)
      const isGuestUser = user && (user as any).isGuest === true
      if (user && !isGuestUser) {
        // Sync user progress from Supabase (only for real users, not guests)
        const { data } = await supabase
          .from('users')
          .select('total_xp, unlocked_levels')
          .eq('id', user.id)
          .single()

        if (data) {
          // Update local store with server data
          // Note: This is a simplified sync - you may want more sophisticated merging
        }
      }
    }
    checkAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      // Only redirect if user is actively playing (not in selection screens)
      if (!session?.user && gameState !== 'MODE_SELECTION' && gameState !== 'HERO_SELECTION' && gameState !== 'PATH_SELECTION' && gameState !== 'CAREER_MAP') {
        // Check if guest mode is enabled
        if (typeof window !== 'undefined') {
          const isGuestMode = localStorage.getItem('guest_mode') === 'true'
          if (!isGuestMode) {
            router.push('/auth')
          }
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [gameState, router])

  const handleHeroSelect = (hero: any) => {
    setPlayerHero(hero.id)
    setGameState('PATH_SELECTION')
  }

  const handlePathSelect = (path: string) => {
    setSelectedPath(path as any)
    setGameState('CAREER_MAP')
  }

  const handleLevelSelect = (level: any) => {
    setCurrentLevel(level)
    if (level.gameType === GAME_TYPES.BEHAVIORAL) {
      setGameState('PLAYING')
    } else {
      setShowBriefing(true)
      setGameState('BRIEFING')
    }
  }

  const handleStartMission = () => {
    setShowBriefing(false)
    setGameState('PLAYING')
  }

  const handleGameComplete = async (xpReward: number, gameResult?: { won: boolean; score: number }) => {
    const xp = Number(xpReward) || 0
    addXP(xp)

    if (!currentLevel) return

    // Show Career Coach modal if game completed
    if (gameResult) {
      setLastGameResult({
        gameType: currentLevel.gameType,
        won: gameResult.won,
        score: gameResult.score,
        level: currentLevel.id,
      })
      setShowCareerCoach(true)
    }

    // Unlock next level logic
    const parts = currentLevel.id.split('_')

    if (currentLevel.id.includes('BEHAVIORAL')) {
      const currentNum = parseInt(parts[parts.length - 1])
      const nextNum = currentNum + 1
      const nextId = `${parts.slice(0, -1).join('_')}_${nextNum}`

      if (LEVELS[nextId as keyof typeof LEVELS] && !unlockedLevels.includes(nextId)) {
        addUnlockedLevel(nextId)
      }
    } else {
      const currentNum = parseInt(parts[1])
      const nextNum = currentNum + 1
      const nextId = `${parts[0]}_${nextNum}`

      if (LEVELS[nextId as keyof typeof LEVELS] && !unlockedLevels.includes(nextId)) {
        addUnlockedLevel(nextId)
      }
    }

    setGameState('CAREER_MAP')
    setCurrentLevel(null)
  }

  const handleHome = () => {
    setGameState('MODE_SELECTION')
    setPlayerHero(null)
    setSelectedPath(null)
    setCurrentLevel(null)
  }

  const renderActiveGame = () => {
    if (!currentLevel) return null

    const hero = playerHero ? LEVELS[`${playerHero}_1` as keyof typeof LEVELS] : null
    const heroData = hero
      ? {
          id: playerHero!,
          name: playerHero === 'ENGINEER' ? 'Data Engineer' : playerHero === 'SCIENTIST' ? 'Data Scientist' : 'BI Analyst',
          img: `/assets/${playerHero === 'ENGINEER' ? 'dataengineer_1' : playerHero === 'SCIENTIST' ? 'data_scientist_1' : 'data_analyst_1'}.png`,
        }
      : null

    const commonProps = {
      level: currentLevel,
      onComplete: handleGameComplete,
      onExit: () => {
        setGameState('CAREER_MAP')
        setCurrentLevel(null)
      },
      playerHero: heroData,
    }

    switch (currentLevel.gameType) {
      case GAME_TYPES.PIPELINE:
        return <PipelinePuzzle {...commonProps} />
      case GAME_TYPES.QUERY:
        return <QueryMaster {...commonProps} />
      case GAME_TYPES.KIMBALL:
        return <KimballArchitect {...commonProps} />
      case GAME_TYPES.METRIC_LAB:
        return <MetricLab {...commonProps} />
      case GAME_TYPES.DASHBOARD:
        return <DashboardCanvas {...commonProps} />
      case GAME_TYPES.BEHAVIORAL:
        return <BehavioralGame {...commonProps} />
      default:
        return (
          <div className="text-white text-center p-10">
            Unknown Game Type: {currentLevel.gameType}
          </div>
        )
    }
  }

  const getMascot = () => {
    if (!currentLevel) return null
    switch (currentLevel.gameType) {
      case GAME_TYPES.PIPELINE:
        return MASCOTS.pipeline
      case GAME_TYPES.QUERY:
        return MASCOTS.query
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-neon-green selection:text-black relative">
      {/* Global HUD */}
      {gameState !== 'MODE_SELECTION' && gameState !== 'HERO_SELECTION' && gameState !== 'PATH_SELECTION' && (
        <div className="fixed top-20 right-4 z-50 flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-3 max-w-[calc(100vw-1rem)] sm:max-w-none">
          <div className="bg-slate-800/95 backdrop-blur-sm border border-neon-blue px-3 py-2 md:px-4 rounded-full flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,255,0.2)] text-xs md:text-sm whitespace-nowrap">
            <Star className="text-yellow-400 fill-yellow-400 w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
            <span className="font-bold font-mono text-neon-blue">{totalXP} XP</span>
          </div>
        </div>
      )}

      {/* Leaderboard - Show on Career Map */}
      {gameState === 'CAREER_MAP' && (
        <div className="absolute bottom-4 right-4 z-40 w-80">
          <Leaderboard />
        </div>
      )}

      {/* Career Coach Modal */}
      {lastGameResult && (
        <CareerCoachModal
          isOpen={showCareerCoach}
          gameType={lastGameResult.gameType}
          won={lastGameResult.won}
          score={lastGameResult.score}
          level={lastGameResult.level}
          onClose={() => {
            setShowCareerCoach(false)
            setLastGameResult(null)
          }}
        />
      )}

      {gameState === 'MODE_SELECTION' && <ModeSelection />}

      {gameState === 'HERO_SELECTION' && <HeroSelection onHeroSelect={handleHeroSelect} isGuest={(user as any)?.isGuest || false} />}

      {gameState === 'PATH_SELECTION' && playerHero && (
        <PathSelection
          hero={{
            id: playerHero,
            name:
              playerHero === 'ENGINEER'
                ? 'Data Engineer'
                : playerHero === 'SCIENTIST'
                  ? 'Data Scientist'
                  : 'BI Analyst',
            img: `/assets/${playerHero === 'ENGINEER' ? 'dataengineer_1' : playerHero === 'SCIENTIST' ? 'data_scientist_1' : 'data_analyst_1'}.png`,
          }}
          onPathSelect={handlePathSelect}
          onBack={() => {
            setGameState('MODE_SELECTION')
            setPlayerHero(null)
          }}
          isGuest={(user as any)?.isGuest || false}
        />
      )}

      {gameState === 'CAREER_MAP' && playerHero && selectedPath && (
        <CareerMap
          hero={{
            id: playerHero,
            name:
              playerHero === 'ENGINEER'
                ? 'Data Engineer'
                : playerHero === 'SCIENTIST'
                  ? 'Data Scientist'
                  : 'BI Analyst',
            img: `/assets/${playerHero === 'ENGINEER' ? 'dataengineer_1' : playerHero === 'SCIENTIST' ? 'data_scientist_1' : 'data_analyst_1'}.png`,
          }}
          path={selectedPath}
          unlockedLevels={unlockedLevels}
          onLevelSelect={handleLevelSelect}
          onHome={handleHome}
          isGuest={(user as any)?.isGuest || false}
        />
      )}

      {gameState === 'PLAYING' && renderActiveGame()}

      {/* Mission Briefing Modal */}
      {gameState === 'BRIEFING' && currentLevel && (
        <StoryModal
          isOpen={showBriefing}
          type="briefing"
          topic={
            currentLevel.gameType === GAME_TYPES.PIPELINE
              ? 'Source Ingestion - ETL Pipelines & Data Lineage'
              : currentLevel.gameType === GAME_TYPES.QUERY
                ? 'Data Modeling - SQL Optimization & Kimball Methodology'
                : 'Project Genesis'
          }
          story={
            currentLevel.gameType === GAME_TYPES.PIPELINE
              ? 'Extract and clean raw data from multiple sources. Build a robust pipeline to ensure data quality for downstream processing.'
              : currentLevel.gameType === GAME_TYPES.QUERY
                ? 'Build dimensional models using Kimball methodology. Create fact and dimension tables that support business reporting needs.'
                : 'Complete the stage to unlock the next phase of Project Genesis.'
          }
          mascot={getMascot() || ''}
          levelName={currentLevel.name}
          onClose={() => {
            setShowBriefing(false)
            setGameState('CAREER_MAP')
            setCurrentLevel(null)
          }}
          onAction={handleStartMission}
          actionLabel="START MISSION"
        />
      )}
    </div>
  )
}

