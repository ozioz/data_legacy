'use client'

import { useState } from 'react'
import { evaluatePrompt, savePromptBattle } from '@/app/actions/arcade-actions'
import { Loader2, CheckCircle, XCircle, ArrowLeft, ShoppingBag, HelpCircle, Users } from 'lucide-react'
import GameInstructions from '@/components/ui/GameInstructions'

const SAMPLE_CARTS = [
  {
    items: ['Wireless Earbuds', 'Gaming Mouse', 'Mechanical Keyboard', 'RGB Mousepad'],
    persona: 'Tech enthusiast, gamer, early adopter, values performance and aesthetics',
  },
  {
    items: ['Yoga Mat', 'Protein Powder', 'Resistance Bands', 'Water Bottle'],
    persona: 'Fitness-focused individual, health-conscious, active lifestyle',
  },
  {
    items: ['Coffee Beans', 'French Press', 'Mug Set', 'Coffee Grinder'],
    persona: 'Coffee connoisseur, home barista, appreciates quality and craftsmanship',
  },
  {
    items: ['Sketchbook', 'Watercolor Set', 'Brush Collection', 'Art Pencils'],
    persona: 'Creative artist, hobbyist painter, values artistic tools and materials',
  },
]

export default function AlgorithmGame() {
  const [currentCart, setCurrentCart] = useState(SAMPLE_CARTS[0])
  const [userPersona, setUserPersona] = useState('')
  const [score, setScore] = useState<number | null>(null)
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)

  const handleSubmit = async () => {
    if (!userPersona.trim()) return

    setLoading(true)

    try {
      const result = await evaluatePrompt(
        userPersona,
        currentCart.persona,
        'ALGORITHM',
        { items: currentCart.items }
      )

      setScore(result.score)
      setFeedback(result.feedback)

      await savePromptBattle(
        'ALGORITHM',
        currentCart.persona,
        userPersona,
        result.score,
        result.feedback,
        { items: currentCart.items }
      )
    } catch (error) {
      console.error('Error evaluating persona:', error)
      setFeedback('Error evaluating persona. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    const nextIndex = (SAMPLE_CARTS.indexOf(currentCart) + 1) % SAMPLE_CARTS.length
    setCurrentCart(SAMPLE_CARTS[nextIndex])
    setUserPersona('')
    setScore(null)
    setFeedback('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900/20 to-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 w-full max-w-5xl mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.5)]">
              <ShoppingBag size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 mb-1">
                The Algorithm
              </h1>
              <p className="text-gray-400 text-sm md:text-base">Guess the user persona from shopping recommendations</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowInstructions(true)}
              className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-green-500 transition-all group"
              title="How to play"
            >
              <HelpCircle size={20} className="text-gray-400 group-hover:text-green-400" />
            </button>
            <a
              href="/arcade"
              className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-green-500 transition-all flex items-center gap-2 text-gray-300 hover:text-white"
            >
              <ArrowLeft size={18} />
              <span className="hidden sm:inline">Back</span>
            </a>
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-5xl space-y-6">
        {/* Shopping Cart Card */}
        <div className="bg-slate-800/90 backdrop-blur-xl border-2 border-green-500/50 rounded-2xl p-6 md:p-8 shadow-[0_0_30px_rgba(34,197,94,0.2)] hover:border-green-400/70 transition-all">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 border border-green-500/50 flex items-center justify-center">
              <ShoppingBag size={24} className="text-green-400" />
            </div>
            <div>
              <div className="text-xs text-green-400 uppercase tracking-wider font-bold">Recommended Shopping Cart</div>
              <div className="text-sm text-gray-500">What the algorithm recommended</div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {currentCart.items.map((item, index) => (
              <div
                key={index}
                className="bg-slate-900/50 border-2 border-slate-700 rounded-xl p-4 text-center text-white hover:border-green-500/50 transition-all group"
              >
                <div className="text-sm font-semibold group-hover:text-green-400 transition-colors">{item}</div>
              </div>
            ))}
          </div>
        </div>

        {/* User Input Card */}
        <div className="bg-slate-800/90 backdrop-blur-xl border-2 border-slate-700 rounded-2xl p-6 md:p-8 shadow-xl">
          <label className="block text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">
            What User Persona would generate these recommendations?
          </label>
          <textarea
            value={userPersona}
            onChange={(e) => setUserPersona(e.target.value)}
            placeholder="Describe the user persona: demographics, interests, lifestyle, preferences... (e.g., 'Tech-savvy gamer, 25-35 years old, values performance and aesthetics')"
            className="w-full h-32 md:h-40 px-4 py-3 bg-slate-900 border-2 border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 resize-none transition-all"
          />
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Tip: Include demographics, interests, lifestyle, and behavior patterns
            </p>
            <button
              onClick={handleSubmit}
              disabled={loading || !userPersona.trim()}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-green-500/50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span className="hidden sm:inline">Analyzing...</span>
                </>
              ) : (
                <>
                  <Users size={20} />
                  <span>Evaluate Persona</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Card */}
        {score !== null && (
          <div
            className={`bg-slate-800/90 backdrop-blur-xl border-2 rounded-2xl p-6 md:p-8 shadow-xl animate-fadeIn ${
              score >= 80
                ? 'border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.3)]'
                : score >= 60
                  ? 'border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.3)]'
                  : 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.3)]'
            }`}
          >
            <div className="flex items-center gap-4 mb-6">
              {score >= 80 ? (
                <CheckCircle size={56} className="text-green-400 flex-shrink-0" />
              ) : (
                <XCircle size={56} className={score >= 60 ? 'text-yellow-400 flex-shrink-0' : 'text-red-400 flex-shrink-0'} />
              )}
              <div>
                <div className="text-4xl font-bold text-white mb-1">Score: {score}%</div>
                <div className="text-sm text-gray-400">
                  {score >= 80 ? 'Perfect match! 🎉' : score >= 60 ? 'Good guess! 👍' : 'Try again! 💪'}
                </div>
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
              <div className="text-sm text-gray-400 mb-2 uppercase tracking-wider font-bold">AI Feedback</div>
              <p className="text-gray-200 leading-relaxed">{feedback}</p>
            </div>
            <div className="mt-4 p-4 bg-slate-900/30 rounded-lg border border-slate-700">
              <div className="text-xs text-gray-500 mb-1">Target Persona:</div>
              <div className="text-sm text-gray-400">{currentCart.persona}</div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleNext}
            className="flex-1 bg-slate-700 text-white font-bold py-4 rounded-xl hover:bg-slate-600 transition-all shadow-lg"
          >
            Next Cart
          </button>
          <a
            href="/arcade"
            className="flex-1 bg-slate-800 border-2 border-slate-700 text-white font-bold py-4 rounded-xl hover:border-green-500 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft size={20} />
            Back to Arcade
          </a>
        </div>
      </div>

      {/* Instructions Modal */}
      <GameInstructions
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
        title="How to Play The Algorithm"
        icon={<ShoppingBag size={32} className="text-green-400" />}
      >
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white mb-2">🎯 Objective</h3>
            <p>Guess the user persona that would receive these shopping recommendations.</p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-2">📝 How to Play</h3>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>Look at the shopping cart items carefully</li>
              <li>Think about what type of person would buy these items together</li>
              <li>Write a detailed persona description including:
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-gray-400">
                  <li>Demographics (age, gender, location)</li>
                  <li>Interests and hobbies</li>
                  <li>Lifestyle and values</li>
                  <li>Behavior patterns</li>
                </ul>
              </li>
              <li>Click "Evaluate Persona" to get your score</li>
              <li>Aim for 80%+ to master the game!</li>
            </ol>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-2">💡 Tips</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Look for patterns in the items (e.g., all tech items = tech enthusiast)</li>
              <li>Consider price range and quality level</li>
              <li>Think about use cases and lifestyle</li>
            </ul>
          </div>
        </div>
      </GameInstructions>
    </div>
  )
}
