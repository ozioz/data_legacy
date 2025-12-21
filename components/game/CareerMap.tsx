'use client'

import { LEVELS, CAREER_PATHS } from '@/lib/game/constants'
import { Lock, Play, Check, Star, Trophy, MapPin, Home } from 'lucide-react'

interface CareerMapProps {
  hero: { id: string; name: string; img: string }
  path: string
  unlockedLevels: string[]
  onLevelSelect: (level: any) => void
  onHome: () => void
  isGuest?: boolean
}

export default function CareerMap({
  hero,
  path,
  unlockedLevels,
  onLevelSelect,
  onHome,
  isGuest = false,
}: CareerMapProps) {
  const heroLevels = Object.values(LEVELS)
    .filter((lvl) => {
      const id = lvl.id
      if (!id.startsWith(hero.id)) return false

      if (path === CAREER_PATHS.TECHNICAL) {
        return !id.includes('BEHAVIORAL')
      } else if (path === CAREER_PATHS.BEHAVIORAL) {
        return id.includes('BEHAVIORAL')
      }
      return false
    })
    .sort((a, b) => {
      const aParts = a.id.split('_')
      const bParts = b.id.split('_')
      const numA = parseInt(aParts[aParts.length - 1])
      const numB = parseInt(bParts[bParts.length - 1])
      return numA - numB
    })

  const isMasteryUnlocked = unlockedLevels.includes(`${hero.id}_11`)

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center p-4 relative overflow-hidden pt-20 sm:pt-4">
      <div className="fixed inset-0 grid-bg opacity-10 pointer-events-none z-0"></div>

      {/* Guest Mode Banner */}
      {isGuest && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-yellow-500/20 border border-yellow-500/50 rounded-lg px-4 py-2 backdrop-blur-sm">
          <p className="text-yellow-300 text-sm font-semibold flex items-center gap-2">
            <span>👤</span>
            <span>Demo Mode - Sign in to save your progress</span>
          </p>
        </div>
      )}

      {/* Header */}
      <div className="z-20 w-full max-w-2xl flex justify-between items-center mb-6 md:mb-8 relative px-4 mt-4 sm:mt-0">
        <button
          onClick={onHome}
          className="p-2 rounded-full bg-slate-800 border border-slate-700 hover:bg-slate-700 text-gray-400 hover:text-white transition-all"
        >
          <Home size={24} />
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-3xl md:text-4xl font-bold neon-text">CAREER PATH</h2>
          <div className="flex items-center gap-2 text-gray-400">
            <MapPin size={16} className="text-neon-blue" />
            <span className="uppercase tracking-widest text-sm md:text-base">{hero.name}</span>
            <span className="text-gray-600">•</span>
            <span className="uppercase tracking-widest text-sm md:text-base">
              {path === CAREER_PATHS.TECHNICAL ? 'Technical' : 'Behavioral'}
            </span>
          </div>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="w-full max-w-2xl relative p-4 pb-32 md:pb-40 overflow-y-auto no-scrollbar z-10">
        <div className="flex flex-col items-center gap-16 relative pt-8">
          <div className="absolute top-0 bottom-0 w-1 border-l-2 border-dashed border-slate-700 left-1/2 transform -translate-x-1/2 z-0"></div>

          {heroLevels.map((level, index) => {
            const levelNum = index + 1
            const isUnlocked = unlockedLevels.includes(level.id)
            const isCompleted =
              unlockedLevels.includes(heroLevels[index + 1]?.id) || (index === 9 && isMasteryUnlocked)

            let alignClass = ''
            const mod = index % 4
            if (mod === 0) alignClass = 'self-start md:ml-24'
            if (mod === 1) alignClass = 'self-center'
            if (mod === 2) alignClass = 'self-end md:mr-24'
            if (mod === 3) alignClass = 'self-center'

            return (
              <div
                key={level.id}
                className={`relative z-10 flex flex-col items-center group ${alignClass} transition-all duration-500`}
              >
                <button
                  onClick={() => isUnlocked && onLevelSelect(level)}
                  disabled={!isUnlocked}
                  className={`
                    w-24 h-24 md:w-28 md:h-28 rounded-full border-4 flex items-center justify-center transition-all duration-500 relative
                    ${
                      isCompleted
                        ? 'bg-green-900 border-green-500 text-green-400 shadow-[0_0_30px_rgba(0,255,0,0.4)] scale-105'
                        : isUnlocked
                          ? 'bg-slate-800 border-neon-blue text-white animate-pulse shadow-[0_0_30px_rgba(0,255,255,0.4)] hover:scale-110 hover:rotate-3'
                          : 'bg-slate-800 border-slate-700 text-gray-600 cursor-not-allowed grayscale'
                    }
                  `}
                >
                  {isCompleted ? (
                    <div className="relative">
                      <Check size={40} strokeWidth={3} />
                      <Star size={20} className="absolute -top-3 -right-3 text-yellow-400 fill-yellow-400 animate-spin" />
                    </div>
                  ) : isUnlocked ? (
                    <Play size={40} fill="currentColor" className="ml-1" />
                  ) : (
                    <Lock size={32} />
                  )}

                  <div
                    className={`
                    absolute -top-2 -left-2 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold z-20
                    ${isUnlocked ? 'bg-slate-900 border-white text-white' : 'bg-slate-800 border-gray-600 text-gray-500'}
                  `}
                  >
                    {levelNum}
                  </div>
                </button>

                <div
                  className={`
                  mt-4 text-center p-2 rounded-lg border backdrop-blur-sm transition-all w-40
                  ${
                    isUnlocked
                      ? 'bg-slate-800/90 border-neon-blue shadow-lg transform hover:-translate-y-1'
                      : 'bg-slate-900/50 border-slate-800 opacity-50'
                  }
                `}
                >
                  <h3 className={`font-bold text-xs md:text-sm ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                    {level.name}
                  </h3>
                  {isUnlocked && (
                    <p className="text-[10px] text-neon-blue mt-1 font-mono">XP: {level.xpReward}</p>
                  )}
                </div>
              </div>
            )
          })}

          {/* Mastery Trophy */}
          {isMasteryUnlocked && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in zoom-in duration-700">
              <div className="flex flex-col items-center p-12 bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl border-4 border-yellow-500 shadow-[0_0_100px_rgba(255,215,0,0.5)] text-center max-w-md mx-4">
                <div className="w-40 h-40 bg-yellow-500/20 rounded-full flex items-center justify-center border-4 border-yellow-500 shadow-[0_0_50px_rgba(255,215,0,0.6)] mb-8 animate-bounce">
                  <Trophy size={80} className="text-yellow-400 fill-yellow-400" />
                </div>
                <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600 mb-4 uppercase tracking-widest">
                  Career Mastered!
                </h2>
                <p className="text-gray-300 mb-8 text-lg">
                  You have completed all 10 levels and proven yourself as a Senior {hero.name}.
                </p>
                <button
                  onClick={onHome}
                  className="bg-yellow-500 text-black font-bold py-4 px-12 rounded-full text-xl hover:bg-yellow-400 shadow-lg hover:scale-105 transition-all"
                >
                  RETURN HOME
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

