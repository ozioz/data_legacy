'use client'

import { useEffect, useState } from 'react'
import { Download, User, Trophy, Code, TrendingUp, Award } from 'lucide-react'
import { generateUserPersona } from '@/app/actions/resume-actions'
import { generateResumePDF } from '@/lib/resume/pdf-generator'
import { supabase } from '@/lib/supabase/client'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [persona, setPersona] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        // Redirect to auth if not logged in
        window.location.href = '/auth'
        return
      }

      setUser(authUser)

      // Generate persona
      const result = await generateUserPersona(authUser.id)
      if (result.success && result.persona) {
        setPersona(result.persona)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadResume = async () => {
    if (!persona || !user) {
      alert('Persona data not available')
      return
    }

    setGenerating(true)
    try {
      generateResumePDF(persona, user.id)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate resume. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-white">Loading profile...</div>
        </div>
      </div>
    )
  }

  if (!user || !persona) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-white">Unable to load profile data</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">My Profile</h1>
            <p className="text-gray-300">View your Data Legacy achievements and download your resume</p>
          </div>
          <button
            onClick={handleDownloadResume}
            disabled={generating}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <Download className="w-5 h-5" />
            {generating ? 'Generating...' : 'Download Resume'}
          </button>
        </div>

        {/* User Info Card */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {persona.chosenClass
                  ? `${persona.chosenClass.charAt(0) + persona.chosenClass.slice(1).toLowerCase()}`
                  : 'Data Professional'}
              </h2>
              <p className="text-gray-400">{persona.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="p-4 bg-gray-900/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="text-gray-400 text-sm">Total XP</span>
              </div>
              <p className="text-2xl font-bold text-white">{persona.totalXP.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-gray-900/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <span className="text-gray-400 text-sm">Level</span>
              </div>
              <p className="text-2xl font-bold text-white">{persona.currentLevel}</p>
            </div>
            <div className="p-4 bg-gray-900/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Code className="w-5 h-5 text-green-400" />
                <span className="text-gray-400 text-sm">Coding Hours</span>
              </div>
              <p className="text-2xl font-bold text-white">{persona.totalCodingHours}</p>
            </div>
          </div>
        </div>

        {/* Top Skills */}
        {persona.topSkills.length > 0 && (
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Code className="w-6 h-6 text-purple-400" />
              Top Technical Skills
            </h3>
            <div className="space-y-3">
              {persona.topSkills.map((skill: any, index: number) => (
                <div key={index} className="p-4 bg-gray-900/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold">{skill.skill}</span>
                    <span className="text-purple-400 font-bold">Top {skill.percentile}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${skill.percentile}%` }}
                    />
                  </div>
                  <p className="text-gray-400 text-sm mt-1">Average Score: {skill.avgScore}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Soft Skills */}
        {persona.softSkills.length > 0 && (
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <User className="w-6 h-6 text-green-400" />
              Soft Skills
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {persona.softSkills.map((skill: any, index: number) => (
                <div key={index} className="p-4 bg-gray-900/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold">{skill.skill}</span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        skill.proficiency === 'Expert'
                          ? 'bg-green-600 text-white'
                          : skill.proficiency === 'Advanced'
                          ? 'bg-blue-600 text-white'
                          : skill.proficiency === 'Intermediate'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-gray-600 text-white'
                      }`}
                    >
                      {skill.proficiency}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    {skill.scenarios} scenarios • Avg Score: {skill.avgScore}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        {persona.achievements.length > 0 && (
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Award className="w-6 h-6 text-yellow-400" />
              Achievements & Certifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {persona.achievements.map((achievement: string, index: number) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg">
                  <Award className="w-5 h-5 text-yellow-400" />
                  <span className="text-white">{achievement}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

