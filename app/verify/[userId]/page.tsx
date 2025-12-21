'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Shield, Award, TrendingUp, Clock, CheckCircle2 } from 'lucide-react'
import { generateUserPersona } from '@/app/actions/resume-actions'
import type { UserPersona } from '@/app/actions/resume-actions'

export default function VerifyProfilePage() {
  const params = useParams()
  const userId = params.userId as string
  const [persona, setPersona] = useState<UserPersona | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPersona = async () => {
      if (!userId) {
        setError('Invalid user ID')
        setLoading(false)
        return
      }

      try {
        const result = await generateUserPersona(userId)
        if (result.success && result.persona) {
          setPersona(result.persona)
        } else {
          setError(result.error || 'Profile not found')
        }
      } catch (err) {
        console.error('Error loading persona:', err)
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    loadPersona()
  }, [userId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error || !persona) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800/90 border-2 border-red-500/50 rounded-2xl p-8 text-center">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Profile Not Found</h1>
          <p className="text-gray-400">{error || 'This profile does not exist or is not publicly available.'}</p>
        </div>
      </div>
    )
  }

  const verificationUrl = typeof window !== 'undefined' ? `${window.location.origin}/verify/${userId}` : ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Verification Badge */}
        <div className="bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-cyan-500/20 border-2 border-cyan-500/50 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-cyan-500/20 p-3 rounded-full">
                <Shield className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Data Legacy Profile</h1>
                <p className="text-gray-300">
                  {persona.chosenClass
                    ? `${persona.chosenClass.charAt(0) + persona.chosenClass.slice(1).toLowerCase()}`
                    : 'Data Professional'}{' '}
                  - Level {persona.currentLevel}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-full border border-green-500/50">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-semibold">Verified Profile</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Level & XP */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-6 h-6 text-cyan-400" />
              <h3 className="text-white font-semibold">Level & XP</h3>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-gray-400 text-sm">Current Level</p>
                <p className="text-3xl font-bold text-cyan-400">{persona.currentLevel}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total XP</p>
                <p className="text-2xl font-bold text-white">{persona.totalXP.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Coding Hours */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-6 h-6 text-purple-400" />
              <h3 className="text-white font-semibold">Practice Time</h3>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-gray-400 text-sm">Coding Hours</p>
                <p className="text-3xl font-bold text-purple-400">{persona.totalCodingHours}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Sessions</p>
                <p className="text-2xl font-bold text-white">{persona.totalSessions}</p>
              </div>
            </div>
          </div>

          {/* Achievements Count */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Award className="w-6 h-6 text-yellow-400" />
              <h3 className="text-white font-semibold">Achievements</h3>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-gray-400 text-sm">Total Badges</p>
                <p className="text-3xl font-bold text-yellow-400">{persona.achievements.length}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Top Skills</p>
                <p className="text-2xl font-bold text-white">{persona.topSkills.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Skills */}
        {persona.topSkills.length > 0 && (
          <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-cyan-400" />
              Top Technical Skills
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {persona.topSkills.map((skill, idx) => (
                <div key={idx} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-semibold">{skill.skill}</h3>
                    <span className="text-cyan-400 font-bold">Top {skill.percentile}%</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>Avg Score: {skill.avgScore}</span>
                    <span>•</span>
                    <span>{skill.gameType}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Soft Skills */}
        {persona.softSkills.length > 0 && (
          <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Award className="w-6 h-6 text-purple-400" />
              Soft Skills
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {persona.softSkills.map((skill, idx) => (
                <div key={idx} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-semibold">{skill.skill}</h3>
                    <span
                      className={`font-bold ${
                        skill.proficiency === 'Expert'
                          ? 'text-green-400'
                          : skill.proficiency === 'Advanced'
                            ? 'text-cyan-400'
                            : skill.proficiency === 'Intermediate'
                              ? 'text-yellow-400'
                              : 'text-gray-400'
                      }`}
                    >
                      {skill.proficiency}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>{skill.scenarios} scenarios</span>
                    <span>•</span>
                    <span>Avg: {skill.avgScore}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        {persona.achievements.length > 0 && (
          <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Award className="w-6 h-6 text-yellow-400" />
              Achievements & Certifications
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {persona.achievements.map((achievement, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/50 rounded-lg p-3 flex items-center gap-2"
                >
                  <Award className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                  <span className="text-white font-medium">{achievement}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Verification Footer */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <p className="text-gray-400 text-sm">
              This profile is verified and publicly accessible via:{' '}
              <a
                href={verificationUrl}
                className="text-cyan-400 hover:text-cyan-300 underline break-all"
                target="_blank"
                rel="noopener noreferrer"
              >
                {verificationUrl}
              </a>
            </p>
          </div>
          <p className="text-gray-500 text-xs">
            Generated by Data Legacy 2.0 • {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  )
}

