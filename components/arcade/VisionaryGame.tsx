'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { getVisionaryLevel, validateVisionaryLevel } from '@/app/actions/arcade-actions'
import type {
  VisionaryLevel,
  VisionaryUserSelections,
  VisionaryValidationResult,
} from '@/types/visionary'
import { Loader2, CheckCircle, XCircle, ArrowLeft, Sparkles, HelpCircle, Image as ImageIcon } from 'lucide-react'
import GameInstructions from '@/components/ui/GameInstructions'

export default function VisionaryGame() {
  const [currentLevel, setCurrentLevel] = useState<VisionaryLevel | null>(null)
  const [userSelections, setUserSelections] = useState<VisionaryUserSelections>({
    subject: null,
    style: null,
    lighting: null,
  })
  const [validationResult, setValidationResult] = useState<VisionaryValidationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingLevel, setLoadingLevel] = useState(true)
  const [showInstructions, setShowInstructions] = useState(false)
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | null>(null)

  // Load initial level
  useEffect(() => {
    loadLevel()
  }, [])

  const loadLevel = async (selectedDifficulty?: 'Easy' | 'Medium' | 'Hard') => {
    setLoadingLevel(true)
    setValidationResult(null)
    setUserSelections({ subject: null, style: null, lighting: null })

    try {
      const result = await getVisionaryLevel(selectedDifficulty || undefined)
      if (result.success && result.level) {
        setCurrentLevel(result.level)
        setDifficulty(result.level.difficulty)
      } else {
        console.error('Failed to load level:', result.error)
      }
    } catch (error) {
      console.error('Error loading level:', error)
    } finally {
      setLoadingLevel(false)
    }
  }

  const handleSelection = (category: 'subject' | 'style' | 'lighting', value: string) => {
    setUserSelections((prev) => ({
      ...prev,
      [category]: prev[category] === value ? null : value,
    }))
    // Clear validation result when user changes selection
    if (validationResult) {
      setValidationResult(null)
    }
  }

  const handleValidate = async () => {
    if (!currentLevel || !userSelections.subject || !userSelections.style || !userSelections.lighting) {
      return
    }

    setLoading(true)
    try {
      const result = await validateVisionaryLevel(currentLevel.id, userSelections)
      if (result.success && result.result) {
        setValidationResult(result.result)
      } else {
        console.error('Validation failed:', result.error)
      }
    } catch (error) {
      console.error('Error validating level:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    loadLevel(difficulty || undefined)
  }

  const allSelected = userSelections.subject && userSelections.style && userSelections.lighting

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 w-full max-w-5xl mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.5)]">
              <Sparkles size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-1">
                Visionary
              </h1>
              <p className="text-gray-400 text-sm md:text-base">Reverse engineer image generation prompts</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowInstructions(true)}
              className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-purple-500 transition-all group"
              title="How to play"
            >
              <HelpCircle size={20} className="text-gray-400 group-hover:text-purple-400" />
            </button>
            <a
              href="/arcade"
              className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-purple-500 transition-all flex items-center gap-2 text-gray-300 hover:text-white"
            >
              <ArrowLeft size={18} />
              <span className="hidden sm:inline">Back</span>
            </a>
          </div>
        </div>

        {/* Difficulty Selector */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Select Difficulty</label>
              <div className="flex gap-2">
                {(['Easy', 'Medium', 'Hard'] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => {
                      setDifficulty(diff)
                      loadLevel(diff)
                    }}
                    disabled={loadingLevel}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      difficulty === diff
                        ? 'bg-purple-500 text-white border-2 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)]'
                        : 'bg-slate-700 text-gray-300 border-2 border-slate-600 hover:border-purple-500/50'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {diff}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setDifficulty(null)
                    loadLevel()
                  }}
                  disabled={loadingLevel}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    difficulty === null
                      ? 'bg-purple-500 text-white border-2 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)]'
                      : 'bg-slate-700 text-gray-300 border-2 border-slate-600 hover:border-purple-500/50'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Random
                </button>
              </div>
            </div>
            {difficulty && (
              <div className="text-right">
                <p className="text-xs text-gray-400 mb-1">Current Difficulty</p>
                <p className="text-lg font-bold text-purple-400">{difficulty}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {loadingLevel ? (
        <div className="relative z-10 w-full max-w-5xl flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-purple-400" size={48} />
            <p className="text-gray-400">Loading level...</p>
          </div>
        </div>
      ) : currentLevel ? (
        <div className="relative z-10 w-full max-w-5xl space-y-6">
          {/* Image Display */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentLevel.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="bg-slate-800/90 backdrop-blur-xl border-2 border-purple-500/50 rounded-2xl p-6 md:p-8 shadow-[0_0_30px_rgba(168,85,247,0.2)] hover:border-purple-400/70 transition-all overflow-hidden"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/50 flex items-center justify-center">
                  <ImageIcon size={24} className="text-purple-400" />
                </div>
                <div>
                  <div className="text-xs text-purple-400 uppercase tracking-wider font-bold">Generated Image</div>
                  <div className="text-sm text-gray-500">
                    Difficulty: <span className="text-purple-400 font-semibold">{currentLevel.difficulty}</span>
                  </div>
                </div>
              </div>
              <div className="relative w-full h-64 md:h-96 bg-slate-900/50 rounded-xl overflow-hidden border border-slate-700">
                <Image
                  src={currentLevel.image_path}
                  alt="Visionary challenge image"
                  fill
                  className="object-contain"
                  onError={(e) => {
                    // Fallback if image doesn't exist
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    const parent = target.parentElement
                    if (parent) {
                      const placeholder = document.createElement('div')
                      placeholder.className =
                        'absolute inset-0 flex items-center justify-center text-gray-500 text-center p-4'
                      placeholder.innerHTML = `
                        <div>
                          <p class="text-lg font-semibold mb-2">Image Placeholder</p>
                          <p class="text-sm">Image path: ${currentLevel.image_path}</p>
                          <p class="text-xs mt-2 text-gray-400">Add this image to /public${currentLevel.image_path}</p>
                        </div>
                      `
                      parent.appendChild(placeholder)
                    }
                  }}
                />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Prompt Builder UI */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800/90 backdrop-blur-xl border-2 border-slate-700 rounded-2xl p-6 md:p-8 shadow-xl"
          >
            <label className="block text-sm font-bold text-gray-400 mb-6 uppercase tracking-wider">
              Build Your Prompt
            </label>

            <div className="space-y-6">
              {/* Subject Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">Subject</label>
                <div className="flex flex-wrap gap-3">
                  {currentLevel.options.subjects.map((subject) => {
                    const isSelected = userSelections.subject === subject
                    return (
                      <button
                        key={subject}
                        onClick={() => handleSelection('subject', subject)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          isSelected
                            ? 'bg-purple-500 text-white border-2 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)]'
                            : 'bg-slate-700 text-gray-300 border-2 border-slate-600 hover:border-purple-500/50'
                        }`}
                      >
                        {subject}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Style Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">Style</label>
                <div className="flex flex-wrap gap-3">
                  {currentLevel.options.styles.map((style) => {
                    const isSelected = userSelections.style === style
                    return (
                      <button
                        key={style}
                        onClick={() => handleSelection('style', style)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          isSelected
                            ? 'bg-purple-500 text-white border-2 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)]'
                            : 'bg-slate-700 text-gray-300 border-2 border-slate-600 hover:border-purple-500/50'
                        }`}
                      >
                        {style}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Lighting Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">Lighting</label>
                <div className="flex flex-wrap gap-3">
                  {currentLevel.options.lightings.map((lighting) => {
                    const isSelected = userSelections.lighting === lighting
                    return (
                      <button
                        key={lighting}
                        onClick={() => handleSelection('lighting', lighting)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          isSelected
                            ? 'bg-purple-500 text-white border-2 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)]'
                            : 'bg-slate-700 text-gray-300 border-2 border-slate-600 hover:border-purple-500/50'
                        }`}
                      >
                        {lighting}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                {allSelected
                  ? 'All attributes selected! Ready to evaluate.'
                  : 'Select one option from each category'}
              </p>
              <button
                onClick={handleValidate}
                disabled={loading || !allSelected}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-purple-500/50"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span className="hidden sm:inline">Validating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    <span>Evaluate Prompt</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* Results Card */}
          <AnimatePresence>
            {validationResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`bg-slate-800/90 backdrop-blur-xl border-2 rounded-2xl p-6 md:p-8 shadow-xl ${
                  validationResult.isCorrect
                    ? 'border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.3)]'
                    : validationResult.score >= 66
                      ? 'border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.3)]'
                      : 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.3)]'
                }`}
              >
                <div className="flex items-center gap-4 mb-6">
                  {validationResult.isCorrect ? (
                    <CheckCircle size={56} className="text-green-400 flex-shrink-0" />
                  ) : (
                    <XCircle
                      size={56}
                      className={
                        validationResult.score >= 66 ? 'text-yellow-400 flex-shrink-0' : 'text-red-400 flex-shrink-0'
                      }
                    />
                  )}
                  <div>
                    <div className="text-4xl font-bold text-white mb-1">Score: {validationResult.score}%</div>
                    <div className="text-sm text-gray-400">
                      {validationResult.isCorrect
                        ? 'Perfect! 🎉 All attributes correct!'
                        : validationResult.score >= 66
                          ? 'Good attempt! 👍'
                          : 'Keep trying! 💪'}
                    </div>
                  </div>
                </div>

                {/* Feedback Breakdown */}
                <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700 space-y-4">
                  <div className="text-sm text-gray-400 mb-3 uppercase tracking-wider font-bold">Feedback</div>
                  <div className="space-y-3">
                    <div
                      className={`p-3 rounded-lg ${
                        validationResult.feedback.subject.correct
                          ? 'bg-green-900/30 border border-green-500/50'
                          : 'bg-red-900/30 border border-red-500/50'
                      }`}
                    >
                      <p className="text-sm text-white">{validationResult.feedback.subject.message}</p>
                    </div>
                    <div
                      className={`p-3 rounded-lg ${
                        validationResult.feedback.style.correct
                          ? 'bg-green-900/30 border border-green-500/50'
                          : 'bg-red-900/30 border border-red-500/50'
                      }`}
                    >
                      <p className="text-sm text-white">{validationResult.feedback.style.message}</p>
                    </div>
                    <div
                      className={`p-3 rounded-lg ${
                        validationResult.feedback.lighting.correct
                          ? 'bg-green-900/30 border border-green-500/50'
                          : 'bg-red-900/30 border border-red-500/50'
                      }`}
                    >
                      <p className="text-sm text-white">{validationResult.feedback.lighting.message}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleNext}
              className="flex-1 bg-slate-700 text-white font-bold py-4 rounded-xl hover:bg-slate-600 transition-all shadow-lg"
            >
              Next Challenge
            </button>
            <a
              href="/arcade"
              className="flex-1 bg-slate-800 border-2 border-slate-700 text-white font-bold py-4 rounded-xl hover:border-purple-500 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft size={20} />
              Back to Arcade
            </a>
          </div>
        </div>
      ) : (
        <div className="relative z-10 w-full max-w-5xl flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-gray-400 mb-4">Failed to load level</p>
            <button
              onClick={() => loadLevel()}
              className="px-6 py-3 bg-purple-500 text-white font-bold rounded-xl hover:bg-purple-600 transition-all"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Instructions Modal */}
      <GameInstructions
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
        title="How to Play Visionary"
        icon={<Sparkles size={32} className="text-purple-400" />}
      >
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white mb-2">🎯 Objective</h3>
            <p>Analyze the generated image and select the correct attributes that would create it.</p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-2">📝 How to Play</h3>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>Study the image carefully</li>
              <li>Select one option from each category:
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-gray-400">
                  <li><strong>Subject:</strong> What is the main focus of the image?</li>
                  <li><strong>Style:</strong> What artistic style is used?</li>
                  <li><strong>Lighting:</strong> What type of lighting is present?</li>
                </ul>
              </li>
              <li>Click "Evaluate Prompt" to check your answer</li>
              <li>Get all three correct for a perfect score!</li>
            </ol>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-2">💡 Tips</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Pay attention to details in the image</li>
              <li>Consider the overall mood and atmosphere</li>
              <li>Think about what technical attributes would generate this image</li>
            </ul>
          </div>
        </div>
      </GameInstructions>
    </div>
  )
}
