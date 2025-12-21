'use client'

import { useState, useEffect } from 'react'
import { X, TrendingUp, TrendingDown, Calculator, Award } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { submitQuantAnswer, getPriceHistory } from '@/app/actions/market-actions'

interface QuantToolsProps {
  prices: any[]
  onClose: () => void
}

type QuestionType = 'volatility' | 'probability' | null

interface Question {
  type: QuestionType
  data: any
  correctAnswer: string | number
  explanation: string
}

export default function QuantTools({ prices, onClose }: QuantToolsProps) {
  const [showQuestion, setShowQuestion] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [userAnswer, setUserAnswer] = useState<string>('')
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [priceHistory, setPriceHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Generate a random question based on price data
  const generateQuestion = async () => {
    setLoading(true)
    try {
      // Select a random item type from current prices
      if (!prices || prices.length === 0) {
        alert('No price data available. Please wait for prices to load.')
        setLoading(false)
        return
      }

      const selectedItem = prices[Math.floor(Math.random() * prices.length)]
      const itemType = selectedItem.item_type
      const basePrice = selectedItem.current_price || selectedItem.base_price || 10

      // Generate realistic price history for this item (20 data points)
      const priceHistory: Array<{ time: number; price: number }> = []
      let currentPrice = basePrice

      // Start from the past and work forward to present
      for (let i = 0; i < 20; i++) {
        // Random walk: each step changes by -10% to +10%
        const change = (Math.random() - 0.5) * 0.2 // -10% to +10%
        currentPrice = currentPrice * (1 + change)
        // Ensure price doesn't go negative
        currentPrice = Math.max(0.01, currentPrice)
        priceHistory.push({
          time: i,
          price: Math.round(currentPrice * 100) / 100,
        })
      }
      
      console.log('Generated price history:', priceHistory)

      // Randomly select question type
      const questionType: QuestionType = Math.random() > 0.5 ? 'volatility' : 'probability'

      if (questionType === 'volatility') {
        // Calculate volatility (standard deviation) from price history
        const priceValues = priceHistory.map((p) => p.price)
        const mean = priceValues.reduce((a, b) => a + b, 0) / priceValues.length
        const variance = priceValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / priceValues.length
        const stdDev = Math.sqrt(variance)
        const volatility = mean > 0 ? (stdDev / mean) * 100 : 0 // Coefficient of variation as percentage

        const isHighVolatility = volatility > 15 // Threshold: >15% is high volatility
        const correctAnswer = isHighVolatility ? 'high' : 'low'

        setCurrentQuestion({
          type: 'volatility',
          data: {
            prices: priceHistory,
            itemType,
            volatility: volatility.toFixed(2),
            mean: mean.toFixed(2),
            stdDev: stdDev.toFixed(2),
          },
          correctAnswer,
          explanation: `Item: ${itemType}\nVolatility (Standard Deviation) = ${stdDev.toFixed(2)}\nCoefficient of Variation = ${volatility.toFixed(2)}%\n${isHighVolatility ? 'High volatility (>15%)' : 'Low volatility (≤15%)'}`,
        })
      } else {
        // Probability question: What's the probability of price going up?
        const priceValues = priceHistory.map((p) => p.price)
        const upMoves = priceValues.slice(1).filter((price, idx) => price > priceValues[idx]).length
        const totalMoves = priceValues.length - 1
        const probability = totalMoves > 0 ? (upMoves / totalMoves) * 100 : 0

        // Round to nearest 10% for easier answering
        const roundedProbability = Math.round(probability / 10) * 10
        const correctAnswer = roundedProbability

        setCurrentQuestion({
          type: 'probability',
          data: {
            prices: priceHistory,
            itemType,
            upMoves,
            totalMoves,
            probability: probability.toFixed(1),
          },
          correctAnswer,
          explanation: `Item: ${itemType}\nUp moves: ${upMoves}\nTotal moves: ${totalMoves}\nProbability = (${upMoves}/${totalMoves}) × 100 = ${probability.toFixed(1)}%\nRounded to nearest 10%: ${roundedProbability}%`,
        })
      }

      setShowQuestion(true)
      setShowResult(false)
      setUserAnswer('')
    } catch (error) {
      console.error('Error generating question:', error)
      alert('Failed to generate question. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!currentQuestion || !userAnswer) return

    let correct = false

    if (currentQuestion.type === 'volatility') {
      correct = userAnswer.toLowerCase() === currentQuestion.correctAnswer
    } else if (currentQuestion.type === 'probability') {
      const userNum = parseInt(userAnswer)
      correct = !isNaN(userNum) && userNum === currentQuestion.correctAnswer
    }

    setIsCorrect(correct)
    setShowResult(true)

    // Submit answer to server
    if (correct && currentQuestion.type) {
      const result = await submitQuantAnswer(currentQuestion.type, userAnswer, currentQuestion.correctAnswer)
      if (result.success) {
        // Show success message
        setTimeout(() => {
          alert(`✅ Correct! You earned a 10-minute fee discount (0% trading fee)!`)
        }, 500)
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-slate-900 border-2 border-neon-blue rounded-lg p-6 shadow-[0_0_50px_rgba(0,255,255,0.3)]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="mb-6">
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <Calculator className="text-neon-blue" size={32} />
            Quant Tools - Statistics Learning
          </h2>
          <p className="text-gray-400">Test your statistical knowledge with real market data!</p>
        </div>

        {!showQuestion ? (
          <div className="text-center py-8">
            <p className="text-white mb-6">Analyze market data and answer statistical questions!</p>
            <button
              onClick={generateQuestion}
              disabled={loading}
              className="px-6 py-3 bg-neon-blue text-black font-bold rounded-lg hover:bg-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating Question...' : 'Analyze Market'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {currentQuestion?.type === 'volatility' && (
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Question: Volatility Analysis</h3>
                <p className="text-gray-300 mb-4">
                  Based on the price chart below, is the volatility <strong>high</strong> or <strong>low</strong>?
                </p>

                <div className="bg-slate-800 rounded-lg p-4 mb-4">
                  <p className="text-gray-400 text-sm mb-2">Item: {currentQuestion.data.itemType}</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={currentQuestion.data.prices}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="time" 
                        stroke="#9CA3AF"
                        label={{ value: 'Time', position: 'insideBottom', offset: -5, style: { fill: '#9CA3AF' } }}
                      />
                      <YAxis 
                        stroke="#9CA3AF"
                        label={{ value: 'Price', angle: -90, position: 'insideLeft', style: { fill: '#9CA3AF' } }}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #3B82F6', color: '#fff' }}
                        formatter={(value: any) => [`$${value.toFixed(2)}`, 'Price']}
                      />
                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke="#00FFFF"
                        fill="#00FFFF"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setUserAnswer('high')}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                      userAnswer === 'high'
                        ? 'bg-neon-blue text-black'
                        : 'bg-slate-700 text-white hover:bg-slate-600'
                    }`}
                  >
                    High
                  </button>
                  <button
                    onClick={() => setUserAnswer('low')}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                      userAnswer === 'low'
                        ? 'bg-neon-blue text-black'
                        : 'bg-slate-700 text-white hover:bg-slate-600'
                    }`}
                  >
                    Low
                  </button>
                </div>
              </div>
            )}

            {currentQuestion?.type === 'probability' && (
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Question: Probability Analysis</h3>
                <p className="text-gray-300 mb-4">
                  Based on the price history, what is the probability (rounded to nearest 10%) of the price going{' '}
                  <strong>up</strong>?
                </p>

                <div className="bg-slate-800 rounded-lg p-4 mb-4">
                  {currentQuestion.data.itemType && (
                    <p className="text-gray-400 text-sm mb-2">Item: {currentQuestion.data.itemType}</p>
                  )}
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={currentQuestion.data.prices}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="time" 
                        stroke="#9CA3AF"
                        label={{ value: 'Time', position: 'insideBottom', offset: -5, style: { fill: '#9CA3AF' } }}
                      />
                      <YAxis 
                        stroke="#9CA3AF"
                        label={{ value: 'Price', angle: -90, position: 'insideLeft', style: { fill: '#9CA3AF' } }}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #3B82F6', color: '#fff' }}
                        formatter={(value: any) => [`$${value.toFixed(2)}`, 'Price']}
                      />
                      <Line type="monotone" dataKey="price" stroke="#00FFFF" strokeWidth={2} dot={{ fill: '#00FFFF', r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Enter probability (0-100)"
                    min="0"
                    max="100"
                    step="10"
                    className="flex-1 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-neon-blue"
                  />
                  <span className="text-white font-semibold">%</span>
                </div>
              </div>
            )}

            {showResult && (
              <div
                className={`p-4 rounded-lg border-2 ${
                  isCorrect
                    ? 'bg-green-900/30 border-green-500 text-green-400'
                    : 'bg-red-900/30 border-red-500 text-red-400'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {isCorrect ? (
                    <>
                      <Award size={24} />
                      <span className="font-bold">Correct!</span>
                    </>
                  ) : (
                    <>
                      <X size={24} />
                      <span className="font-bold">Incorrect</span>
                    </>
                  )}
                </div>
                <p className="text-sm whitespace-pre-line">{currentQuestion?.explanation}</p>
                {isCorrect && (
                  <p className="mt-2 text-sm font-semibold">
                    🎉 You earned a 10-minute fee discount (0% trading fee)!
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-4">
              {!showResult && (
                <button
                  onClick={handleSubmit}
                  disabled={!userAnswer}
                  className="flex-1 px-6 py-3 bg-neon-blue text-black font-bold rounded-lg hover:bg-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Answer
                </button>
              )}
              <button
                onClick={() => {
                  setShowQuestion(false)
                  setCurrentQuestion(null)
                  setShowResult(false)
                  setUserAnswer('')
                }}
                className="px-6 py-3 bg-slate-700 text-white font-bold rounded-lg hover:bg-slate-600 transition-all"
              >
                New Question
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

