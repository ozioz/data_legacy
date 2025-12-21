'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Users, Trophy, TrendingUp, UserPlus, LogOut, Crown } from 'lucide-react'
import { getGuildById, joinGuild, leaveGuild, getUserGuild } from '@/app/actions/guild-actions'
import Link from 'next/link'

export default function GuildDetailPage() {
  const params = useParams()
  const router = useRouter()
  const guildId = params.id as string
  const [guild, setGuild] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [userGuild, setUserGuild] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [guildId])

  const loadData = async () => {
    setLoading(true)
    const [guildResult, userGuildResult] = await Promise.all([
      getGuildById(guildId),
      getUserGuild(),
    ])

    if (guildResult.success) {
      setGuild(guildResult.guild)
      setMembers(guildResult.members || [])
    }
    if (userGuildResult.success) {
      setUserGuild(userGuildResult.guild)
    }
    setLoading(false)
  }

  const handleJoin = async () => {
    setActionLoading(true)
    const result = await joinGuild(guildId)
    setActionLoading(false)

    if (result.success) {
      router.refresh()
      loadData()
    } else {
      alert(result.error || 'Failed to join guild')
    }
  }

  const handleLeave = async () => {
    if (!confirm('Are you sure you want to leave this guild?')) return

    setActionLoading(true)
    const result = await leaveGuild(guildId)
    setActionLoading(false)

    if (result.success) {
      router.push('/guilds')
    } else {
      alert(result.error || 'Failed to leave guild')
    }
  }

  const isMember = userGuild?.id === guildId
  const isLeader = members.some((m) => m.user_id === userGuild?.id && m.role === 'leader')

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center text-white">Loading guild...</div>
        </div>
      </div>
    )
  }

  if (!guild) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center text-white">Guild not found</div>
          <Link href="/guilds" className="text-purple-400 hover:text-purple-300">
            Back to Guilds
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/guilds"
          className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Guilds
        </Link>

        {/* Guild Header */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-8 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-4xl font-bold text-white">{guild.name}</h1>
                {isLeader && <Crown className="w-6 h-6 text-yellow-400" />}
              </div>
              <p className="text-gray-300 mb-6">{guild.description || 'No description'}</p>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-gray-300">
                  <Users className="w-5 h-5" />
                  <span className="font-semibold">{guild.member_count || 0} Members</span>
                </div>
                <div className="flex items-center gap-2 text-yellow-400">
                  <Trophy className="w-5 h-5" />
                  <span className="font-semibold">{guild.total_xp.toLocaleString()} XP</span>
                </div>
                <div className="flex items-center gap-2 text-purple-400">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-sm">Created {new Date(guild.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div>
              {!isMember ? (
                <button
                  onClick={handleJoin}
                  disabled={actionLoading || userGuild !== null}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  <UserPlus className="w-5 h-5" />
                  {actionLoading ? 'Joining...' : 'Join Guild'}
                </button>
              ) : (
                <button
                  onClick={handleLeave}
                  disabled={actionLoading || isLeader}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  {isLeader ? "Can't Leave (Leader)" : 'Leave Guild'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Members List */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Members</h2>
          {members.length === 0 ? (
            <p className="text-gray-400">No members yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg hover:border-purple-500 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {member.role === 'leader' && <Crown className="w-4 h-4 text-yellow-400" />}
                      <span className="text-white font-semibold">
                        {member.user?.email || 'Unknown User'}
                      </span>
                    </div>
                    <span className="text-xs px-2 py-1 bg-purple-900/50 text-purple-300 rounded">
                      {member.role}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    <p>Contributed: {member.contributed_xp.toLocaleString()} XP</p>
                    <p>Joined: {new Date(member.joined_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

