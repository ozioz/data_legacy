'use client'

import { useState, useEffect, useRef } from 'react'
import { BarChart3, TrendingUp, PieChart, Map, Target, Check, X, AlertTriangle, ArrowLeft, Trash2 } from 'lucide-react'
import { MASCOTS, GAME_TYPES } from '@/lib/game/constants'
import StoryModal from '@/components/ui/StoryModal'
import VirtualCTO from '@/components/ui/VirtualCTO'
import { saveGameSession } from '@/app/actions/game-actions'
import { evaluateDashboardLayout } from '@/app/actions/arcade-actions'
import { useGameStore } from '@/lib/store/game-store'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface DashboardCanvasProps {
  level: any
  onComplete: (xp: number, gameResult?: { won: boolean; score: number }) => void
  onExit: () => void
  playerHero: { id: string; name: string; img: string } | null
}

type WidgetType = 'BAR_CHART' | 'LINE_CHART' | 'KPI_CARD' | 'PIE_CHART' | 'MAP' | null

interface Measure {
  id: string
  name: string
  formula: string
  type: 'numeric' | 'count' | 'average'
}

interface Dimension {
  id: string
  name: string
  type: 'date' | 'category' | 'geography'
}

interface DashboardWidget {
  id: string
  type: WidgetType
  measureId: string | null
  dimensionId: string | null
  title: string
  x: number
  y: number
  width: number
  height: number
}

interface BusinessQuestion {
  id: string
  question: string
  description: string
  recommendedWidget: WidgetType[]
  requiredMeasure: string
  requiredDimension?: string
}

const AVAILABLE_MEASURES: Measure[] = [
  { id: 'total_revenue', name: 'Total Revenue', formula: 'SUM(SalesAmount)', type: 'numeric' },
  { id: 'avg_order_value', name: 'Average Order Value', formula: 'DIVIDE(SUM(SalesAmount), COUNT(OrderID))', type: 'average' },
  { id: 'total_orders', name: 'Total Orders', formula: 'COUNT(OrderID)', type: 'count' },
  { id: 'avg_quantity', name: 'Average Quantity', formula: 'AVERAGE(Quantity)', type: 'average' },
]

const AVAILABLE_DIMENSIONS: Dimension[] = [
  { id: 'order_date', name: 'Order Date', type: 'date' },
  { id: 'product_category', name: 'Product Category', type: 'category' },
  { id: 'customer_country', name: 'Customer Country', type: 'geography' },
  { id: 'order_status', name: 'Order Status', type: 'category' },
]

const BUSINESS_QUESTIONS: BusinessQuestion[] = [
  {
    id: 'sales_trend',
    question: 'Sales Trend over Time',
    description: 'Show how sales have changed over the past 12 months',
    recommendedWidget: ['LINE_CHART', 'BAR_CHART'],
    requiredMeasure: 'total_revenue',
    requiredDimension: 'order_date',
  },
  {
    id: 'revenue_by_category',
    question: 'Revenue by Product Category',
    description: 'Compare revenue across different product categories',
    recommendedWidget: ['BAR_CHART', 'PIE_CHART'],
    requiredMeasure: 'total_revenue',
    requiredDimension: 'product_category',
  },
  {
    id: 'total_revenue_kpi',
    question: 'Total Revenue KPI',
    description: 'Display the total revenue as a key performance indicator',
    recommendedWidget: ['KPI_CARD'],
    requiredMeasure: 'total_revenue',
  },
  {
    id: 'revenue_by_country',
    question: 'Revenue by Country',
    description: 'Show revenue distribution across different countries',
    recommendedWidget: ['MAP', 'BAR_CHART'],
    requiredMeasure: 'total_revenue',
    requiredDimension: 'customer_country',
  },
]

const GRID_COLS = 4
const GRID_ROWS = 3
const CELL_SIZE = 150

// Generate dummy data for charts based on measure and dimension
function generateChartData(measureId: string, dimensionId: string | null, dimensionType: 'date' | 'category' | 'geography' | undefined) {
  if (dimensionType === 'date') {
    // Generate time series data (12 months)
    return Array.from({ length: 12 }, (_, i) => {
      const month = new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short' })
      const baseValue = measureId === 'total_revenue' ? 50000 : measureId === 'total_orders' ? 500 : measureId === 'avg_order_value' ? 100 : 10
      return {
        name: month,
        value: Math.floor(baseValue + Math.random() * baseValue * 0.5),
      }
    })
  } else if (dimensionType === 'category') {
    // Generate categorical data
    const categories = dimensionId === 'product_category' 
      ? ['Electronics', 'Clothing', 'Food', 'Books', 'Toys']
      : ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
    return categories.map((cat) => {
      const baseValue = measureId === 'total_revenue' ? 20000 : measureId === 'total_orders' ? 200 : measureId === 'avg_order_value' ? 80 : 5
      return {
        name: cat,
        value: Math.floor(baseValue + Math.random() * baseValue * 0.6),
      }
    })
  } else if (dimensionType === 'geography') {
    // Generate geographic data
    const countries = ['USA', 'UK', 'Germany', 'France', 'Japan', 'Canada']
    return countries.map((country) => {
      const baseValue = measureId === 'total_revenue' ? 30000 : measureId === 'total_orders' ? 300 : measureId === 'avg_order_value' ? 90 : 8
      return {
        name: country,
        value: Math.floor(baseValue + Math.random() * baseValue * 0.5),
      }
    })
  } else {
    // No dimension - single value for KPI
    const baseValue = measureId === 'total_revenue' ? 500000 : measureId === 'total_orders' ? 5000 : measureId === 'avg_order_value' ? 100 : 50
    return [{ name: 'Total', value: Math.floor(baseValue + Math.random() * baseValue * 0.2) }]
  }
}

// Chart Colors
const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function DashboardCanvas({ level, onComplete, onExit, playerHero }: DashboardCanvasProps) {
  const { saveStageResult, syncProjectStateToDB } = useGameStore()
  const [widgets, setWidgets] = useState<DashboardWidget[]>([])
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null)
  const [draggedMeasure, setDraggedMeasure] = useState<string | null>(null)
  const [draggedDimension, setDraggedDimension] = useState<string | null>(null)
  const [businessQuestions, setBusinessQuestions] = useState<BusinessQuestion[]>(BUSINESS_QUESTIONS)
  const [status, setStatus] = useState<'PLAYING' | 'WON' | 'ERROR'>('PLAYING')
  const [message, setMessage] = useState('')
  const [aiFeedback, setAiFeedback] = useState<string | null>(null)
  const [showDebriefing, setShowDebriefing] = useState(false)
  const [startTime] = useState(Date.now())
  const [readabilityScore, setReadabilityScore] = useState<number | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  const handleAddWidget = (type: WidgetType) => {
    const newWidget: DashboardWidget = {
      id: `widget-${Date.now()}`,
      type,
      measureId: null,
      dimensionId: null,
      title: '',
      x: 0,
      y: 0,
      width: 2,
      height: 2,
    }
    setWidgets([...widgets, newWidget])
    setSelectedWidget(newWidget.id)
  }

  const handleDropOnWidget = (widgetId: string) => {
    const widget = widgets.find((w) => w.id === widgetId)
    if (!widget) return

    const updates: Partial<DashboardWidget> = {}

    if (draggedMeasure) {
      updates.measureId = draggedMeasure
      const measure = AVAILABLE_MEASURES.find((m) => m.id === draggedMeasure)
      if (measure && !widget.title) {
        updates.title = measure.name
      }
    }

    if (draggedDimension) {
      updates.dimensionId = draggedDimension
    }

    setWidgets(widgets.map((w) => (w.id === widgetId ? { ...w, ...updates } : w)))
    setDraggedMeasure(null)
    setDraggedDimension(null)
    setMessage('')
  }

  const handleRemoveWidget = (widgetId: string) => {
    setWidgets(widgets.filter((w) => w.id !== widgetId))
    if (selectedWidget === widgetId) {
      setSelectedWidget(null)
    }
  }

  const handleEvaluateDashboard = async () => {
    if (widgets.length < 4) {
      setStatus('ERROR')
      setMessage('You need at least 4 widgets to complete the dashboard.')
      return
    }

    // Check if all widgets have measures
    const incompleteWidgets = widgets.filter((w) => !w.measureId)
    if (incompleteWidgets.length > 0) {
      setStatus('ERROR')
      setMessage('All widgets must have a measure assigned.')
      return
    }

    // Check if all business questions are answered
    const answeredQuestions = businessQuestions.filter((q) => {
      return widgets.some((w) => {
        const measureMatch = w.measureId === q.requiredMeasure
        const dimensionMatch = !q.requiredDimension || w.dimensionId === q.requiredDimension
        return measureMatch && dimensionMatch
      })
    })

    if (answeredQuestions.length < businessQuestions.length) {
      setStatus('ERROR')
      setMessage(`You need to answer all ${businessQuestions.length} business questions.`)
      return
    }

    // AI Evaluation
    setMessage('Evaluating dashboard with AI...')
    const evaluation = await evaluateDashboardLayout(
      widgets.map((w) => ({
        type: w.type || 'UNKNOWN',
        measureId: w.measureId,
        dimensionId: w.dimensionId,
      })),
      AVAILABLE_MEASURES,
      AVAILABLE_DIMENSIONS,
      businessQuestions.map((q) => ({
        question: q.question,
        recommendedWidget: q.recommendedWidget.filter((w) => w !== null).map((w) => w as string),
        requiredMeasure: q.requiredMeasure,
        requiredDimension: q.requiredDimension,
      }))
    )
    
    setReadabilityScore(evaluation.score)
    setAiFeedback(evaluation.feedback)

    if (evaluation.score >= 70) {
      setStatus('WON')
      setMessage(`Dashboard validated! Readability Score: ${evaluation.score}%`)
      setShowDebriefing(true)
    } else {
      setStatus('ERROR')
      setMessage(`Dashboard needs improvement. Score: ${evaluation.score}%. ${evaluation.feedback}`)
    }
  }

  const handleComplete = async () => {
    const duration = Math.floor((Date.now() - startTime) / 1000)
    const won = status === 'WON'
    
    // Calculate business value score
    const businessValue = won && readabilityScore ? readabilityScore : 0
    
    // Save stage result (Stage 4: Reporting)
    saveStageResult(4, won ? 100 : 0, won, businessValue)
    await syncProjectStateToDB()

    await saveGameSession({
      gameType: 'DASHBOARD',
      levelId: level.id,
      score: won ? 100 : 0,
      duration,
      won,
      xpEarned: level.xpReward,
      gameConfig: {
        widgetCount: widgets.length,
        readabilityScore,
        businessValue,
      },
    })

    setShowDebriefing(false)
    onComplete(level.xpReward, { won, score: won ? 100 : 0 })
  }

  const getWidgetIcon = (type: WidgetType) => {
    switch (type) {
      case 'BAR_CHART':
        return <BarChart3 size={24} />
      case 'LINE_CHART':
        return <TrendingUp size={24} />
      case 'KPI_CARD':
        return <Target size={24} />
      case 'PIE_CHART':
        return <PieChart size={24} />
      case 'MAP':
        return <Map size={24} />
      default:
        return null
    }
  }

  const getWidgetColor = (type: WidgetType) => {
    switch (type) {
      case 'BAR_CHART':
        return 'bg-blue-500/20 border-blue-500'
      case 'LINE_CHART':
        return 'bg-green-500/20 border-green-500'
      case 'KPI_CARD':
        return 'bg-purple-500/20 border-purple-500'
      case 'PIE_CHART':
        return 'bg-yellow-500/20 border-yellow-500'
      case 'MAP':
        return 'bg-red-500/20 border-red-500'
      default:
        return 'bg-slate-700 border-slate-600'
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col text-white p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
            Dashboard Canvas
          </h1>
          <p className="text-gray-400 text-sm">Build a Data Visualization Dashboard</p>
        </div>
        <button
          onClick={onExit}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-all flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Back
        </button>
      </div>

      {/* Business Questions */}
      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-lg p-4 mb-4">
        <h2 className="text-lg font-bold mb-3 text-green-300">Business Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {businessQuestions.map((q) => {
            const isAnswered = widgets.some((w) => {
              const measureMatch = w.measureId === q.requiredMeasure
              const dimensionMatch = !q.requiredDimension || w.dimensionId === q.requiredDimension
              return measureMatch && dimensionMatch
            })
            return (
              <div
                key={q.id}
                className={`p-3 rounded-lg border ${
                  isAnswered ? 'bg-green-500/20 border-green-500' : 'bg-slate-800 border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <h3 className="text-sm font-bold">{q.question}</h3>
                  {isAnswered && <Check size={16} className="text-green-400 flex-shrink-0" />}
                </div>
                <p className="text-xs text-gray-400">{q.description}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <div
          className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 mb-4 ${
            status === 'WON'
              ? 'bg-green-500 text-black'
              : status === 'ERROR'
                ? 'bg-red-500 text-white'
                : 'bg-yellow-500 text-black'
          }`}
        >
          {status === 'WON' ? <Check /> : status === 'ERROR' ? <X /> : <AlertTriangle />}
          {message}
        </div>
      )}

      {/* AI Feedback */}
      {aiFeedback && (
        <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <BarChart3 className="text-blue-400 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-blue-300 mb-1">AI Feedback</h3>
              <p className="text-sm text-gray-300">{aiFeedback}</p>
              {readabilityScore !== null && (
                <p className="text-xs text-gray-400 mt-2">Readability Score: {readabilityScore}%</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left Panel: Measures & Dimensions */}
        <div className="lg:col-span-1 bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h3 className="text-lg font-bold mb-4 text-cyan-400">Measures</h3>
          <div className="space-y-2 mb-6">
            {AVAILABLE_MEASURES.map((measure) => (
              <div
                key={measure.id}
                draggable
                onDragStart={() => setDraggedMeasure(measure.id)}
                className="bg-cyan-500/20 border border-cyan-500 p-2 rounded cursor-move hover:bg-cyan-500/30 transition-all"
              >
                <div className="font-bold text-sm text-cyan-300">{measure.name}</div>
                <div className="text-xs text-gray-400 font-mono">{measure.formula}</div>
              </div>
            ))}
          </div>

          <h3 className="text-lg font-bold mb-4 text-purple-400">Dimensions</h3>
          <div className="space-y-2">
            {AVAILABLE_DIMENSIONS.map((dimension) => (
              <div
                key={dimension.id}
                draggable
                onDragStart={() => setDraggedDimension(dimension.id)}
                className="bg-purple-500/20 border border-purple-500 p-2 rounded cursor-move hover:bg-purple-500/30 transition-all"
              >
                <div className="font-bold text-sm text-purple-300">{dimension.name}</div>
                <div className="text-xs text-gray-400">{dimension.type}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Center Panel: Dashboard Canvas */}
        <div className="lg:col-span-2 bg-slate-800 rounded-lg p-4 border border-slate-700 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-green-400">Dashboard Canvas</h3>
            <div className="flex gap-2">
              <button
                onClick={() => handleAddWidget('BAR_CHART')}
                className="px-3 py-1 bg-blue-500/20 border border-blue-500 rounded text-sm hover:bg-blue-500/30 transition-all"
                title="Add Bar Chart"
              >
                <BarChart3 size={16} className="inline" />
              </button>
              <button
                onClick={() => handleAddWidget('LINE_CHART')}
                className="px-3 py-1 bg-green-500/20 border border-green-500 rounded text-sm hover:bg-green-500/30 transition-all"
                title="Add Line Chart"
              >
                <TrendingUp size={16} className="inline" />
              </button>
              <button
                onClick={() => handleAddWidget('KPI_CARD')}
                className="px-3 py-1 bg-purple-500/20 border border-purple-500 rounded text-sm hover:bg-purple-500/30 transition-all"
                title="Add KPI Card"
              >
                <Target size={16} className="inline" />
              </button>
              <button
                onClick={() => handleAddWidget('PIE_CHART')}
                className="px-3 py-1 bg-yellow-500/20 border border-yellow-500 rounded text-sm hover:bg-yellow-500/30 transition-all"
                title="Add Pie Chart"
              >
                <PieChart size={16} className="inline" />
              </button>
              <button
                onClick={() => handleAddWidget('MAP')}
                className="px-3 py-1 bg-red-500/20 border border-red-500 rounded text-sm hover:bg-red-500/30 transition-all"
                title="Add Map"
              >
                <Map size={16} className="inline" />
              </button>
            </div>
          </div>

          <div
            ref={canvasRef}
            className="flex-1 min-h-[500px] bg-slate-900/50 rounded-lg border-2 border-dashed border-slate-600 p-4 relative overflow-auto"
            onDrop={(e) => {
              e.preventDefault()
              if (selectedWidget && (draggedMeasure || draggedDimension)) {
                handleDropOnWidget(selectedWidget)
              }
            }}
            onDragOver={(e) => {
              e.preventDefault()
            }}
          >
            {widgets.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <BarChart3 size={48} className="mx-auto mb-2 opacity-50" />
                  <p>Add widgets to start building your dashboard</p>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-full">
                {widgets.map((widget) => {
                  const measure = AVAILABLE_MEASURES.find((m) => m.id === widget.measureId)
                  const dimension = AVAILABLE_DIMENSIONS.find((d) => d.id === widget.dimensionId)
                  
                  return (
                    <div
                      key={widget.id}
                      className={`absolute p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedWidget === widget.id ? 'ring-2 ring-cyan-400' : ''
                      } ${getWidgetColor(widget.type)}`}
                      style={{
                        left: `${widget.x * CELL_SIZE}px`,
                        top: `${widget.y * CELL_SIZE}px`,
                        width: `${widget.width * CELL_SIZE}px`,
                        height: `${widget.height * CELL_SIZE}px`,
                      }}
                      onClick={() => setSelectedWidget(widget.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getWidgetIcon(widget.type)}
                          <span className="text-xs font-bold">
                            {widget.type?.replace('_', ' ') || 'Empty Widget'}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveWidget(widget.id)
                          }}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      {measure && (
                        <div className="text-xs text-gray-300 mb-1">
                          <strong>Measure:</strong> {measure.name}
                        </div>
                      )}
                      {dimension && (
                        <div className="text-xs text-gray-300">
                          <strong>Dimension:</strong> {dimension.name}
                        </div>
                      )}
                      {!measure && !dimension && (
                        <div className="text-xs text-gray-500 italic mt-2">
                          Drop measure/dimension here
                        </div>
                      )}

                      {/* Render Actual Chart with Recharts */}
                      {measure && widget.type && (
                        <div className="mt-2 h-full flex-1 min-h-[100px]">
                          {widget.type === 'LINE_CHART' && dimension && (
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={generateChartData(measure.id, dimension.id, dimension.type)}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} />
                                <YAxis stroke="#9ca3af" fontSize={10} />
                                <Tooltip
                                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '6px' }}
                                  labelStyle={{ color: '#f3f4f6' }}
                                />
                                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 3 }} />
                              </LineChart>
                            </ResponsiveContainer>
                          )}

                          {widget.type === 'BAR_CHART' && dimension && (
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={generateChartData(measure.id, dimension.id, dimension.type)}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} />
                                <YAxis stroke="#9ca3af" fontSize={10} />
                                <Tooltip
                                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '6px' }}
                                  labelStyle={{ color: '#f3f4f6' }}
                                />
                                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          )}

                          {widget.type === 'PIE_CHART' && dimension && (
                            <ResponsiveContainer width="100%" height="100%">
                              <RechartsPieChart>
                                <Pie
                                  data={generateChartData(measure.id, dimension.id, dimension.type)}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                  outerRadius={60}
                                  fill="#8884d8"
                                  dataKey="value"
                                >
                                  {generateChartData(measure.id, dimension.id, dimension.type).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip
                                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '6px' }}
                                  labelStyle={{ color: '#f3f4f6' }}
                                />
                              </RechartsPieChart>
                            </ResponsiveContainer>
                          )}

                          {widget.type === 'KPI_CARD' && (
                            <div className="flex flex-col items-center justify-center h-full">
                              <div className="text-3xl font-bold text-green-400">
                                {generateChartData(measure.id, null, undefined)[0].value.toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-400 mt-2">{measure.name}</div>
                            </div>
                          )}

                          {widget.type === 'MAP' && dimension && (
                            <div className="flex flex-col items-center justify-center h-full">
                              <Map size={48} className="text-blue-400 mb-2 opacity-50" />
                              <div className="text-xs text-gray-400 text-center">
                                {generateChartData(measure.id, dimension.id, dimension.type).map((item, idx) => (
                                  <div key={idx} className="mb-1">
                                    {item.name}: {item.value.toLocaleString()}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Instructions & Validate */}
        <div className="lg:col-span-1 bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h3 className="text-lg font-bold mb-4 text-yellow-400">Instructions</h3>
          <div className="space-y-3 text-sm text-gray-300 mb-6">
            <div>
              <strong className="text-yellow-300">1. Add Widgets:</strong>
              <p className="text-xs text-gray-400 mt-1">Click widget buttons to add to canvas</p>
            </div>
            <div>
              <strong className="text-yellow-300">2. Assign Data:</strong>
              <p className="text-xs text-gray-400 mt-1">Drag measures and dimensions onto widgets</p>
            </div>
            <div>
              <strong className="text-yellow-300">3. Answer Questions:</strong>
              <p className="text-xs text-gray-400 mt-1">Each business question needs a widget</p>
            </div>
            <div>
              <strong className="text-yellow-300">4. Validate:</strong>
              <p className="text-xs text-gray-400 mt-1">AI will evaluate your dashboard</p>
            </div>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-3 mb-4">
            <div className="text-xs text-gray-400 mb-1">Widget Count</div>
            <div className="text-2xl font-bold text-green-400">{widgets.length} / 4</div>
          </div>

          <button
            onClick={handleEvaluateDashboard}
            disabled={widgets.length < 4}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-500 disabled:bg-slate-700 disabled:text-gray-500 transition-all flex items-center justify-center gap-2 font-bold"
          >
            <Check size={18} />
            Evaluate Dashboard
          </button>
        </div>
      </div>

      {/* Debriefing Modal */}
      <StoryModal
        isOpen={showDebriefing}
        type="debriefing"
        topic="Dashboard Complete"
        story={
          status === 'WON'
            ? `Your dashboard has been validated with a readability score of ${readabilityScore}%! The CEO is impressed with your data visualization skills.`
            : 'The dashboard needs improvements. Review the AI feedback and try again.'
        }
        mascot={MASCOTS.query}
        levelName={level.name}
        onClose={() => {
          setShowDebriefing(false)
        }}
        onAction={handleComplete}
        actionLabel="COMPLETE PROJECT"
      />

      {/* Virtual CTO Companion */}
      <VirtualCTO
        currentStage={4}
        gameContext={{
          gameType: GAME_TYPES.DASHBOARD,
          status: status === 'WON' ? 'SUCCESS' : status === 'ERROR' ? 'ERROR' : 'IDLE',
          metricValue: readabilityScore ?? undefined,
        }}
      />
    </div>
  )
}

