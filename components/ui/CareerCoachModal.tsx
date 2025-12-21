'use client'

import { X, Sparkles, Loader2 } from 'lucide-react'
import { getCareerCoachFeedback } from '@/app/actions/game-actions'
import { useState, useEffect } from 'react'

interface CareerCoachModalProps {
  isOpen: boolean
  gameType: string
  won: boolean
  score: number
  level: string
  gameLogs?: Record<string, any>
  onClose: () => void
}

export default function CareerCoachModal({
  isOpen,
  gameType,
  won,
  score,
  level,
  gameLogs,
  onClose,
}: CareerCoachModalProps) {
  const [feedback, setFeedback] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      setLoading(true)
      getCareerCoachFeedback(gameType, won, score, level, gameLogs)
        .then((fb) => {
          setFeedback(fb)
          setLoading(false)
        })
        .catch((error) => {
          console.error('Error getting feedback:', error)
          setFeedback(
            won
              ? `Great job completing ${gameType}! Keep practicing to improve your skills.`
              : `Keep trying! Practice makes perfect in ${gameType}.`
          )
          setLoading(false)
        })
    }
  }, [isOpen, gameType, won, score, level, gameLogs])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-900/95 border-2 border-neon-green rounded-2xl p-8 shadow-[0_0_50px_rgba(0,255,65,0.3)]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-neon-green/20 border-2 border-neon-green flex items-center justify-center">
            <Sparkles className="text-neon-green" size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-neon-green">AI Career Coach</h2>
            <p className="text-gray-400 text-sm">Personalized feedback for your performance</p>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 min-h-[150px]">
          {loading ? (
            <div className="flex items-center justify-center gap-3 text-gray-400">
              <Loader2 className="animate-spin text-neon-green" size={24} />
              <span>AI is analyzing your performance...</span>
            </div>
          ) : (
            <p className="text-gray-200 leading-relaxed text-lg">{feedback}</p>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-neon-green text-black font-bold rounded-full hover:bg-green-400 transition-all"
          >
            GOT IT
          </button>
        </div>
      </div>
    </div>
  )
}

