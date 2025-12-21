'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Mic, MicOff, Video, VideoOff, PhoneOff, Loader2, User, Bot } from 'lucide-react'
import {
  generateInterviewerResponse,
  saveInterviewTranscript,
  completeInterviewSession,
  createInterviewSession,
  generateInterviewFeedback,
} from '@/app/actions/interview-actions'
import { GAME_ASSETS } from '@/lib/game/assets'
import AudioWaveform from './AudioWaveform'
import { analyzeEmotionFromVideo, getEmotionalContext, type EmotionState } from '@/lib/interview/emotion-detector'
import type { TranscriptMessage, InterviewFeedback } from '@/types/supabase'

interface InterviewSessionProps {
  jobRole: string
  jobLevel: 'junior' | 'mid' | 'senior' | 'lead' | 'architect'
  language?: 'tr' | 'en' | 'es' | 'fr' | 'de'
  onComplete?: (feedback: InterviewFeedback) => void
  onClose?: () => void
}

export default function InterviewSession({
  jobRole,
  jobLevel,
  language = 'tr',
  onComplete,
  onClose,
}: InterviewSessionProps) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([])
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [questionCount, setQuestionCount] = useState(0)
  const [startTime] = useState(Date.now())
  const [interviewDuration, setInterviewDuration] = useState(0)
  const [currentEmotion, setCurrentEmotion] = useState<EmotionState | null>(null)
  const emotionAnalysisIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const recognitionRef = useRef<any>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const lastApiCallRef = useRef<number>(0)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const pendingTranscriptRef = useRef<TranscriptMessage[]>([])
  const greetingAddedRef = useRef(false)

  // Initialize session - only once using useRef to prevent double execution
  const initRef = useRef(false)
  
  useEffect(() => {
    // Prevent double initialization in React Strict Mode
    if (initRef.current) {
      return
    }
    initRef.current = true

    const initSession = async () => {
      // Try to create session, but don't fail if not authenticated
      const { sessionId: id, error } = await createInterviewSession(jobRole, jobLevel)
      if (error) {
        console.warn('Failed to create session (continuing without auth):', error)
        // Continue without session ID - interview can work without saving
      } else {
        setSessionId(id)
      }

      // Start with interviewer greeting in selected language
      const greetings: Record<string, string> = {
        tr: `Merhaba! ${jobRole} pozisyonu için mülakatınıza hoş geldiniz. Size bazı teknik sorular soracağım. Başlamaya hazır mısınız?`,
        en: `Hello! Welcome to your ${jobRole} interview. I'll be asking you some technical questions. Are you ready to begin?`,
        es: `¡Hola! Bienvenido a tu entrevista para ${jobRole}. Te haré algunas preguntas técnicas. ¿Estás listo para comenzar?`,
        fr: `Bonjour! Bienvenue à votre entretien pour ${jobRole}. Je vais vous poser quelques questions techniques. Êtes-vous prêt à commencer?`,
        de: `Hallo! Willkommen zu Ihrem ${jobRole}-Vorstellungsgespräch. Ich werde Ihnen einige technische Fragen stellen. Sind Sie bereit zu beginnen?`,
      }
      
      const greeting: TranscriptMessage = {
        role: 'assistant',
        content: greetings[language] || greetings.en,
        timestamp: new Date().toISOString(),
      }
      
      // Initialize transcript with greeting - only if empty
      setTranscript((prev) => {
        if (prev.length === 0 && !greetingAddedRef.current) {
          greetingAddedRef.current = true
          console.log('✅ Initializing transcript with greeting')
          // Speak greeting after a short delay (outside setState)
          setTimeout(() => {
            speakText(greeting.content)
          }, 500)
          return [greeting]
        }
        if (prev.length > 0) {
          console.log('⚠️ Transcript already exists, keeping:', prev.length, 'messages')
        }
        return prev
      })
    }

    initSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty dependency array - only run once on mount

  // Track interview duration and auto-complete
  useEffect(() => {
    if (isComplete) return

    const interval = setInterval(() => {
      const duration = Math.floor((Date.now() - startTime) / 1000 / 60) // minutes
      setInterviewDuration(duration)
      
      // Auto-complete after 20 minutes
      if (duration >= 20 && !isComplete) {
        console.log('⏰ Interview time limit reached (20 minutes)')
        setTranscript((prev) => {
          if (prev.length > 0 && !isComplete) {
            handleInterviewComplete(prev)
          }
          return prev
        })
      }
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [isComplete, startTime])

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window === 'undefined') return

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    
    // Set language based on user selection
    const languageMap: Record<string, string> = {
      tr: 'tr-TR',
      en: 'en-US',
      es: 'es-ES',
      fr: 'fr-FR',
      de: 'de-DE',
    }
    recognition.lang = languageMap[language] || 'tr-TR'

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript
      
      // Skip if transcript is empty or just whitespace
      if (!transcript || !transcript.trim()) {
        return
      }
      
      // Debounce: Wait a bit before processing to avoid multiple rapid calls
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      
      debounceTimerRef.current = setTimeout(() => {
        handleUserSpeech(transcript.trim())
      }, 500) // 500ms debounce
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    synthRef.current = window.speechSynthesis

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [language])

  // Initialize video stream
  useEffect(() => {
    if (isVideoEnabled && videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((stream) => {
          streamRef.current = stream
          if (videoRef.current) {
            videoRef.current.srcObject = stream
          }
        })
        .catch((error) => {
          console.error('Error accessing camera:', error)
          setIsVideoEnabled(false)
        })
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
  }, [isVideoEnabled])

  const speakText = useCallback((text: string) => {
    if (!synthRef.current || isMuted) return

    // Cancel any ongoing speech
    synthRef.current.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1.0
    utterance.volume = 1.0

    // Set language
    const languageMap: Record<string, string> = {
      tr: 'tr-TR',
      en: 'en-US',
      es: 'es-ES',
      fr: 'fr-FR',
      de: 'de-DE',
    }
    utterance.lang = languageMap[language] || 'tr-TR'

    // Try to use a natural voice for the selected language
    const voices = synthRef.current.getVoices()
    let preferredVoice = voices.find((voice) => {
      const voiceLang = voice.lang.toLowerCase()
      const targetLang = (languageMap[language] || 'tr-TR').toLowerCase()
      
      // For Turkish, prefer Turkish voices
      if (language === 'tr') {
        return voiceLang.startsWith('tr') && (voice.name.includes('Turkish') || voice.name.includes('Türkçe'))
      }
      // For other languages, prefer native voices
      return voiceLang.startsWith(targetLang.split('-')[0]) && 
             (voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.name.includes('Natural'))
    })

    // Fallback to any voice in the target language
    if (!preferredVoice) {
      preferredVoice = voices.find((voice) => {
        const voiceLang = voice.lang.toLowerCase()
        const targetLang = (languageMap[language] || 'tr-TR').toLowerCase()
        return voiceLang.startsWith(targetLang.split('-')[0])
      })
    }

    // Final fallback to default
    if (preferredVoice) {
      utterance.voice = preferredVoice
    }

    // Track speaking state for waveform
    setIsSpeaking(true)
    utterance.onstart = () => {
      setIsSpeaking(true)
    }
    utterance.onend = () => {
      setIsSpeaking(false)
    }
    utterance.onerror = () => {
      setIsSpeaking(false)
    }

    synthRef.current.speak(utterance)
  }, [language, isMuted])

  const handleUserSpeech = async (userText: string) => {
    if (!userText || !userText.trim() || isProcessing) {
      console.log('⚠️ Skipping user speech - empty or processing:', { userText, isProcessing })
      return
    }

    // Rate limiting: Minimum 2 seconds between API calls
    const now = Date.now()
    const timeSinceLastCall = now - lastApiCallRef.current
    const MIN_API_INTERVAL = 2000 // 2 seconds

    if (timeSinceLastCall < MIN_API_INTERVAL) {
      console.log(`Rate limited: Waiting ${MIN_API_INTERVAL - timeSinceLastCall}ms`)
      // Queue the message for later processing
      pendingTranscriptRef.current.push({
        role: 'user',
        content: userText,
        timestamp: new Date().toISOString(),
      })
      
      // Process after rate limit
      setTimeout(() => {
        if (pendingTranscriptRef.current.length > 0) {
          const pending = pendingTranscriptRef.current.shift()
          if (pending) {
            handleUserSpeech(pending.content)
          }
        }
      }, MIN_API_INTERVAL - timeSinceLastCall)
      return
    }

    setIsProcessing(true)
    lastApiCallRef.current = now

    // Add user message to transcript
    const userMessage: TranscriptMessage = {
      role: 'user',
      content: userText,
      timestamp: new Date().toISOString(),
    }

    // Add user message to transcript first
    let updatedTranscript: TranscriptMessage[] = []
    setTranscript((prevTranscript) => {
      updatedTranscript = [...prevTranscript, userMessage]
      console.log('=== User Message Added ===')
      console.log('Previous transcript length:', prevTranscript.length)
      console.log('Updated transcript length:', updatedTranscript.length)
      updatedTranscript.forEach((m, i) => {
        const speaker = m.role === 'user' ? 'Candidate' : 'Interviewer'
        console.log(`  ${i + 1}. ${speaker}: ${m.content.substring(0, 50)}`)
      })
      
      // Save transcript (debounced - only save every 5 seconds)
      if (sessionId) {
        // Don't await - save in background
        saveInterviewTranscript(sessionId, updatedTranscript).catch(console.error)
      }
      
      return updatedTranscript
    })

    // Call API with updated transcript (outside setState to avoid render warning)
    // Use setTimeout to ensure state is updated before API call
    setTimeout(() => {
      // Get AI response - only send last 6 messages to reduce token usage
      const recentTranscript = updatedTranscript.slice(-6) // Last 6 messages only
      
      console.log('=== Sending to Groq ===')
      console.log('Recent transcript length:', recentTranscript.length)
      recentTranscript.forEach((m, i) => {
        const speaker = m.role === 'user' ? 'Candidate' : 'Interviewer'
        console.log(`  ${i + 1}. ${speaker}: ${m.content.substring(0, 60)}`)
      })
      
      // Get emotional context for AI
      const emotionalContext = currentEmotion ? getEmotionalContext(currentEmotion) : ''

      // Call API with the updated transcript and emotional context
      if (recentTranscript.length > 0) {
        generateInterviewerResponse(recentTranscript, jobRole, jobLevel, language, emotionalContext)
          .then((response) => {
            console.log('=== Groq Response Received ===')
            console.log('Question:', response.question)
            console.log('Is Complete:', response.isComplete)

            // Check if response is an error message
            if (!response.question || 
                response.question.includes('Özür dilerim') || 
                response.question.includes('I apologize') ||
                response.question.includes('Lo siento') ||
                response.question.includes('Je m\'excuse') ||
                response.question.includes('Es tut mir leid') ||
                response.question.includes('Teknik bir sorun')) {
              console.error('ERROR: Received error message from API:', response.question)
              setIsProcessing(false)
              return
            }

            const aiMessage: TranscriptMessage = {
              role: 'assistant',
              content: response.question,
              timestamp: new Date().toISOString(),
            }

            // Add AI response to transcript
            setTranscript((finalTranscript) => {
              const updated = [...finalTranscript, aiMessage]
              
              // Calculate question count (count assistant messages as questions)
              const currentQuestionCount = updated.filter(m => m.role === 'assistant').length
              setQuestionCount(currentQuestionCount)
              
              const currentDuration = Math.floor((Date.now() - startTime) / 1000 / 60) // minutes
              
              console.log('=== Final Transcript ===')
              console.log('Total messages:', updated.length)
              console.log('Question count:', currentQuestionCount)
              console.log('Duration:', currentDuration, 'minutes')
              updated.forEach((m, i) => {
                const speaker = m.role === 'user' ? 'Candidate' : 'Interviewer'
                console.log(`  ${i + 1}. ${speaker}: ${m.content.substring(0, 50)}`)
              })
              
              // Save updated transcript (background, don't await)
              if (sessionId) {
                saveInterviewTranscript(sessionId, updated).catch(console.error)
              }
              
              // Speak AI response
              speakText(response.question)
              
              // Check if interview should complete
              // Auto-complete conditions:
              // 1. AI says it's complete
              // 2. Question count >= 8 (optimal range: 6-8 questions)
              // 3. Duration >= 20 minutes (optimal: 15-20 minutes)
              const shouldComplete = 
                response.isComplete || 
                currentQuestionCount >= 8 || 
                currentDuration >= 20
              
              if (shouldComplete) {
                console.log('✅ Interview auto-completing:', {
                  reason: response.isComplete ? 'AI decision' : 
                          currentQuestionCount >= 8 ? 'Question limit' : 'Time limit',
                  questionCount: currentQuestionCount,
                  duration: currentDuration,
                })
                // Complete interview with AI-generated feedback
                setTimeout(() => {
                  handleInterviewComplete(updated)
                }, 2000) // Small delay to ensure state is updated
              }
              
              setIsProcessing(false)
              return updated
            })
          })
          .catch((error) => {
            console.error('Error getting AI response:', error)
            setIsProcessing(false)
          })
      } else {
        console.error('ERROR: Transcript is empty, cannot call API')
        setIsProcessing(false)
      }
    }, 100) // Small delay to ensure state is updated
  }

  const handleInterviewComplete = async (finalTranscript: TranscriptMessage[]) => {
    if (isComplete) return // Prevent double completion
    setIsComplete(true)
    setIsProcessing(true)

    try {
      // Generate AI-powered feedback with SWOT analysis
      const feedback = await generateInterviewFeedback(
        finalTranscript,
        jobRole,
        jobLevel,
        language
      )

      if (sessionId) {
        await completeInterviewSession(sessionId, finalTranscript, feedback)
      }

      if (onComplete) {
        onComplete(feedback)
      }
    } catch (error) {
      console.error('Error generating feedback:', error)
      // Fallback feedback if AI generation fails
      const fallbackFeedback: InterviewFeedback = {
        strengths: ['Good technical knowledge', 'Clear communication'],
        weaknesses: ['Could go deeper on some topics'],
        opportunities: ['Further skill development', 'Advanced certifications'],
        threats: ['Competition in the field', 'Rapid technology changes'],
        recommendations: ['Practice system design', 'Study advanced patterns'],
        technical_score: 75,
        communication_score: 80,
        problem_solving_score: 70,
        overall_score: 75,
        overall_assessment: 'Solid candidate with room for growth.',
        swot_analysis: 'Candidate shows strong fundamentals but needs deeper technical expertise.',
      }
      
      if (sessionId) {
        await completeInterviewSession(sessionId, finalTranscript, fallbackFeedback)
      }
      
      if (onComplete) {
        onComplete(fallbackFeedback)
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const startListening = () => {
    if (recognitionRef.current && !isListening && !isProcessing) {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (synthRef.current) {
      synthRef.current.cancel()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-slate-800/90 border-2 border-neon-blue rounded-2xl p-6 shadow-[0_0_50px_rgba(0,255,255,0.3)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">AI Mock Interview</h1>
            <p className="text-gray-400">
              {jobRole} - {jobLevel.charAt(0).toUpperCase() + jobLevel.slice(1)} Level
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <PhoneOff size={24} />
            </button>
          )}
        </div>

        {/* Video Call Interface */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* User Video */}
          <div className="relative bg-slate-900 rounded-xl overflow-hidden aspect-video border-2 border-cyan-500/50">
            {isVideoEnabled ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User size={64} className="text-gray-600" />
              </div>
            )}
            <div className="absolute bottom-2 left-2 bg-black/70 px-3 py-1 rounded text-white text-sm">
              You
            </div>
          </div>

          {/* AI Avatar */}
          <div className="relative bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-xl overflow-hidden aspect-video border-2 border-purple-500/50 flex flex-col items-center justify-center">
            {/* AI Avatar Image or Fallback */}
            {GAME_ASSETS.interviewer ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={GAME_ASSETS.interviewer}
                  alt="AI Interviewer"
                  fill
                  className="object-contain p-4"
                  onError={(e) => {
                    // Fallback to icon if image fails
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
              </div>
            ) : (
              <div className="text-center">
                <Bot size={64} className="text-purple-400 mx-auto mb-2" />
                <p className="text-white font-semibold">AI Interviewer</p>
              </div>
            )}
            
            {/* Audio Waveform - Show when speaking */}
            {isSpeaking && !isMuted && (
              <div className="absolute bottom-12 left-0 right-0 px-4">
                <AudioWaveform isActive={isSpeaking} />
              </div>
            )}
            
            {/* Status Indicators */}
            <div className="absolute top-2 right-2 flex flex-col gap-2">
              {isProcessing && (
                <div className="bg-black/70 px-2 py-1 rounded flex items-center gap-2 text-purple-300 text-xs">
                  <Loader2 size={12} className="animate-spin" />
                  <span>Thinking...</span>
                </div>
              )}
              {isSpeaking && !isMuted && (
                <div className="bg-black/70 px-2 py-1 rounded flex items-center gap-2 text-cyan-300 text-xs">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                  <span>Speaking</span>
                </div>
              )}
            </div>
            
            <div className="absolute bottom-2 left-2 bg-black/70 px-3 py-1 rounded text-white text-sm">
              Interviewer
            </div>
          </div>
        </div>

        {/* Transcript */}
        <div className="bg-slate-900/50 rounded-xl p-4 mb-6 max-h-64 overflow-y-auto">
          <h3 className="text-white font-semibold mb-3">Conversation</h3>
          <div className="space-y-3">
            {transcript.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${
                  msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    msg.role === 'user'
                      ? 'bg-cyan-500 text-black'
                      : 'bg-purple-500 text-white'
                  }`}
                >
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div
                  className={`flex-1 rounded-lg p-3 ${
                    msg.role === 'user'
                      ? 'bg-cyan-500/20 text-cyan-100'
                      : 'bg-purple-500/20 text-purple-100'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full transition-all ${
              isVideoEnabled
                ? 'bg-cyan-500 hover:bg-cyan-600 text-black'
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
            title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
          </button>

          <button
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing || isComplete}
            className={`p-4 rounded-full transition-all ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                : 'bg-neon-blue hover:bg-cyan-600'
            } text-black font-bold disabled:opacity-50 disabled:cursor-not-allowed`}
            title={isListening ? 'Stop listening' : 'Start speaking'}
          >
            {isListening ? <MicOff size={24} /> : <Mic size={24} />}
          </button>

          <button
            onClick={toggleMute}
            className={`p-3 rounded-full transition-all ${
              isMuted
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
            title={isMuted ? 'Unmute AI' : 'Mute AI'}
          >
            <MicOff size={20} />
          </button>
        </div>

        {/* Status */}
        <div className="mt-4 text-center">
          {isListening && (
            <p className="text-cyan-400 animate-pulse">🎤 Listening...</p>
          )}
          {isProcessing && (
            <p className="text-purple-400 flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              Processing your answer...
            </p>
          )}
          {isComplete && (
            <p className="text-green-400">✅ Interview completed! Check your feedback.</p>
          )}
        </div>
      </div>
    </div>
  )
}

