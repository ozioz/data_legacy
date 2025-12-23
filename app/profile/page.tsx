'use client'

import { useEffect, useState } from 'react'
import { Download, User, Trophy, Award, Share2, Linkedin, Sparkles, Database, BarChart3, TrendingUp } from 'lucide-react'
import { generateUserPersona } from '@/app/actions/resume-actions'
import { generateResumePDF } from '@/lib/resume/pdf-generator'
import { supabase } from '@/lib/supabase/client'
import { getProjectProgress } from '@/app/actions/game-actions'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [persona, setPersona] = useState<any>(null)
  const [projectProgress, setProjectProgress] = useState<any>(null)
  const [aptitudeMetrics, setAptitudeMetrics] = useState<any>(null)
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
        window.location.href = '/auth'
        return
      }

      setUser(authUser)

      // Generate persona
      const result = await generateUserPersona(authUser.id)
      if (result.success && result.persona) {
        setPersona(result.persona)
      }

      // Get project progress
      const projectResult = await getProjectProgress()
      if (projectResult.success && projectResult.data) {
        setProjectProgress(projectResult.data)
      }

      // Get latest aptitude metrics
      const { data: metrics } = await supabase
        .from('user_aptitude_metrics')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (metrics) {
        setAptitudeMetrics(metrics)
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
      await generateResumePDF(persona, user.id)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate resume. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const handleShareLinkedIn = () => {
    const passportUrl = typeof window !== 'undefined' ? `${window.location.origin}/profile` : ''
    const skills = projectProgress?.stages_completed?.length === 4 
      ? 'ETL, Star Schema, BI' 
      : 'Data Engineering'
    const postText = `I just built an end-to-end Data Warehouse on Data Legacy! Verified Skills: ${skills}. Check my passport: ${passportUrl}`
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(passportUrl)}&summary=${encodeURIComponent(postText)}`
    window.open(linkedInUrl, '_blank')
  }

  const getTitle = () => {
    if (!projectProgress) return 'Data Professional'
    const stagesCompleted = projectProgress.stages_completed?.length || 0
    if (stagesCompleted === 4) return 'Senior Data Architect'
    if (stagesCompleted >= 2) return 'Data Engineer'
    if (stagesCompleted >= 1) return 'Junior Data Engineer'
    return 'Data Professional'
  }

  const isProjectGenesisComplete = projectProgress?.stages_completed?.length === 4

  // Prepare radar chart data
  const radarData = aptitudeMetrics ? [
    {
      subject: 'Coding Speed',
      value: aptitudeMetrics.coding_speed || 0,
      fullMark: 100,
    },
    {
      subject: 'Analytical Thinking',
      value: aptitudeMetrics.analytical_thinking || 0,
      fullMark: 100,
    },
    {
      subject: 'Crisis Management',
      value: aptitudeMetrics.crisis_management || 0,
      fullMark: 100,
    },
  ] : []

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center text-white">Loading passport...</div>
        </div>
      </div>
    )
  }

  if (!user || !persona) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center text-white">Unable to load passport data</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header - Passport Title */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-8 h-8 text-yellow-400" />
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-purple-400 to-pink-500">
                Data Legacy Passport
              </h1>
            </div>
            <p className="text-gray-300">Verified proof of practical data engineering skills</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleShareLinkedIn}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Linkedin className="w-5 h-5" />
              Share on LinkedIn
            </button>
            <button
              onClick={handleDownloadResume}
              disabled={generating}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <Download className="w-5 h-5" />
              {generating ? 'Generating...' : 'Download Resume'}
            </button>
          </div>
        </div>

        {/* Top Section: Avatar, Level, Title */}
        <div className="bg-gray-800/50 backdrop-blur border-2 border-purple-500/30 rounded-xl p-8 mb-6 shadow-[0_0_30px_rgba(147,51,234,0.3)]">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center border-4 border-yellow-400 shadow-lg">
                <User className="w-12 h-12 text-white" />
              </div>
              {isProjectGenesisComplete && (
                <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1">
                  <Award className="w-6 h-6 text-gray-900" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold text-white">{getTitle()}</h2>
                {isProjectGenesisComplete && (
                  <span className="px-3 py-1 bg-yellow-400 text-gray-900 rounded-full text-sm font-bold flex items-center gap-1">
                    <Trophy className="w-4 h-4" />
                    Project Genesis Complete
                  </span>
                )}
              </div>
              <p className="text-gray-400 text-lg mb-3">{persona.email}</p>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  <span className="text-gray-300">Level <span className="text-white font-bold">{persona.currentLevel}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <span className="text-gray-300"><span className="text-white font-bold">{persona.totalXP.toLocaleString()}</span> XP</span>
                </div>
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-cyan-400" />
                  <span className="text-gray-300"><span className="text-white font-bold">{persona.totalCodingHours}</span> hours</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section: Completed Projects */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6 mb-6">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-400" />
            Completed Projects
          </h3>
          
          <div className="bg-gray-900/50 rounded-lg p-6 border-2 border-yellow-400/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Database className="w-8 h-8 text-yellow-400" />
                <div>
                  <h4 className="text-xl font-bold text-white">Project Genesis</h4>
                  <p className="text-gray-400 text-sm">End-to-End Data Warehouse Project</p>
                </div>
              </div>
              {isProjectGenesisComplete ? (
                <span className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-full font-bold flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  COMPLETED
                </span>
              ) : (
                <span className="px-4 py-2 bg-gray-700 text-gray-400 rounded-full font-bold">
                  IN PROGRESS ({projectProgress?.stages_completed?.length || 0}/4)
                </span>
              )}
            </div>
            
            {projectProgress && (
              <div className="grid grid-cols-4 gap-4 mt-4">
                <div className="text-center p-3 bg-slate-800 rounded-lg">
                  <div className={`text-2xl font-bold mb-1 ${projectProgress.raw_data_quality > 0 ? 'text-green-400' : 'text-gray-600'}`}>
                    {projectProgress.raw_data_quality || 0}%
                  </div>
                  <div className="text-xs text-gray-400">Data Quality</div>
                </div>
                <div className="text-center p-3 bg-slate-800 rounded-lg">
                  <div className={`text-2xl font-bold mb-1 ${projectProgress.model_integrity > 0 ? 'text-blue-400' : 'text-gray-600'}`}>
                    {projectProgress.model_integrity || 0}%
                  </div>
                  <div className="text-xs text-gray-400">Model Integrity</div>
                </div>
                <div className="text-center p-3 bg-slate-800 rounded-lg">
                  <div className={`text-2xl font-bold mb-1 ${projectProgress.semantic_layer_score > 0 ? 'text-purple-400' : 'text-gray-600'}`}>
                    {projectProgress.semantic_layer_score || 0}%
                  </div>
                  <div className="text-xs text-gray-400">Semantic Layer</div>
                </div>
                <div className="text-center p-3 bg-slate-800 rounded-lg">
                  <div className={`text-2xl font-bold mb-1 ${projectProgress.business_value > 0 ? 'text-pink-400' : 'text-gray-600'}`}>
                    {projectProgress.business_value || 0}%
                  </div>
                  <div className="text-xs text-gray-400">Business Value</div>
                </div>
              </div>
            )}

            {/* Dashboard Screenshot Placeholder */}
            {isProjectGenesisComplete && (
              <div className="mt-6 p-4 bg-slate-900 rounded-lg border border-gray-700">
                <p className="text-sm text-gray-400 mb-2">Dashboard Screenshot (from Stage 4)</p>
                <div className="w-full h-48 bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600">
                  <p className="text-gray-500">Dashboard visualization will be displayed here</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section: Skill Matrix (Radar Chart) */}
        {aptitudeMetrics && radarData.length > 0 && (
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Share2 className="w-6 h-6 text-cyan-400" />
              Skill Matrix
            </h3>
            <div className="bg-gray-900/50 rounded-lg p-6">
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#e5e7eb', fontSize: 12 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <Radar
                    name="Skills"
                    dataKey="value"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.6}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
              {aptitudeMetrics.ai_observation && (
                <div className="mt-4 p-4 bg-slate-800 rounded-lg border border-purple-500/30">
                  <p className="text-sm text-gray-400 mb-1">AI Assessment:</p>
                  <p className="text-white text-sm">{aptitudeMetrics.ai_observation}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
