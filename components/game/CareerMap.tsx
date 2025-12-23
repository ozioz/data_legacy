'use client'

import { useEffect, useState } from 'react'
import { Lock, Play, Check, ArrowRight, Home, Database, Layers, Zap, BarChart3, AlertCircle } from 'lucide-react'
import { useGameStore, ProjectState } from '@/lib/store/game-store'
import { motion } from 'framer-motion'
import VirtualCTO from '@/components/ui/VirtualCTO'

interface CareerMapProps {
  hero: { id: string; name: string; img: string }
  path: string
  unlockedLevels: string[]
  onLevelSelect: (level: any) => void
  onHome: () => void
  isGuest?: boolean
}

const PROJECT_STAGES = [
  {
    id: 1,
    name: 'Source Ingestion',
    description: 'Extract and clean raw data from multiple sources',
    icon: Database,
    gameType: 'PIPELINE',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500',
  },
  {
    id: 2,
    name: 'Data Modeling',
    description: 'Build dimensional models using Kimball methodology',
    icon: Layers,
    gameType: 'QUERY',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500',
  },
  {
    id: 3,
    name: 'Semantic Layer',
    description: 'Create business-friendly data definitions',
    icon: Zap,
    gameType: 'METRIC_LAB',
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500',
  },
  {
    id: 4,
    name: 'Reporting',
    description: 'Deliver insights and business value',
    icon: BarChart3,
    gameType: 'DASHBOARD',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500',
  },
]

export default function CareerMap({
  hero,
  path,
  unlockedLevels,
  onLevelSelect,
  onHome,
  isGuest = false,
}: CareerMapProps) {
  const { projectState, loadProjectStateFromDB } = useGameStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadState = async () => {
      await loadProjectStateFromDB()
      setIsLoading(false)
    }
    loadState()
  }, [loadProjectStateFromDB])

  const getStageStatus = (stageId: number) => {
    const isCompleted = projectState.stages_completed.includes(stageId)
    const isUnlocked = stageId === 1 || projectState.stages_completed.includes(stageId - 1)
    const isCurrent = projectState.current_stage === stageId && !isCompleted

    return { isCompleted, isUnlocked, isCurrent }
  }

  const getStageMetric = (stageId: number): number => {
    switch (stageId) {
      case 1:
        return projectState.raw_data_quality
      case 2:
        return projectState.model_integrity
      case 3:
        return projectState.semantic_layer_score
      case 4:
        return projectState.business_value
      default:
        return 0
    }
  }

  const handleStageClick = (stage: typeof PROJECT_STAGES[0]) => {
    const { isUnlocked, isCompleted } = getStageStatus(stage.id)
    
    if (!isUnlocked) return
    
    // Map stage to level (for now, use PipelinePuzzle for Stage 1, QueryMaster for Stage 2)
    const levelMap: { [key: number]: any } = {
      1: {
        id: 'PROJECT_GENESIS_1',
        name: 'Source Ingestion',
        gameType: 'PIPELINE',
        xpReward: 100,
        scenario: 'Extract and clean raw data from multiple sources',
        config: {
          sequence: ['API', 'PYTHON_CLEAN', 'WAREHOUSE'],
          extra: ['CSV', 'JSON', 'DATABASE'],
        },
      },
      2: {
        id: 'PROJECT_GENESIS_2',
        name: 'Data Modeling',
        gameType: 'KIMBALL',
        xpReward: 150,
        scenario: 'Build dimensional models using Kimball methodology',
        config: {},
      },
      3: {
        id: 'PROJECT_GENESIS_3',
        name: 'Semantic Layer',
        gameType: 'METRIC_LAB',
        xpReward: 200,
        scenario: 'Create business measures using block-based formulas',
        config: {},
      },
      4: {
        id: 'PROJECT_GENESIS_4',
        name: 'Reporting',
        gameType: 'DASHBOARD',
        xpReward: 250,
        scenario: 'Build a data visualization dashboard',
        config: {},
      },
    }
    
    const level = levelMap[stage.id]
    if (level) {
      onLevelSelect(level)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Project Genesis...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center p-4 relative overflow-hidden pt-20 sm:pt-4">
      {/* Background Effects */}
      <div className="fixed inset-0 grid-bg opacity-10 pointer-events-none z-0"></div>
      
      {/* Guest Mode Banner */}
      {isGuest && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500/20 border-b border-yellow-500/50 p-3 text-center">
          <p className="text-yellow-300 text-sm">
            <AlertCircle className="inline mr-2" size={16} />
            Guest Mode: Progress will not be saved
          </p>
        </div>
      )}

      {/* Header */}
      <div className="z-20 w-full max-w-6xl mb-8 relative px-4 mt-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
              Project Genesis
            </h1>
            <p className="text-gray-400">End-to-End Data Project Simulation</p>
          </div>
          <button
            onClick={onHome}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-all flex items-center gap-2"
          >
            <Home size={18} />
            <span className="hidden sm:inline">Home</span>
          </button>
        </div>

        {/* Project Metrics Dashboard */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/50 rounded-lg p-6 shadow-[0_0_20px_rgba(6,182,212,0.1)] mb-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="text-cyan-400" size={20} />
            <span>Project Metrics</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PROJECT_STAGES.map((stage) => {
              const metric = getStageMetric(stage.id)
              const { isCompleted } = getStageStatus(stage.id)
              return (
                <div key={stage.id} className="text-center">
                  <div className="text-xs text-gray-400 uppercase mb-1">{stage.name}</div>
                  <div className={`text-2xl font-bold ${isCompleted ? 'text-green-400' : 'text-gray-500'}`}>
                    {metric}%
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Pipeline Visualization */}
      <div className="z-10 w-full max-w-6xl relative px-4">
        <div className="relative">
          {/* Connecting Lines */}
          <div className="absolute top-1/2 left-0 right-0 h-1 z-0 hidden md:block">
            {PROJECT_STAGES.slice(0, -1).map((stage, index) => {
              const nextStage = PROJECT_STAGES[index + 1]
              const { isCompleted } = getStageStatus(stage.id)
              const nextUnlocked = nextStage.id === 1 || projectState.stages_completed.includes(nextStage.id - 1)
              
              return (
                <div
                  key={`line-${stage.id}`}
                  className="absolute h-full"
                  style={{
                    left: `${(index + 1) * 25}%`,
                    width: '25%',
                  }}
                >
                  <div
                    className={`h-full transition-all duration-500 ${
                      isCompleted && nextUnlocked
                        ? 'bg-gradient-to-r from-green-500 to-green-400'
                        : 'bg-slate-700'
                    }`}
                    style={{
                      boxShadow: isCompleted && nextUnlocked
                        ? '0 0 10px rgba(34, 197, 94, 0.5)'
                        : 'none',
                    }}
                  />
                </div>
              )
            })}
          </div>

          {/* Stage Nodes */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4 relative z-10">
            {PROJECT_STAGES.map((stage, index) => {
              const { isCompleted, isUnlocked, isCurrent } = getStageStatus(stage.id)
              const metric = getStageMetric(stage.id)
              const Icon = stage.icon

              return (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col items-center"
                >
                  {/* Stage Card */}
                  <button
                    onClick={() => handleStageClick(stage)}
                    disabled={!isUnlocked}
                    className={`
                      w-full max-w-xs md:max-w-none relative group
                      ${isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
                    `}
                  >
                    <div
                      className={`
                        relative p-6 rounded-xl border-2 transition-all duration-300
                        ${isCompleted
                          ? `${stage.bgColor} ${stage.borderColor} border-opacity-100 shadow-[0_0_30px_rgba(34,197,94,0.3)]`
                          : isCurrent
                            ? `${stage.bgColor} ${stage.borderColor} border-opacity-70 shadow-[0_0_20px_rgba(6,182,212,0.2)] animate-pulse`
                            : isUnlocked
                              ? 'bg-slate-800 border-slate-700 hover:border-slate-600'
                              : 'bg-slate-900 border-slate-800'
                        }
                      `}
                    >
                      {/* Status Badge */}
                      <div className="absolute -top-3 -right-3 z-20">
                        {isCompleted ? (
                          <div className="w-10 h-10 rounded-full bg-green-500 border-4 border-slate-900 flex items-center justify-center shadow-lg">
                            <Check size={20} className="text-white" />
                          </div>
                        ) : isCurrent ? (
                          <div className="w-10 h-10 rounded-full bg-cyan-500 border-4 border-slate-900 flex items-center justify-center shadow-lg animate-pulse">
                            <Play size={20} className="text-white ml-0.5" />
                          </div>
                        ) : isUnlocked ? (
                          <div className="w-10 h-10 rounded-full bg-slate-700 border-4 border-slate-900 flex items-center justify-center">
                            <Play size={20} className="text-gray-400 ml-0.5" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-800 border-4 border-slate-900 flex items-center justify-center">
                            <Lock size={20} className="text-gray-600" />
                          </div>
                        )}
                      </div>

                      {/* Icon */}
                      <div
                        className={`
                          w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center
                          bg-gradient-to-br ${stage.color}
                          ${isCompleted ? 'shadow-[0_0_20px_rgba(34,197,94,0.4)]' : ''}
                        `}
                      >
                        <Icon size={32} className="text-white" />
                      </div>

                      {/* Stage Info */}
                      <h3
                        className={`
                          text-xl font-bold text-center mb-2
                          ${isCompleted ? 'text-green-400' : isCurrent ? 'text-cyan-400' : 'text-gray-300'}
                        `}
                      >
                        {stage.name}
                      </h3>
                      <p className="text-sm text-gray-400 text-center mb-4">{stage.description}</p>

                      {/* Metric Display */}
                      {isCompleted && (
                        <div className="mt-4 pt-4 border-t border-slate-700">
                          <div className="text-xs text-gray-400 uppercase mb-1">Quality Score</div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-700 rounded-full h-2">
                              <div
                                className={`bg-gradient-to-r ${stage.color} h-2 rounded-full transition-all duration-500`}
                                style={{ width: `${metric}%` }}
                              />
                            </div>
                            <span className="text-sm font-bold text-green-400">{metric}%</span>
                          </div>
                        </div>
                      )}

                      {/* Hover Effect */}
                      {isUnlocked && (
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      )}
                    </div>
                  </button>

                  {/* Stage Number */}
                  <div className="mt-4 text-sm text-gray-500 font-mono">Stage {stage.id}</div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 p-4 bg-slate-800/50 border border-slate-700 rounded-lg text-center">
          <p className="text-sm text-gray-400">
            Complete each stage sequentially to unlock the next. Your progress is tracked across the entire project pipeline.
          </p>
        </div>
      </div>
    </div>
  )
}
