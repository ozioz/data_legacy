'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import InterviewSession from '@/components/interview/InterviewSession'
import { ArrowLeft, Briefcase, TrendingUp, Globe } from 'lucide-react'
import type { InterviewFeedback } from '@/types/supabase'
import { GAME_ASSETS } from '@/lib/game/assets'

export default function InterviewPage() {
  const router = useRouter()
  const [jobRole, setJobRole] = useState('Data Engineer')
  const [jobLevel, setJobLevel] = useState<'junior' | 'mid' | 'senior' | 'lead' | 'architect'>(
    'mid'
  )
  const [language, setLanguage] = useState<'tr' | 'en' | 'es' | 'fr' | 'de'>('tr')
  const [isInterviewStarted, setIsInterviewStarted] = useState(false)
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null)

  const jobRoles = [
    'Data Engineer',
    'Data Scientist',
    'Data Analyst',
    'ML Engineer',
    'Backend Engineer',
    'Full-Stack Engineer',
  ]

  const levels: Array<'junior' | 'mid' | 'senior' | 'lead' | 'architect'> = [
    'junior',
    'mid',
    'senior',
    'lead',
    'architect',
  ]

  if (isInterviewStarted && !feedback) {
    return (
      <InterviewSession
        jobRole={jobRole}
        jobLevel={jobLevel}
        language={language}
        onComplete={(fb) => {
          setFeedback(fb)
          setIsInterviewStarted(false)
        }}
        onClose={() => setIsInterviewStarted(false)}
      />
    )
  }

  if (feedback) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4">
        {/* Background Image with Fallback Gradient */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900"></div>
          {GAME_ASSETS.interviewBg && (
            <Image
              src={GAME_ASSETS.interviewBg}
              alt="Interview background"
              fill
              className="object-cover opacity-30"
              priority
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-purple-900/60 to-slate-900/80"></div>
        </div>
        <div className="relative z-10 w-full max-w-3xl bg-slate-800/90 border-2 border-neon-blue rounded-2xl p-8 shadow-[0_0_50px_rgba(0,255,255,0.3)]">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => {
                setFeedback(null)
                setIsInterviewStarted(false)
              }}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-3xl font-bold text-white">Interview Feedback</h1>
          </div>

          <div className="space-y-6">
            {/* Overall Score */}
            <div className="bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-green-500/20 border-2 border-cyan-500/50 rounded-lg p-6 mb-6">
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">Overall Score</p>
                <p className="text-6xl font-bold text-cyan-400 mb-2">{feedback.overall_score}/100</p>
                <div className="w-full bg-slate-700 rounded-full h-3 mt-4">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-purple-500 h-3 rounded-full transition-all"
                    style={{ width: `${feedback.overall_score}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Scores */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-900/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Technical</p>
                <p className="text-3xl font-bold text-cyan-400">{feedback.technical_score}</p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Communication</p>
                <p className="text-3xl font-bold text-purple-400">
                  {feedback.communication_score}
                </p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Problem Solving</p>
                <p className="text-3xl font-bold text-green-400">
                  {feedback.problem_solving_score}
                </p>
              </div>
            </div>

            {/* SWOT Analysis */}
            <div className="bg-slate-900/50 rounded-lg p-6 mb-6">
              <h3 className="text-white font-semibold mb-4 text-lg">SWOT Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp size={20} className="text-green-400" />
                    Strengths
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                    {feedback.strengths.map((strength, idx) => (
                      <li key={idx}>{strength}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-red-400 font-semibold mb-2">Weaknesses</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                    {feedback.weaknesses.map((weakness, idx) => (
                      <li key={idx}>{weakness}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-yellow-400 font-semibold mb-2">Opportunities</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                    {feedback.opportunities?.map((opp, idx) => (
                      <li key={idx}>{opp}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-orange-400 font-semibold mb-2">Threats</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                    {feedback.threats?.map((threat, idx) => (
                      <li key={idx}>{threat}</li>
                    ))}
                  </ul>
                </div>
              </div>
              {feedback.swot_analysis && (
                <div className="mt-4 p-4 bg-slate-800/50 rounded-lg">
                  <p className="text-gray-300 text-sm italic">{feedback.swot_analysis}</p>
                </div>
              )}
            </div>

            {/* Recommendations */}
            <div>
              <h3 className="text-white font-semibold mb-2">Recommendations</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-300">
                {feedback.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>

            {/* Overall Assessment */}
            <div className="bg-purple-500/20 border border-purple-500/50 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">Overall Assessment</h3>
              <p className="text-gray-300">{feedback.overall_assessment}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setFeedback(null)
                  setIsInterviewStarted(false)
                }}
                className="flex-1 px-6 py-3 bg-neon-blue text-black font-bold rounded-lg hover:bg-cyan-400 transition-all"
              >
                Start New Interview
              </button>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-slate-700 text-white font-bold rounded-lg hover:bg-slate-600 transition-all"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background Image with Fallback Gradient */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900"></div>
        {GAME_ASSETS.interviewBg && (
          <Image
            src={GAME_ASSETS.interviewBg}
            alt="Interview background"
            fill
            className="object-cover opacity-30"
            priority
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-purple-900/60 to-slate-900/80"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-2xl bg-slate-800/90 border-2 border-neon-blue rounded-2xl p-8 shadow-[0_0_50px_rgba(0,255,255,0.3)]">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/')}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">AI Mock Interview</h1>
            <p className="text-gray-400">Practice your technical interview skills with AI</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Job Role Selection */}
          <div>
            <label className="block text-white font-semibold mb-3 flex items-center gap-2">
              <Briefcase size={20} />
              Job Role
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {jobRoles.map((role) => (
                <button
                  key={role}
                  onClick={() => setJobRole(role)}
                  className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                    jobRole === role
                      ? 'bg-neon-blue text-black'
                      : 'bg-slate-700 text-white hover:bg-slate-600'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Level Selection */}
          <div>
            <label className="block text-white font-semibold mb-3 flex items-center gap-2">
              <TrendingUp size={20} />
              Experience Level
            </label>
            <div className="grid grid-cols-5 gap-3">
              {levels.map((level) => (
                <button
                  key={level}
                  onClick={() => setJobLevel(level)}
                  className={`px-4 py-3 rounded-lg font-semibold transition-all capitalize ${
                    jobLevel === level
                      ? 'bg-purple-500 text-white'
                      : 'bg-slate-700 text-white hover:bg-slate-600'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Language Selection */}
          <div>
            <label className="block text-white font-semibold mb-3 flex items-center gap-2">
              <Globe size={20} />
              Interview Language / Mülakat Dili
            </label>
            <div className="grid grid-cols-5 gap-3">
              {[
                { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
                { code: 'en', name: 'English', flag: '🇬🇧' },
                { code: 'es', name: 'Español', flag: '🇪🇸' },
                { code: 'fr', name: 'Français', flag: '🇫🇷' },
                { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code as typeof language)}
                  className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                    language === lang.code
                      ? 'bg-cyan-500 text-black'
                      : 'bg-slate-700 text-white hover:bg-slate-600'
                  }`}
                  title={lang.name}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <div className="text-xs mt-1">{lang.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={() => setIsInterviewStarted(true)}
            className="w-full px-6 py-4 bg-gradient-to-r from-neon-blue to-purple-500 text-black font-bold rounded-lg hover:from-cyan-400 hover:to-purple-400 transition-all text-lg"
          >
            Start Interview
          </button>

          {/* Info */}
          <div className="bg-slate-900/50 rounded-lg p-4 text-sm text-gray-400">
            <p className="mb-2">💡 <strong>Tips:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Enable microphone permissions when prompted</li>
              <li>Speak clearly and naturally</li>
              <li>The AI will ask follow-up questions based on your answers</li>
              <li>You can mute/unmute the AI voice at any time</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

