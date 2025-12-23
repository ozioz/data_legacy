'use client'

import { X, Play, Home, Mail, MessageSquare, TrendingUp, DollarSign, Zap } from 'lucide-react'

interface StoryModalProps {
  isOpen: boolean
  type: 'briefing' | 'debriefing' | 'sprint-report'
  // Briefing props (Slack/Email style)
  sender?: string // e.g., "CTO", "Manager", "Team Lead"
  message?: string // The actual message content
  impact?: string // Reward/impact message
  // Debriefing props (legacy support)
  topic?: string
  story?: string
  mascot?: string
  levelName?: string
  // Sprint Report props
  sprintMetrics?: {
    efficiency?: number // 0-100
    budgetEarned?: number
    dataQuality?: number
    throughput?: number
  }
  // Common props
  onClose: () => void
  onAction: () => void
  actionLabel?: string
}

export default function StoryModal({
  isOpen,
  type,
  sender,
  message,
  impact,
  topic,
  story,
  mascot,
  levelName,
  sprintMetrics,
  onClose,
  onAction,
  actionLabel,
}: StoryModalProps) {
  if (!isOpen) return null

  // Briefing mode: Slack/Email style
  if (type === 'briefing' && sender && message) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
        <div className="relative w-full max-w-2xl bg-slate-900/95 border-2 border-purple-500/50 rounded-2xl p-8 shadow-[0_0_50px_rgba(168,85,247,0.3)] animate-in zoom-in duration-300">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
          >
            <X size={24} />
          </button>

          <div className="relative z-10">
            {/* Slack/Email Header */}
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-700">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {sender.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare className="text-purple-400" size={16} />
                  <span className="font-bold text-white">{sender}</span>
                  <span className="text-xs text-gray-500">• just now</span>
                </div>
                <div className="text-sm text-gray-400">#{sender.toLowerCase().replace(/\s+/g, '-')}-channel</div>
              </div>
            </div>

            {/* Message Content */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-4 backdrop-blur-sm">
              <div className="text-gray-200 leading-relaxed text-base whitespace-pre-line">{message}</div>
            </div>

            {/* Impact/Reward */}
            {impact && (
              <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 text-green-400 font-semibold mb-2">
                  <TrendingUp size={18} />
                  <span>Impact</span>
                </div>
                <div className="text-green-300 text-sm">{impact}</div>
              </div>
            )}

            {/* Action Button */}
            <div className="flex justify-end">
              <button
                onClick={onAction}
                className="px-8 py-3 bg-purple-600 text-white font-bold rounded-full text-lg hover:bg-purple-500 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:scale-105"
              >
                <Play fill="currentColor" size={20} />
                {actionLabel || 'ACCEPT TASK'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Sprint Report mode
  if (type === 'sprint-report' && sprintMetrics) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
        <div className="relative w-full max-w-2xl bg-slate-900/95 border-2 border-green-500/50 rounded-2xl p-8 shadow-[0_0_50px_rgba(34,197,94,0.3)] animate-in zoom-in duration-300">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
          >
            <X size={24} />
          </button>

          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="text-xs uppercase tracking-widest text-green-400 mb-2 font-bold">SPRINT REPORT</div>
              <h2 className="text-3xl font-bold text-white mb-2">Pipeline Deployment Complete</h2>
              <div className="text-sm text-gray-400">Production Ready</div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {sprintMetrics.efficiency !== undefined && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                  <div className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Pipeline Efficiency</div>
                  <div className="text-3xl font-bold text-green-400">{sprintMetrics.efficiency}%</div>
                  <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all"
                      style={{ width: `${sprintMetrics.efficiency}%` }}
                    />
                  </div>
                </div>
              )}
              {sprintMetrics.budgetEarned !== undefined && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                  <div className="text-xs text-gray-400 mb-2 uppercase tracking-wider flex items-center gap-1">
                    <DollarSign size={12} />
                    Budget Earned
                  </div>
                  <div className="text-3xl font-bold text-yellow-400">${sprintMetrics.budgetEarned}</div>
                  <div className="text-xs text-gray-500 mt-1">Available for next sprint</div>
                </div>
              )}
              {sprintMetrics.dataQuality !== undefined && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                  <div className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Data Quality Score</div>
                  <div className="text-3xl font-bold text-blue-400">{sprintMetrics.dataQuality}/100</div>
                </div>
              )}
              {sprintMetrics.throughput !== undefined && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                  <div className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Throughput</div>
                  <div className="text-3xl font-bold text-cyan-400">{sprintMetrics.throughput.toFixed(2)}</div>
                  <div className="text-xs text-gray-500 mt-1">items/second</div>
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="flex justify-end">
              <button
                onClick={onAction}
                className="px-8 py-3 bg-green-600 text-white font-bold rounded-full text-lg hover:bg-green-500 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(34,197,94,0.5)] hover:scale-105"
              >
                <Zap size={20} />
                {actionLabel || 'DEPLOY TO PRODUCTION'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Legacy debriefing mode (fallback)
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl bg-slate-900/95 border-2 border-neon-blue rounded-2xl p-8 shadow-[0_0_50px_rgba(0,255,255,0.3)] animate-in zoom-in duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X size={24} />
        </button>

        <div className="relative z-10">
          <div className="flex items-center gap-6 mb-6">
            {mascot && (
              <div className="w-24 h-24 rounded-full border-4 border-neon-blue overflow-hidden bg-slate-800 shadow-[0_0_30px_rgba(0,255,255,0.4)] flex-shrink-0">
                <img src={mascot} alt="Mission Mascot" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1">
              <div className="text-xs uppercase tracking-widest text-neon-blue mb-1 font-bold">
                MISSION COMPLETE
              </div>
              {levelName && <h2 className="text-2xl font-bold text-white mb-1">{levelName}</h2>}
              {topic && <div className="text-sm text-gray-400">{topic}</div>}
            </div>
          </div>

          {story && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6 backdrop-blur-sm">
              <div className="text-gray-300 leading-relaxed text-lg">{story}</div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={onAction}
              className="px-8 py-3 bg-neon-blue text-black font-bold rounded-full text-lg hover:bg-cyan-400 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(0,255,255,0.5)] hover:scale-105"
            >
              <Home size={20} />
              {actionLabel || 'RETURN TO HQ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

