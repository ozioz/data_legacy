'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, RotateCcw, TrendingDown, Award } from 'lucide-react'

interface GradientGameProps {
  onComplete?: () => void
}

export default function GradientGame({ onComplete }: GradientGameProps) {
  const [learningRate, setLearningRate] = useState(0.1)
  const [ballPosition, setBallPosition] = useState(0.5) // 0 to 1 (x position on curve)
  const [isAnimating, setIsAnimating] = useState(false)
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [result, setResult] = useState<'success' | 'oscillating' | 'stuck' | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)

  // Loss function: f(x) = (x - 0.5)^2 + 0.1*sin(10*x) (has local minima)
  const lossFunction = (x: number): number => {
    // Global minimum at x ≈ 0.5
    return Math.pow(x - 0.5, 2) + 0.1 * Math.sin(10 * x) + 0.2
  }

  // Draw loss function curve
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 800
    canvas.height = 400

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.1)'
    ctx.lineWidth = 1
    for (let x = 0; x < canvas.width; x += 50) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }
    for (let y = 0; y < canvas.height; y += 50) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // Draw loss function curve
    ctx.strokeStyle = '#A855F7'
    ctx.lineWidth = 3
    ctx.beginPath()

    const points: Array<{ x: number; y: number }> = []
    for (let i = 0; i <= canvas.width; i++) {
      const x = i / canvas.width
      const loss = lossFunction(x)
      const y = canvas.height - (loss * canvas.height * 2) // Scale to fit
      points.push({ x: i, y })
    }

    // Draw curve
    ctx.beginPath()
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y)
      } else {
        ctx.lineTo(point.x, point.y)
      }
    })
    ctx.stroke()

    // Highlight global minimum
    const minX = 0.5
    const minY = canvas.height - lossFunction(minX) * canvas.height * 2
    ctx.fillStyle = 'rgba(34, 197, 94, 0.3)'
    ctx.beginPath()
    ctx.arc(minX * canvas.width, minY, 8, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#22C55E'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(minX * canvas.width, minY, 8, 0, Math.PI * 2)
    ctx.stroke()

    // Draw ball
    const ballX = ballPosition * canvas.width
    const ballY = canvas.height - lossFunction(ballPosition) * canvas.height * 2
    ctx.fillStyle = '#FBBF24'
    ctx.beginPath()
    ctx.arc(ballX, ballY, 10, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#F59E0B'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(ballX, ballY, 10, 0, Math.PI * 2)
    ctx.stroke()

    // Draw gradient arrow (direction of descent)
    if (ballPosition > 0 && ballPosition < 1) {
      const gradient = 2 * (ballPosition - 0.5) + 0.1 * 10 * Math.cos(10 * ballPosition)
      const arrowLength = Math.min(50, Math.abs(gradient) * 100)
      const direction = gradient > 0 ? 1 : -1

      ctx.strokeStyle = '#60A5FA'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(ballX, ballY)
      ctx.lineTo(ballX + arrowLength * direction, ballY)
      ctx.stroke()

      // Arrowhead
      ctx.fillStyle = '#60A5FA'
      ctx.beginPath()
      ctx.moveTo(ballX + arrowLength * direction, ballY)
      ctx.lineTo(ballX + arrowLength * direction - 8 * direction, ballY - 4)
      ctx.lineTo(ballX + arrowLength * direction - 8 * direction, ballY + 4)
      ctx.closePath()
      ctx.fill()
    }

    // Draw axes labels
    ctx.fillStyle = '#9CA3AF'
    ctx.font = '12px monospace'
    ctx.textAlign = 'left'
    ctx.fillText('x (Parameter)', 10, canvas.height - 10)
    ctx.save()
    ctx.translate(15, canvas.height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('Loss', 0, 0)
    ctx.restore()
  }, [ballPosition])

  const train = () => {
    if (isAnimating) return

    setIsAnimating(true)
    setResult(null)

    let currentX = ballPosition
    let previousX = currentX
    let iterations = 0
    const maxIterations = 100
    const threshold = 0.01 // Success threshold (distance from minimum)
    const oscillationThreshold = 0.05 // Oscillation detection

    const animate = () => {
      iterations++

      // Calculate gradient (derivative of loss function)
      const gradient = 2 * (currentX - 0.5) + 0.1 * 10 * Math.cos(10 * currentX)

      // Update position using gradient descent
      previousX = currentX
      currentX = currentX - learningRate * gradient

      // Clamp to [0, 1]
      currentX = Math.max(0, Math.min(1, currentX))

      setBallPosition(currentX)

      // Check conditions
      const distanceFromMin = Math.abs(currentX - 0.5)
      const loss = lossFunction(currentX)

      // Check for oscillation
      if (iterations > 10 && Math.abs(currentX - previousX) < oscillationThreshold && distanceFromMin > threshold) {
        setResult('stuck')
        setIsAnimating(false)
        return
      }

      // Check for success
      if (distanceFromMin < threshold) {
        setResult('success')
        setScore(score + 100)
        setIsAnimating(false)
        setTimeout(() => {
          setLevel(level + 1)
          setBallPosition(0.5 + (Math.random() - 0.5) * 0.4) // Random starting position
        }, 2000)
        return
      }

      // Check for oscillation (learning rate too high)
      if (iterations > 20 && Math.abs(currentX - previousX) > 0.1) {
        setResult('oscillating')
        setIsAnimating(false)
        return
      }

      // Continue animation
      if (iterations < maxIterations) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        // Timeout - didn't converge
        if (distanceFromMin < 0.1) {
          setResult('success')
          setScore(score + 50)
        } else {
          setResult('stuck')
        }
        setIsAnimating(false)
      }
    }

    animate()
  }

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  const reset = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    setIsAnimating(false)
    setBallPosition(0.5 + (Math.random() - 0.5) * 0.4) // Random starting position
    setResult(null)
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Gradient Descent</h2>
          <p className="text-gray-400">Optimize the learning rate to find the global minimum</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-gray-400 text-sm">Level</p>
            <p className="text-2xl font-bold text-purple-400">{level}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">Score</p>
            <p className="text-2xl font-bold text-purple-400">{score}</p>
          </div>
        </div>
      </div>

      {/* Result Message */}
      {result && (
        <div
          className={`mb-4 p-4 rounded-lg border-2 ${
            result === 'success'
              ? 'bg-green-900/30 border-green-500 text-green-400'
              : result === 'oscillating'
              ? 'bg-red-900/30 border-red-500 text-red-400'
              : 'bg-yellow-900/30 border-yellow-500 text-yellow-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {result === 'success' ? (
              <>
                <Award className="w-5 h-5" />
                <p className="text-sm">
                  🎉 Success! Found the global minimum! Learning rate {learningRate.toFixed(2)} was optimal.
                </p>
              </>
            ) : result === 'oscillating' ? (
              <>
                <TrendingDown className="w-5 h-5" />
                <p className="text-sm">
                  ⚠️ Oscillation detected! Learning rate {learningRate.toFixed(2)} is too high. Try a lower value.
                </p>
              </>
            ) : (
              <>
                <TrendingDown className="w-5 h-5" />
                <p className="text-sm">
                  ⚠️ Stuck in local minimum! Learning rate {learningRate.toFixed(2)} is too low. Try a higher value.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Canvas */}
      <div className="bg-gray-900/50 border-2 border-purple-500/30 rounded-lg p-4 mb-4">
        <canvas ref={canvasRef} className="w-full" style={{ maxHeight: '400px' }} />
      </div>

      {/* Controls */}
      <div className="bg-gray-900/30 border border-gray-700 rounded-lg p-6 mb-4">
        <div className="mb-4">
          <label className="block text-white font-semibold mb-3">
            Learning Rate: <span className="text-purple-400">{learningRate.toFixed(3)}</span>
          </label>
          <input
            type="range"
            min="0.01"
            max="0.5"
            step="0.01"
            value={learningRate}
            onChange={(e) => setLearningRate(parseFloat(e.target.value))}
            disabled={isAnimating}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0.01 (Too Low)</span>
            <span>0.25 (Optimal Range)</span>
            <span>0.5 (Too High)</span>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={train}
            disabled={isAnimating}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-all font-semibold"
          >
            <Play size={20} />
            {isAnimating ? 'Training...' : 'Train'}
          </button>
          <button
            onClick={reset}
            disabled={isAnimating}
            className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg transition-all"
          >
            <RotateCcw size={20} />
            Reset
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gray-900/30 border border-gray-700 rounded-lg p-4 mb-4">
        <h3 className="text-white font-semibold mb-2">How to Play:</h3>
        <ul className="text-gray-400 text-sm space-y-1 list-disc list-inside">
          <li>Adjust the learning rate slider (0.01 to 0.5)</li>
          <li>Click "Train" to start gradient descent</li>
          <li>Watch the ball roll down the loss function curve</li>
          <li>
            <strong>Success:</strong> Ball reaches the green dot (global minimum) - Learning rate was optimal
          </li>
          <li>
            <strong>Oscillation:</strong> Ball bounces around - Learning rate is too high, reduce it
          </li>
          <li>
            <strong>Stuck:</strong> Ball stops before reaching minimum - Learning rate is too low, increase it
          </li>
        </ul>
      </div>

      {/* Info */}
      <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
        <p className="text-purple-300 text-sm">
          <strong>Tip:</strong> The optimal learning rate is usually between 0.1 and 0.3. Too high causes oscillation,
          too low causes slow convergence or getting stuck in local minima.
        </p>
      </div>
    </div>
  )
}

