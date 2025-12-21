'use client'

import { useQuery } from '@tanstack/react-query'
import { getLeaderboard } from '@/app/actions/game-actions'
import { Trophy, Medal, Award, Loader2 } from 'lucide-react'

export default function Leaderboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => getLeaderboard(10),
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="text-yellow-400" size={24} />
    if (rank === 2) return <Medal className="text-gray-300" size={24} />
    if (rank === 3) return <Award className="text-amber-600" size={24} />
    return <span className="text-gray-500 font-bold">#{rank}</span>
  }

  const getClassColor = (classType: string | null) => {
    switch (classType) {
      case 'ENGINEER':
        return 'text-blue-400'
      case 'SCIENTIST':
        return 'text-purple-400'
      case 'ANALYST':
        return 'text-green-400'
      default:
        return 'text-gray-400'
    }
  }

  if (isLoading) {
    return (
      <div className="bg-slate-800/90 border-2 border-neon-blue rounded-2xl p-6">
        <div className="flex items-center justify-center gap-3 text-gray-400">
          <Loader2 className="animate-spin text-neon-blue" size={24} />
          <span>Loading leaderboard...</span>
        </div>
      </div>
    )
  }

  if (error || !data?.success || !data.data || data.data.length === 0) {
    return (
      <div className="bg-slate-800/90 border-2 border-slate-700 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-neon-blue mb-4 flex items-center gap-2">
          <Trophy size={24} />
          Leaderboard
        </h3>
        <p className="text-gray-400 text-center py-4">No players yet. Be the first!</p>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/90 border-2 border-neon-blue rounded-2xl p-6 shadow-[0_0_30px_rgba(0,255,255,0.2)]">
      <h3 className="text-2xl font-bold text-neon-blue mb-6 flex items-center gap-2">
        <Trophy size={28} />
        Top Players
      </h3>

      <div className="space-y-3">
        {data.data.map((player: any, index: number) => (
          <div
            key={player.id}
            className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
              index < 3
                ? 'bg-slate-900/50 border-neon-blue shadow-[0_0_15px_rgba(0,255,255,0.2)]'
                : 'bg-slate-800/50 border-slate-700'
            }`}
          >
            <div className="flex items-center justify-center w-12 h-12">
              {getRankIcon(player.rank)}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-white">
                  {player.email || `Player #${player.rank}`}
                </span>
                {player.chosen_class && (
                  <span className={`text-xs font-bold ${getClassColor(player.chosen_class)}`}>
                    {player.chosen_class}
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-400">
                Level {player.current_level} • {player.total_xp.toLocaleString()} XP
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-neon-blue">{player.total_xp.toLocaleString()}</div>
              <div className="text-xs text-gray-500">XP</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-center text-xs text-gray-500">
        Updates every 30 seconds
      </div>
    </div>
  )
}

