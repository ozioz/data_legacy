'use client'

import Image from 'next/image'
import { HEROES } from '@/lib/game/constants'
import { GAME_ASSETS } from '@/lib/game/assets'
import { User } from 'lucide-react'

interface HeroSelectionProps {
  onHeroSelect: (hero: { id: string; name: string; desc: string; img: string }) => void
  isGuest?: boolean
}

// Map hero IDs to asset keys
const heroAssetMap: Record<string, string> = {
  ENGINEER: GAME_ASSETS.engineer,
  SCIENTIST: GAME_ASSETS.scientist,
  ANALYST: GAME_ASSETS.analyst,
}

export default function HeroSelection({ onHeroSelect, isGuest = false }: HeroSelectionProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-4 relative overflow-hidden">
      <div className="fixed inset-0 grid-bg opacity-20 pointer-events-none z-0"></div>

      {/* Guest Mode Banner */}
      {isGuest && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-yellow-500/20 border border-yellow-500/50 rounded-lg px-4 py-2 backdrop-blur-sm">
          <p className="text-yellow-300 text-sm font-semibold flex items-center gap-2">
            <span>👤</span>
            <span>Demo Mode - Sign in to save your progress</span>
          </p>
        </div>
      )}

      <div className="text-center mb-8 md:mb-12 z-10 relative px-4">
        <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-purple-500 mb-4 animate-pulse">
          DATA LEGACY 2.0
        </h1>
        <p className="text-xl text-gray-400 tracking-widest uppercase">Choose Your Career Path</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl w-full z-10 relative">
        {Object.values(HEROES).map((hero) => {
          const assetPath = heroAssetMap[hero.id] || hero.img
          return (
            <div
              key={hero.id}
              onClick={() => onHeroSelect(hero)}
              className="group relative bg-slate-800/50 border border-slate-700 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:bg-slate-800 hover:border-neon-blue hover:scale-105 hover:shadow-[0_0_30px_rgba(0,255,255,0.2)] flex flex-col items-center"
            >
              <div className="w-32 h-32 md:w-48 md:h-48 mb-6 rounded-full overflow-hidden border-4 border-slate-600 group-hover:border-neon-blue transition-all duration-300 relative bg-slate-900 group-hover:scale-110">
                <Image
                  src={assetPath}
                  alt={hero.name}
                  fill
                  className="object-contain p-2"
                  onError={(e) => {
                    // Fallback to legacy image or icon
                    const target = e.target as HTMLImageElement
                    const parent = target.parentElement
                    if (parent) {
                      target.style.display = 'none'
                      const fallback = parent.querySelector('.hero-fallback') as HTMLElement
                      if (fallback) fallback.style.display = 'flex'
                    }
                  }}
                />
                {/* Fallback to legacy image */}
                <img
                  src={hero.img}
                  alt={hero.name}
                  className="hidden hero-fallback w-full h-full object-cover"
                  onError={(e) => {
                    // If legacy also fails, show icon
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    const parent = target.parentElement
                    if (parent) {
                      const iconFallback = parent.querySelector('.icon-fallback') as HTMLElement
                      if (iconFallback) iconFallback.style.display = 'flex'
                    }
                  }}
                />
                <div className="hidden icon-fallback absolute inset-0 items-center justify-center text-gray-400">
                  <User size={64} />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-neon-blue transition-colors">
                {hero.name}
              </h2>
              <p className="text-gray-400 text-center text-sm leading-relaxed">{hero.desc}</p>

              <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity text-neon-blue font-bold text-sm tracking-wider flex items-center gap-2">
                START CAREER <span className="text-lg">→</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

