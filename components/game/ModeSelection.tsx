'use client'

import { GraduationCap, Sparkles, ArrowRight } from 'lucide-react'
import { useGameStore } from '@/lib/store/game-store'

export default function ModeSelection() {
  const { setGameState } = useGameStore()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl px-4">
        {/* Header */}
        <div className="text-center mb-8 md:mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-purple-500 to-pink-500 mb-4 md:mb-6">
            DATA LEGACY 2.0
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-400 mb-2">Choose Your Path</p>
          <p className="text-xs sm:text-sm md:text-base text-gray-500">Start your journey or jump into quick challenges</p>
        </div>

        {/* Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
          {/* Career Mode */}
          <button
            onClick={() => setGameState('HERO_SELECTION')}
            className="group relative bg-slate-800/90 backdrop-blur-xl border-2 border-neon-blue/50 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 hover:border-neon-blue transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl overflow-hidden h-full"
          >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-xl md:rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg mx-auto">
                <GraduationCap size={32} className="md:w-10 md:h-10 lg:w-12 lg:h-12 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 md:mb-4 text-center group-hover:text-neon-blue transition-colors">
                Career Mode
              </h2>
              <p className="text-gray-400 text-sm md:text-base lg:text-lg mb-4 md:mb-6 leading-relaxed flex-grow">
                Deep learning path with arcade games and AI-powered behavioral scenarios. Build your data career from Engineer to Architect.
              </p>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-auto">
                <div className="inline-flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm md:text-base lg:text-lg mx-auto">
                  START JOURNEY <ArrowRight size={18} className="md:w-5 md:h-5" />
                </div>
              </div>
            </div>
          </button>

          {/* Prompt Lab */}
          <a
            href="/arcade"
            className="group relative bg-slate-800/90 backdrop-blur-xl border-2 border-purple-500/50 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 hover:border-purple-400 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl overflow-hidden h-full block"
          >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-xl md:rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg mx-auto">
                <Sparkles size={32} className="md:w-10 md:h-10 lg:w-12 lg:h-12 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 md:mb-4 text-center group-hover:text-purple-400 transition-colors">
                PROMPT LAB
              </h2>
              <p className="text-gray-400 text-sm md:text-base lg:text-lg mb-4 md:mb-6 leading-relaxed flex-grow">
                Quick-play reverse engineering games. Master AI prompts, agent chains, and strategic thinking. No career path required.
              </p>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-auto">
                <div className="inline-flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm md:text-base lg:text-lg mx-auto">
                  ENTER LAB <ArrowRight size={18} className="md:w-5 md:h-5" />
                </div>
              </div>
            </div>
          </a>
        </div>

        {/* Footer Info */}
        <div className="mt-8 md:mt-12 text-center">
          <p className="text-gray-500 text-xs sm:text-sm">
            Both modes save your progress • Switch anytime
          </p>
        </div>
      </div>
    </div>
  )
}

