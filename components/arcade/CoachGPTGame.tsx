'use client'

import { useState } from 'react'
import { evaluatePrompt, savePromptBattle } from '@/app/actions/arcade-actions'
import { Loader2, CheckCircle, XCircle, ArrowLeft, Trophy, Clock, HelpCircle, Target } from 'lucide-react'
import GameInstructions from '@/components/ui/GameInstructions'

const SAMPLE_GAMES = [
  {
    score: '2-1',
    time: '75:00',
    opponentTactic: 'Aggressive pressing, high line',
    gameState: { possession: 45, shots: 8, corners: 3, yellowCards: 2 },
    targetCommand: 'Drop back, maintain shape, counter-attack on wings',
  },
  {
    score: '0-0',
    time: '60:00',
    opponentTactic: 'Defensive block, waiting for counter',
    gameState: { possession: 65, shots: 12, corners: 5, yellowCards: 1 },
    targetCommand: 'Increase tempo, overload central areas, shoot from distance',
  },
  {
    score: '1-2',
    time: '85:00',
    opponentTactic: 'Time wasting, deep defense',
    gameState: { possession: 70, shots: 15, corners: 7, yellowCards: 0 },
    targetCommand: 'Full press, commit players forward, long balls into box',
  },
]

export default function CoachGPTGame() {
  const [currentGame, setCurrentGame] = useState(SAMPLE_GAMES[0])
  const [userCommand, setUserCommand] = useState('')
  const [score, setScore] = useState<number | null>(null)
  const [feedback, setFeedback] = useState('')
  const [prediction, setPrediction] = useState<'WIN' | 'LOSS' | null>(null)
  const [loading, setLoading] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)

  const handleSubmit = async () => {
    if (!userCommand.trim()) return

    setLoading(true)

    try {
      const result = await evaluatePrompt(
        userCommand,
        currentGame.targetCommand,
        'COACH_GPT',
        { gameState: currentGame.gameState, opponentTactic: currentGame.opponentTactic }
      )

      setScore(result.score)
      setFeedback(result.feedback)
      setPrediction(result.score >= 70 ? 'WIN' : 'LOSS')

      await savePromptBattle(
        'COACH_GPT',
        currentGame.targetCommand,
        userCommand,
        result.score,
        result.feedback,
        {
          gameState: currentGame.gameState,
          opponentTactic: currentGame.opponentTactic,
          prediction: result.score >= 70 ? 'WIN' : 'LOSS',
        }
      )
    } catch (error) {
      console.error('Error evaluating command:', error)
      setFeedback('Error evaluating command. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    const nextIndex = (SAMPLE_GAMES.indexOf(currentGame) + 1) % SAMPLE_GAMES.length
    setCurrentGame(SAMPLE_GAMES[nextIndex])
    setUserCommand('')
    setScore(null)
    setFeedback('')
    setPrediction(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900/20 to-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 w-full max-w-5xl mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.5)]">
              <Trophy size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400 mb-1">
                Coach GPT
              </h1>
              <p className="text-gray-400 text-sm md:text-base">Write strategic commands to win the match</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowInstructions(true)}
              className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-orange-500 transition-all group"
              title="How to play"
            >
              <HelpCircle size={20} className="text-gray-400 group-hover:text-orange-400" />
            </button>
            <a
              href="/arcade"
              className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-orange-500 transition-all flex items-center gap-2 text-gray-300 hover:text-white"
            >
              <ArrowLeft size={18} />
              <span className="hidden sm:inline">Back</span>
            </a>
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-5xl space-y-6">
        {/* Game State Card */}
        <div className="bg-slate-800/90 backdrop-blur-xl border-2 border-orange-500/50 rounded-2xl p-6 md:p-8 shadow-[0_0_30px_rgba(249,115,22,0.2)] hover:border-orange-400/70 transition-all">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/50 flex items-center justify-center">
                <Trophy size={24} className="text-orange-400" />
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">Score: {currentGame.score}</div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Clock size={16} />
                  <span>{currentGame.time}</span>
                </div>
              </div>
            </div>
            <div className="text-left md:text-right">
              <div className="text-sm text-orange-400 mb-1 uppercase tracking-wider font-bold">Opponent Tactic</div>
              <div className="text-white font-semibold">{currentGame.opponentTactic}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-700">
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
              <div className="text-xs text-gray-500 mb-1">Possession</div>
              <div className="text-2xl font-bold text-white">{currentGame.gameState.possession}%</div>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
              <div className="text-xs text-gray-500 mb-1">Shots</div>
              <div className="text-2xl font-bold text-white">{currentGame.gameState.shots}</div>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
              <div className="text-xs text-gray-500 mb-1">Corners</div>
              <div className="text-2xl font-bold text-white">{currentGame.gameState.corners}</div>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
              <div className="text-xs text-gray-500 mb-1">Cards</div>
              <div className="text-2xl font-bold text-white">{currentGame.gameState.yellowCards}</div>
            </div>
          </div>
        </div>

        {/* User Input Card */}
        <div className="bg-slate-800/90 backdrop-blur-xl border-2 border-slate-700 rounded-2xl p-6 md:p-8 shadow-xl">
          <label className="block text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">
            Your Strategic Command
          </label>
          <textarea
            value={userCommand}
            onChange={(e) => setUserCommand(e.target.value)}
            placeholder="What tactical command do you give your team? (e.g., 'Press high, overload left side, shoot on sight', 'Drop back, maintain shape, counter-attack on wings')"
            className="w-full h-32 md:h-40 px-4 py-3 bg-slate-900 border-2 border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 resize-none transition-all"
          />
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Tip: Consider the game state, opponent tactic, and time remaining
            </p>
            <button
              onClick={handleSubmit}
              disabled={loading || !userCommand.trim()}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-orange-500/50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span className="hidden sm:inline">Simulating...</span>
                </>
              ) : (
                <>
                  <Target size={20} />
                  <span>Simulate Outcome</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Card */}
        {score !== null && (
          <div
            className={`bg-slate-800/90 backdrop-blur-xl border-2 rounded-2xl p-6 md:p-8 shadow-xl animate-fadeIn ${
              prediction === 'WIN'
                ? 'border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.3)]'
                : 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.3)]'
            }`}
          >
            <div className="flex items-center gap-4 mb-6">
              {prediction === 'WIN' ? (
                <CheckCircle size={56} className="text-green-400 flex-shrink-0" />
              ) : (
                <XCircle size={56} className="text-red-400 flex-shrink-0" />
              )}
              <div>
                <div className="text-4xl font-bold text-white mb-1">
                  {prediction === 'WIN' ? 'VICTORY! 🏆' : 'DEFEAT 😔'}
                </div>
                <div className="text-sm text-gray-400">Command Effectiveness: {score}%</div>
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
              <div className="text-sm text-gray-400 mb-2 uppercase tracking-wider font-bold">Match Simulation</div>
              <p className="text-gray-200 leading-relaxed">{feedback}</p>
            </div>
            <div className="mt-4 p-4 bg-slate-900/30 rounded-lg border border-slate-700">
              <div className="text-xs text-gray-500 mb-1">Optimal Command:</div>
              <div className="text-sm text-gray-400">{currentGame.targetCommand}</div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleNext}
            className="flex-1 bg-slate-700 text-white font-bold py-4 rounded-xl hover:bg-slate-600 transition-all shadow-lg"
          >
            New Match
          </button>
          <a
            href="/arcade"
            className="flex-1 bg-slate-800 border-2 border-slate-700 text-white font-bold py-4 rounded-xl hover:border-orange-500 transition-all flex items-center justify-center gap-2"
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
        title="How to Play Coach GPT"
        icon={<Trophy size={32} className="text-orange-400" />}
      >
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white mb-2">🎯 Objective</h3>
            <p>Write a strategic command that will lead your team to victory based on the current match situation.</p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-2">📝 How to Play</h3>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>Analyze the game state:
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-gray-400">
                  <li>Current score and time</li>
                  <li>Possession, shots, corners</li>
                  <li>Opponent's tactic</li>
                </ul>
              </li>
              <li>Write a tactical command that:
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-gray-400">
                  <li>Addresses the current situation</li>
                  <li>Counters the opponent's tactic</li>
                  <li>Maximizes your team's strengths</li>
                </ul>
              </li>
              <li>Click "Simulate Outcome" to see if you win</li>
              <li>Aim for 70%+ effectiveness to win!</li>
            </ol>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-2">💡 Tips</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>If losing late: Press high, commit players forward</li>
              <li>If winning late: Drop back, maintain shape</li>
              <li>If tied: Increase tempo, overload central areas</li>
              <li>Consider opponent's weakness (e.g., high line = counter-attack)</li>
            </ul>
          </div>
        </div>
      </GameInstructions>
    </div>
  )
}
