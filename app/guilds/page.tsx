'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trophy, Users, TrendingUp, ArrowRight } from 'lucide-react'
import { getGuilds, getGuildLeaderboard, getUserGuild } from '@/app/actions/guild-actions'
import Link from 'next/link'

export default function GuildsPage() {
  const router = useRouter()
  const [guilds, setGuilds] = useState<any[]>([])
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [userGuild, setUserGuild] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [guildsResult, leaderboardResult, userGuildResult] = await Promise.all([
      getGuilds(20),
      getGuildLeaderboard(10),
      getUserGuild(),
    ])

    if (guildsResult.success) setGuilds(guildsResult.data)
    if (leaderboardResult.success) setLeaderboard(leaderboardResult.data)
    if (userGuildResult.success) setUserGuild(userGuildResult.guild)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-white">Loading guilds...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Guilds</h1>
            <p className="text-gray-300">Join forces with other players and compete on the leaderboard</p>
          </div>
          <Link
            href="/guilds/create"
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Guild
          </Link>
        </div>

        {/* User's Current Guild */}
        {userGuild && (
          <div className="mb-8 p-6 bg-purple-900/50 border border-purple-500 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Your Guild</h2>
                <p className="text-purple-200">{userGuild.name}</p>
                <p className="text-gray-400 text-sm mt-1">{userGuild.description}</p>
              </div>
              <Link
                href={`/guilds/${userGuild.id}`}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                View Details
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Guild Leaderboard */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-6 h-6 text-yellow-400" />
                <h2 className="text-2xl font-bold text-white">Top Guilds</h2>
              </div>
              <div className="space-y-3">
                {leaderboard.length === 0 ? (
                  <p className="text-gray-400">No guilds yet</p>
                ) : (
                  leaderboard.map((guild, index) => (
                    <div
                      key={guild.id}
                      className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg hover:bg-gray-900 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-white font-semibold">{guild.name}</p>
                          <p className="text-gray-400 text-sm">{guild.actual_member_count || 0} members</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-yellow-400 font-bold">{guild.total_xp.toLocaleString()} XP</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Guild List */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-6">All Guilds</h2>
              {guilds.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">No guilds found. Be the first to create one!</p>
                  <Link
                    href="/guilds/create"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Create Guild
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {guilds.map((guild) => (
                    <Link
                      key={guild.id}
                      href={`/guilds/${guild.id}`}
                      className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg hover:border-purple-500 transition-all group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                          {guild.name}
                        </h3>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
                      </div>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{guild.description || 'No description'}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-gray-300">
                          <Users className="w-4 h-4" />
                          <span>{guild.member_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1 text-yellow-400">
                          <TrendingUp className="w-4 h-4" />
                          <span>{guild.total_xp.toLocaleString()} XP</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

