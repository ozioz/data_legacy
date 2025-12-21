'use client'

import { useState, useEffect } from 'react'
import { evaluatePrompt, savePromptBattle } from '@/app/actions/arcade-actions'
import { supabase } from '@/lib/supabase/client'
import { Loader2, CheckCircle, XCircle, ArrowLeft, GripVertical, Zap, HelpCircle, Target } from 'lucide-react'
import GameInstructions from '@/components/ui/GameInstructions'

interface Tool {
  id: string
  name: string
  icon: string
}

export default function AgentHandlerGame() {
  const [taskOutcome, setTaskOutcome] = useState('')
  const [availableTools, setAvailableTools] = useState<Tool[]>([])
  const [selectedSequence, setSelectedSequence] = useState<Tool[]>([])
  const [correctSequence, setCorrectSequence] = useState<string[]>([])
  const [score, setScore] = useState<number | null>(null)
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingTask, setLoadingTask] = useState(true)
  const [showInstructions, setShowInstructions] = useState(false)

  useEffect(() => {
    loadRandomTask()
  }, [])

  const loadRandomTask = async () => {
    setLoadingTask(true)
    try {
      const { data, error } = await supabase
        .from('tool_chains')
        .select('*')
        .order('random()')
        .limit(1)
        .single()

      if (error) throw error

      if (data) {
        const toolChainData = data as any
        setTaskOutcome(toolChainData.task_outcome)
        setCorrectSequence(toolChainData.correct_sequence)
        setAvailableTools(toolChainData.tools as Tool[])
        setSelectedSequence([])
        setScore(null)
        setFeedback('')
      }
    } catch (error) {
      console.error('Error loading task:', error)
      // Fallback
      setTaskOutcome('Meeting booked for tomorrow at 2 PM and synced to calendar')
      setCorrectSequence(['search_calendar', 'check_availability', 'book_meeting', 'sync_calendar', 'send_confirmation'])
      setAvailableTools([
        { id: 'search_calendar', name: 'Search Calendar', icon: 'calendar' },
        { id: 'check_availability', name: 'Check Availability', icon: 'clock' },
        { id: 'book_meeting', name: 'Book Meeting', icon: 'calendar-plus' },
        { id: 'sync_calendar', name: 'Sync Calendar', icon: 'refresh' },
        { id: 'send_confirmation', name: 'Send Confirmation', icon: 'mail' },
        { id: 'cancel_meeting', name: 'Cancel Meeting', icon: 'x' },
      ])
    } finally {
      setLoadingTask(false)
    }
  }

  const handleToolClick = (tool: Tool) => {
    if (selectedSequence.find((t) => t.id === tool.id)) return
    setSelectedSequence([...selectedSequence, tool])
    setAvailableTools(availableTools.filter((t) => t.id !== tool.id))
  }

  const handleRemoveTool = (tool: Tool, index: number) => {
    setSelectedSequence(selectedSequence.filter((_, i) => i !== index))
    setAvailableTools([...availableTools, tool])
  }

  const handleSubmit = async () => {
    if (selectedSequence.length === 0) return

    setLoading(true)
    const sequenceString = selectedSequence.map((t) => t.name).join(' → ')

    try {
      const result = await evaluatePrompt(
        sequenceString,
        taskOutcome,
        'AGENT_HANDLER',
        { correctSequence: correctSequence }
      )

      setScore(result.score)
      setFeedback(result.feedback)

      await savePromptBattle(
        'AGENT_HANDLER',
        taskOutcome,
        sequenceString,
        result.score,
        result.feedback,
        { correctSequence, userSequence: selectedSequence.map((t) => t.id) }
      )
    } catch (error) {
      console.error('Error evaluating sequence:', error)
      setFeedback('Error evaluating sequence. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loadingTask) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-400 mx-auto mb-4" size={48} />
          <p className="text-gray-400">Loading challenge...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 w-full max-w-6xl mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.5)]">
              <Zap size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-1">
                Agent Handler
              </h1>
              <p className="text-gray-400 text-sm md:text-base">Build the correct AI agent tool chain</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowInstructions(true)}
              className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-blue-500 transition-all group"
              title="How to play"
            >
              <HelpCircle size={20} className="text-gray-400 group-hover:text-blue-400" />
            </button>
            <a
              href="/arcade"
              className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-blue-500 transition-all flex items-center gap-2 text-gray-300 hover:text-white"
            >
              <ArrowLeft size={18} />
              <span className="hidden sm:inline">Back</span>
            </a>
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-6xl space-y-6">
        {/* Task Outcome Card */}
        <div className="bg-slate-800/90 backdrop-blur-xl border-2 border-blue-500/50 rounded-2xl p-6 md:p-8 shadow-[0_0_30px_rgba(59,130,246,0.2)] hover:border-blue-400/70 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/50 flex items-center justify-center">
              <Target size={24} className="text-blue-400" />
            </div>
            <div>
              <div className="text-xs text-blue-400 uppercase tracking-wider font-bold">Target Outcome</div>
              <div className="text-sm text-gray-500">What needs to be achieved</div>
            </div>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
            <p className="text-lg md:text-xl leading-relaxed text-gray-200">{taskOutcome}</p>
          </div>
        </div>

        {/* Selected Sequence Card */}
        <div className="bg-slate-800/90 backdrop-blur-xl border-2 border-slate-700 rounded-2xl p-6 md:p-8 shadow-xl">
          <div className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">Your Tool Chain</div>
          <div className="min-h-[120px] bg-slate-900/50 rounded-xl p-6 border-2 border-dashed border-slate-700 flex flex-wrap gap-3 items-center">
            {selectedSequence.length === 0 ? (
              <div className="w-full text-center text-gray-500 italic py-8">
                Click tools below to build your chain...
              </div>
            ) : (
              selectedSequence.map((tool, index) => (
                <div key={tool.id} className="flex items-center gap-2">
                  <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg hover:shadow-blue-500/50 transition-all group">
                    <GripVertical size={16} className="opacity-50" />
                    <span className="font-semibold">{tool.name}</span>
                    <button
                      onClick={() => handleRemoveTool(tool, index)}
                      className="ml-2 text-white/70 hover:text-white transition-colors"
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                  {index < selectedSequence.length - 1 && (
                    <span className="text-gray-500 text-xl font-bold">→</span>
                  )}
                </div>
              ))
            )}
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading || selectedSequence.length === 0}
            className="mt-6 w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-3 rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/50"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span className="hidden sm:inline">Evaluating...</span>
              </>
            ) : (
              <>
                <Zap size={20} />
                <span>Evaluate Chain</span>
              </>
            )}
          </button>
        </div>

        {/* Available Tools Card */}
        <div className="bg-slate-800/90 backdrop-blur-xl border-2 border-slate-700 rounded-2xl p-6 md:p-8 shadow-xl">
          <div className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">Available Tools</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {availableTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleToolClick(tool)}
                className="bg-slate-700 hover:bg-slate-600 border-2 border-slate-600 hover:border-blue-500 text-gray-200 px-4 py-3 rounded-xl transition-all text-sm font-medium hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20"
              >
                {tool.name}
              </button>
            ))}
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
                  {score >= 80 ? 'Perfect chain! 🎉' : score >= 60 ? 'Good sequence! 👍' : 'Try a different order! 💪'}
                </div>
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
              <div className="text-sm text-gray-400 mb-2 uppercase tracking-wider font-bold">AI Feedback</div>
              <p className="text-gray-200 leading-relaxed">{feedback}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={loadRandomTask}
            className="flex-1 bg-slate-700 text-white font-bold py-4 rounded-xl hover:bg-slate-600 transition-all shadow-lg"
          >
            New Task
          </button>
          <a
            href="/arcade"
            className="flex-1 bg-slate-800 border-2 border-slate-700 text-white font-bold py-4 rounded-xl hover:border-blue-500 transition-all flex items-center justify-center gap-2"
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
        title="How to Play Agent Handler"
        icon={<Zap size={32} className="text-blue-400" />}
      >
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white mb-2">🎯 Objective</h3>
            <p>Build the correct sequence of AI tools to achieve the target outcome.</p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-2">📝 How to Play</h3>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>Read the target outcome carefully</li>
              <li>Click tools from the "Available Tools" section to add them to your chain</li>
              <li>Arrange them in the correct logical order</li>
              <li>Click "Evaluate Chain" to check your sequence</li>
              <li>Aim for 80%+ to master the game!</li>
            </ol>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-2">💡 Tips</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Think about the logical flow: what needs to happen first?</li>
              <li>Some tools depend on others (e.g., you can't book without checking availability)</li>
              <li>Remove tools by clicking the × button if you make a mistake</li>
            </ul>
          </div>
        </div>
      </GameInstructions>
    </div>
  )
}
