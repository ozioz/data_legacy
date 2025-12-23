'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Lightbulb, AlertTriangle, PartyPopper, Loader2 } from 'lucide-react'
import { useGameStore } from '@/lib/store/game-store'
import { getCTOHint } from '@/app/actions/ai-actions'

type CTOState = 'idle' | 'thinking' | 'warning' | 'celebrating'

interface VirtualCTOProps {
  currentStage?: number
  gameContext?: {
    gameType?: string
    status?: string
    score?: number
    metricValue?: number
  }
}

export default function VirtualCTO({ currentStage, gameContext }: VirtualCTOProps) {
  const { projectState, triggerCTOMessage } = useGameStore()
  const [ctoState, setCtoState] = useState<CTOState>('idle')
  const [message, setMessage] = useState<string>('')
  const [showBubble, setShowBubble] = useState(false)
  const [isLoadingHint, setIsLoadingHint] = useState(false)
  const [showHintModal, setShowHintModal] = useState(false)
  const [hintText, setHintText] = useState<string>('')

  // Listen for CTO message triggers from store
  const ctoMessage = useGameStore((state) => state.ctoMessage)
  
  useEffect(() => {
    if (ctoMessage) {
      setMessage(ctoMessage.text)
      setCtoState(ctoMessage.state)
      setShowBubble(true)
      
      // Auto-hide after 5 seconds for non-critical messages
      if (ctoMessage.state !== 'warning') {
        setTimeout(() => {
          setShowBubble(false)
        }, 5000)
      }
    } else {
      setShowBubble(false)
    }
  }, [ctoMessage])

  // Auto-trigger messages based on project state
  useEffect(() => {
    if (!currentStage) return

    // Stage 1: Check raw_data_quality
    if (currentStage === 1 && projectState.raw_data_quality > 0) {
      if (projectState.raw_data_quality < 50) {
        triggerCTOMessage({
          text: "Our data is garbage! Clean it up before we load the warehouse!",
          state: 'warning',
        })
      } else if (projectState.raw_data_quality >= 80) {
        triggerCTOMessage({
          text: "Excellent data quality! This will make Stage 2 much easier.",
          state: 'celebrating',
        })
      }
    }

    // Stage 2: Check model_integrity
    if (currentStage === 2 && projectState.model_integrity > 0) {
      if (projectState.model_integrity < 50) {
        triggerCTOMessage({
          text: "The data model has integrity issues. Review your Star Schema relationships!",
          state: 'warning',
        })
      } else if (projectState.model_integrity >= 80) {
        triggerCTOMessage({
          text: "Solid data model! The semantic layer will be a breeze.",
          state: 'celebrating',
        })
      }
    }

    // Stage 3: Check semantic_layer_score
    if (currentStage === 3 && projectState.semantic_layer_score > 0) {
      if (projectState.semantic_layer_score < 50) {
        triggerCTOMessage({
          text: "Your measures need work. Remember: SUM for totals, COUNT for counts!",
          state: 'warning',
        })
      } else if (projectState.semantic_layer_score >= 80) {
        triggerCTOMessage({
          text: "Great semantic layer! The dashboard will look professional.",
          state: 'celebrating',
        })
      }
    }

    // Stage 4: Check business_value
    if (currentStage === 4 && projectState.business_value > 0) {
      if (projectState.business_value < 70) {
        triggerCTOMessage({
          text: "Dashboard readability is low. Choose the right chart type for each metric!",
          state: 'warning',
        })
      } else if (projectState.business_value >= 80) {
        triggerCTOMessage({
          text: "Perfect dashboard! The CEO will be impressed.",
          state: 'celebrating',
        })
      }
    }
  }, [currentStage, projectState, triggerCTOMessage])

  // Context-based messages from game events
  useEffect(() => {
    if (!gameContext) return

    if (gameContext.status === 'ERROR') {
      triggerCTOMessage({
        text: "Something went wrong. Check your approach and try again!",
        state: 'warning',
      })
    } else if (gameContext.status === 'SUCCESS' && gameContext.score && gameContext.score >= 80) {
      triggerCTOMessage({
        text: "Well done! Keep up the excellent work!",
        state: 'celebrating',
      })
    }
  }, [gameContext, triggerCTOMessage])

  const handleCTOClick = async () => {
    if (isLoadingHint) return

    setIsLoadingHint(true)
    setShowHintModal(true)
    setCtoState('thinking')

    try {
      const hint = await getCTOHint(projectState, currentStage || 1, gameContext)
      setHintText(hint)
      setCtoState('idle')
    } catch (error) {
      console.error('Error getting CTO hint:', error)
      setHintText("I'm having trouble analyzing the situation. Try reviewing the game instructions!")
      setCtoState('idle')
    } finally {
      setIsLoadingHint(false)
    }
  }

  const getStateColor = () => {
    switch (ctoState) {
      case 'warning':
        return 'bg-red-500/20 border-red-500'
      case 'celebrating':
        return 'bg-green-500/20 border-green-500'
      case 'thinking':
        return 'bg-yellow-500/20 border-yellow-500'
      default:
        return 'bg-blue-500/20 border-blue-500'
    }
  }

  const getStateIcon = () => {
    switch (ctoState) {
      case 'warning':
        return <AlertTriangle className="text-red-400" size={20} />
      case 'celebrating':
        return <PartyPopper className="text-green-400" size={20} />
      case 'thinking':
        return <Loader2 className="text-yellow-400 animate-spin" size={20} />
      default:
        return <MessageCircle className="text-blue-400" size={20} />
    }
  }

  return (
    <>
      {/* Virtual CTO Avatar */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-4 right-4 z-40"
      >
        <div className="relative">
          {/* Chat Bubble */}
          <AnimatePresence>
            {showBubble && message && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                className={`absolute bottom-16 right-0 mb-2 w-64 p-3 rounded-lg border-2 ${getStateColor()} shadow-lg backdrop-blur-sm`}
              >
                <div className="flex items-start gap-2">
                  {getStateIcon()}
                  <p className="text-sm text-white flex-1">{message}</p>
                  <button
                    onClick={() => setShowBubble(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
                {/* Speech bubble tail */}
                <div
                  className={`absolute bottom-0 right-6 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent ${
                    ctoState === 'warning'
                      ? 'border-t-red-500'
                      : ctoState === 'celebrating'
                        ? 'border-t-green-500'
                        : ctoState === 'thinking'
                          ? 'border-t-yellow-500'
                          : 'border-t-blue-500'
                  }`}
                  style={{ transform: 'translateY(100%)' }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* CTO Avatar Button */}
          <motion.button
            onClick={handleCTOClick}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`w-16 h-16 rounded-full border-2 ${getStateColor()} flex items-center justify-center cursor-pointer shadow-lg backdrop-blur-sm relative overflow-hidden`}
          >
            {/* Avatar Image or Icon */}
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <MessageCircle className="text-white" size={32} />
            </div>
            
            {/* Pulse animation for thinking state */}
            {ctoState === 'thinking' && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-yellow-400"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
              />
            )}

            {/* Hint badge */}
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-slate-900">
              <Lightbulb size={12} className="text-slate-900" />
            </div>
          </motion.button>
        </div>
      </motion.div>

      {/* Hint Modal */}
      <AnimatePresence>
        {showHintModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setShowHintModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 border-2 border-blue-500 rounded-xl p-6 max-w-md w-full mx-4 shadow-[0_0_30px_rgba(59,130,246,0.3)]"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <MessageCircle className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">CTO Hint</h3>
                  <p className="text-sm text-gray-400">Technical guidance</p>
                </div>
              </div>

              {isLoadingHint ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="animate-spin text-blue-400" size={32} />
                </div>
              ) : (
                <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
                  <p className="text-gray-300 leading-relaxed">{hintText}</p>
                </div>
              )}

              <button
                onClick={() => setShowHintModal(false)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all font-bold"
              >
                Got it!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

