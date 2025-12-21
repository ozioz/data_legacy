'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Sparkles, Zap, ShoppingCart, Trophy, ArrowLeft } from 'lucide-react'
import VisionaryGame from '@/components/arcade/VisionaryGame'
import AgentHandlerGame from '@/components/arcade/AgentHandlerGame'
import AlgorithmGame from '@/components/arcade/AlgorithmGame'
import CoachGPTGame from '@/components/arcade/CoachGPTGame'
import { GAME_ASSETS } from '@/lib/game/assets'

type ArcadeGame = 'SELECT' | 'VISIONARY' | 'AGENT_HANDLER' | 'ALGORITHM' | 'COACH_GPT'

export default function ArcadePage() {
  const [selectedGame, setSelectedGame] = useState<ArcadeGame>('SELECT')

  const games = [
    {
      id: 'VISIONARY' as ArcadeGame,
      name: 'Visionary',
      description: 'Reverse engineer image generation prompts',
      icon: Sparkles,
      color: 'from-purple-500 to-pink-500',
      gradient: 'from-purple-500/20 to-pink-500/20',
    },
    {
      id: 'AGENT_HANDLER' as ArcadeGame,
      name: 'Agent Handler',
      description: 'Build the correct AI agent tool chain',
      icon: Zap,
      color: 'from-blue-500 to-cyan-500',
      gradient: 'from-blue-500/20 to-cyan-500/20',
    },
    {
      id: 'ALGORITHM' as ArcadeGame,
      name: 'The Algorithm',
      description: 'Guess the user persona from recommendations',
      icon: ShoppingCart,
      color: 'from-green-500 to-emerald-500',
      gradient: 'from-green-500/20 to-emerald-500/20',
    },
    {
      id: 'COACH_GPT' as ArcadeGame,
      name: 'Coach GPT',
      description: 'Write strategic commands to win the match',
      icon: Trophy,
      color: 'from-orange-500 to-red-500',
      gradient: 'from-orange-500/20 to-red-500/20',
    },
  ]

  if (selectedGame !== 'SELECT') {
    const game = games.find((g) => g.id === selectedGame)
    return (
      <div className="min-h-screen bg-slate-900">
        <button
          onClick={() => setSelectedGame('SELECT')}
          className="fixed top-20 left-4 z-[100] px-4 py-2 bg-slate-800/90 backdrop-blur border border-slate-700 rounded-xl hover:bg-slate-700 transition-all text-white flex items-center gap-2 shadow-lg"
        >
          <ArrowLeft size={18} />
          <span className="hidden sm:inline">Back to Arcade</span>
        </button>
        {selectedGame === 'VISIONARY' && <VisionaryGame />}
        {selectedGame === 'AGENT_HANDLER' && <AgentHandlerGame />}
        {selectedGame === 'ALGORITHM' && <AlgorithmGame />}
        {selectedGame === 'COACH_GPT' && <CoachGPTGame />}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl">
        <div className="text-center mb-12">
        <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 mb-4">
          PROMPT LAB
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 mb-2">Reverse Engineer AI Prompts</p>
        <p className="text-sm md:text-base text-gray-500">Quick Play Mode - No Career Required</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {games.map((game) => {
            const Icon = game.icon
            // Map game IDs to asset paths
            const coverImage = 
              game.id === 'VISIONARY' ? GAME_ASSETS.visionary :
              game.id === 'AGENT_HANDLER' ? GAME_ASSETS.agent :
              game.id === 'ALGORITHM' ? GAME_ASSETS.algorithm :
              GAME_ASSETS.coach
            
            return (
              <button
                key={game.id}
                onClick={() => setSelectedGame(game.id)}
                className={`group relative bg-slate-800/80 backdrop-blur-xl border-2 border-slate-700 rounded-2xl overflow-hidden hover:border-opacity-70 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[0_0_40px_rgba(168,85,247,0.3)]`}
                style={{
                  borderColor: game.id === 'VISIONARY' ? 'rgba(168, 85, 247, 0.5)' :
                              game.id === 'AGENT_HANDLER' ? 'rgba(59, 130, 246, 0.5)' :
                              game.id === 'ALGORITHM' ? 'rgba(34, 197, 94, 0.5)' :
                              'rgba(249, 115, 22, 0.5)',
                }}
              >
                {/* Cover Image - Top Half */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                  <Image
                    src={coverImage}
                    alt={`${game.name} cover`}
                    fill
                    className="object-cover"
                    priority
                    onError={(e) => {
                      // Hide image on error, gradient background will show
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                  {/* Fallback gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${game.gradient} opacity-50`}></div>
                  {/* Dark gradient overlay at bottom for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>
                  {/* Icon overlay - always visible as fallback */}
                  <div className={`absolute top-4 right-4 w-12 h-12 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center shadow-lg opacity-90 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <Icon size={24} className="text-white" />
                  </div>
                </div>
                
                {/* Content - Bottom Half */}
                <div className="relative z-10 p-6 bg-slate-800/90">
                  <h2 className="text-3xl font-bold text-white mb-3 group-hover:scale-105 transition-transform">
                    {game.name}
                  </h2>
                  <p className="text-gray-400 text-base mb-4">{game.description}</p>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r ${game.color} text-white font-bold text-sm shadow-lg`}>
                      PLAY NOW →
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="mt-12 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm md:text-base px-4 py-2 rounded-lg hover:bg-slate-800/50"
          >
            <ArrowLeft size={18} />
            Back to Career Mode
          </a>
        </div>
      </div>
    </div>
  )
}
