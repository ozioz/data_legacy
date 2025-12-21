'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Grid3x3, TrendingDown } from 'lucide-react'
import MatrixGame from '@/components/core/MatrixGame'
import GradientGame from '@/components/core/GradientGame'
import { GAME_ASSETS } from '@/lib/game/assets'

type GameMode = 'menu' | 'matrix' | 'gradient'

export default function CorePage() {
  const router = useRouter()
  const [gameMode, setGameMode] = useState<GameMode>('menu')

  if (gameMode === 'matrix') {
    return (
      <div className="min-h-screen relative p-8">
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.1),transparent_70%)]"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <button
            onClick={() => setGameMode('menu')}
            className="mb-6 flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-cyan-400 rounded-lg transition-all border border-cyan-500/30"
          >
            <ArrowLeft size={20} />
            Back to Menu
          </button>
          <MatrixGame onComplete={() => setGameMode('menu')} />
        </div>
      </div>
    )
  }

  if (gameMode === 'gradient') {
    return (
      <div className="min-h-screen relative p-8">
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1),transparent_70%)]"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <button
            onClick={() => setGameMode('menu')}
            className="mb-6 flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg transition-all border border-purple-500/30"
          >
            <ArrowLeft size={20} />
            Back to Menu
          </button>
          <GradientGame onComplete={() => setGameMode('menu')} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative p-8">
      {/* Background with Tron-style grid */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.1),transparent_70%)]"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <button
            onClick={() => router.push('/')}
            className="mb-6 flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-800/70 text-gray-300 rounded-lg transition-all border border-gray-700"
          >
            <ArrowLeft size={20} />
            Back to Home
          </button>
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 mb-4">
            THE CORE
          </h1>
          <p className="text-xl text-gray-400">Math & Algorithms Training Ground</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="h-1 w-16 bg-cyan-400"></div>
            <div className="h-1 w-16 bg-blue-400"></div>
            <div className="h-1 w-16 bg-purple-400"></div>
          </div>
        </div>

        {/* Game Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Matrix Architecture Game */}
          <div
            onClick={() => setGameMode('matrix')}
            className="group relative bg-gray-900/50 backdrop-blur border-2 border-cyan-500/30 rounded-lg p-8 cursor-pointer hover:border-cyan-500 transition-all hover:shadow-[0_0_30px_rgba(0,255,255,0.3)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-cyan-500/20 rounded-lg border border-cyan-500/50">
                  <Grid3x3 className="w-8 h-8 text-cyan-400" />
                </div>
                <h2 className="text-3xl font-bold text-white">Matrix Architecture</h2>
              </div>
              <p className="text-gray-400 mb-4">
                Connect neural network layers by matching matrix dimensions. Master the art of matrix multiplication
                through interactive drag-and-drop puzzles.
              </p>
              <div className="flex items-center gap-2 text-cyan-400 text-sm">
                <span className="px-3 py-1 bg-cyan-500/20 rounded-full border border-cyan-500/30">Linear Algebra</span>
                <span className="px-3 py-1 bg-cyan-500/20 rounded-full border border-cyan-500/30">Neural Networks</span>
              </div>
            </div>
            <div className="absolute top-4 right-4 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
              →
            </div>
          </div>

          {/* Gradient Descent Game */}
          <div
            onClick={() => setGameMode('gradient')}
            className="group relative bg-gray-900/50 backdrop-blur border-2 border-purple-500/30 rounded-lg p-8 cursor-pointer hover:border-purple-500 transition-all hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-purple-500/20 rounded-lg border border-purple-500/50">
                  <TrendingDown className="w-8 h-8 text-purple-400" />
                </div>
                <h2 className="text-3xl font-bold text-white">Gradient Descent</h2>
              </div>
              <p className="text-gray-400 mb-4">
                Optimize the learning rate to find the global minimum. Watch the ball roll down the loss function curve
                and learn the fundamentals of optimization algorithms.
              </p>
              <div className="flex items-center gap-2 text-purple-400 text-sm">
                <span className="px-3 py-1 bg-purple-500/20 rounded-full border border-purple-500/30">Optimization</span>
                <span className="px-3 py-1 bg-purple-500/20 rounded-full border border-purple-500/30">ML Training</span>
              </div>
            </div>
            <div className="absolute top-4 right-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
              →
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-gray-900/30 backdrop-blur border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
            About The Core
          </h3>
          <p className="text-gray-400 leading-relaxed">
            The Core is an educational game mode focused on mathematical and algorithmic concepts essential for data
            science and machine learning. Master matrix operations, understand optimization algorithms, and build
            intuition through interactive visualizations.
          </p>
        </div>
      </div>
    </div>
  )
}

