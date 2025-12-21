'use client'

import { useState, useRef, useEffect } from 'react'
import { CheckCircle, XCircle, RotateCcw, Play } from 'lucide-react'

interface MatrixGameProps {
  onComplete?: () => void
}

interface Layer {
  id: string
  dimensions: [number, number]
  position: { x: number; y: number }
  connected: boolean
}

export default function MatrixGame({ onComplete }: MatrixGameProps) {
  const [layers, setLayers] = useState<Layer[]>([])
  const [draggedLayer, setDraggedLayer] = useState<string | null>(null)
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Initialize game with random layers
  const initializeGame = () => {
    const newLayers: Layer[] = []
    const layerCount = 3 + level // 3-5 layers based on level

    for (let i = 0; i < layerCount; i++) {
      const rows = Math.floor(Math.random() * 4) + 2 // 2-5 rows
      const cols = Math.floor(Math.random() * 4) + 2 // 2-5 cols
      newLayers.push({
        id: `layer-${i}`,
        dimensions: [rows, cols],
        position: {
          x: 100 + (i % 3) * 200,
          y: 150 + Math.floor(i / 3) * 200,
        },
        connected: false,
      })
    }

    setLayers(newLayers)
    setSelectedLayer(null)
    setFeedback(null)
  }

  useEffect(() => {
    initializeGame()
  }, [level])

  // Draw connections and layers on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = 800
    canvas.height = 600

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw grid background
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)'
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

    // Draw connections
    layers.forEach((layer, index) => {
      if (index < layers.length - 1 && layer.connected) {
        const nextLayer = layers[index + 1]
        ctx.strokeStyle = '#00FFFF'
        ctx.lineWidth = 3
        ctx.setLineDash([])
        ctx.beginPath()
        ctx.moveTo(layer.position.x + 60, layer.position.y + 30)
        ctx.lineTo(nextLayer.position.x + 60, nextLayer.position.y + 30)
        ctx.stroke()

        // Draw arrow
        const angle = Math.atan2(
          nextLayer.position.y - layer.position.y,
          nextLayer.position.x - layer.position.x
        )
        ctx.fillStyle = '#00FFFF'
        ctx.beginPath()
        ctx.moveTo(nextLayer.position.x + 60, nextLayer.position.y + 30)
        ctx.lineTo(
          nextLayer.position.x + 60 - 10 * Math.cos(angle - Math.PI / 6),
          nextLayer.position.y + 30 - 10 * Math.sin(angle - Math.PI / 6)
        )
        ctx.lineTo(
          nextLayer.position.x + 60 - 10 * Math.cos(angle + Math.PI / 6),
          nextLayer.position.y + 30 - 10 * Math.sin(angle + Math.PI / 6)
        )
        ctx.closePath()
        ctx.fill()
      }
    })

    // Draw layers
    layers.forEach((layer) => {
      const isSelected = selectedLayer === layer.id
      const isDragged = draggedLayer === layer.id

      // Layer box
      ctx.fillStyle = isSelected
        ? 'rgba(0, 255, 255, 0.3)'
        : isDragged
        ? 'rgba(0, 255, 255, 0.2)'
        : 'rgba(0, 255, 255, 0.1)'
      ctx.strokeStyle = isSelected ? '#00FFFF' : 'rgba(0, 255, 255, 0.5)'
      ctx.lineWidth = isSelected ? 3 : 2
      ctx.fillRect(layer.position.x, layer.position.y, 120, 60)
      ctx.strokeRect(layer.position.x, layer.position.y, 120, 60)

      // Dimension text
      ctx.fillStyle = '#00FFFF'
      ctx.font = 'bold 16px monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(
        `[${layer.dimensions[0]}×${layer.dimensions[1]}]`,
        layer.position.x + 60,
        layer.position.y + 30
      )

      // Connection indicator
      if (layer.connected) {
        ctx.fillStyle = '#00FF00'
        ctx.beginPath()
        ctx.arc(layer.position.x + 110, layer.position.y + 10, 5, 0, Math.PI * 2)
        ctx.fill()
      }
    })
  }, [layers, selectedLayer, draggedLayer])

  const handleLayerClick = (layerId: string) => {
    const layerIndex = layers.findIndex((l) => l.id === layerId)
    if (layerIndex === -1) return

    if (selectedLayer === layerId) {
      setSelectedLayer(null)
      return
    }

    if (selectedLayer) {
      const selectedIndex = layers.findIndex((l) => l.id === selectedLayer)
      if (selectedIndex === -1) return

      // Check if layers can be connected (matrix multiplication rule)
      const layer1 = layers[selectedIndex]
      const layer2 = layers[layerIndex]

      // For matrix multiplication: [a×b] × [b×c] = [a×c]
      // So layer1.cols must equal layer2.rows
      if (layer1.dimensions[1] === layer2.dimensions[0]) {
        // Valid connection
        const newLayers = [...layers]
        newLayers[selectedIndex] = { ...layer1, connected: true }
        setLayers(newLayers)
        setSelectedLayer(null)
        setFeedback({
          type: 'success',
          message: `Dot Product Successful! [${layer1.dimensions[0]}×${layer1.dimensions[1]}] × [${layer2.dimensions[0]}×${layer2.dimensions[1]}] = [${layer1.dimensions[0]}×${layer2.dimensions[1]}]`,
        })
        setScore(score + 10)

        // Check if all layers are connected
        setTimeout(() => {
          if (newLayers.every((l, i) => i === newLayers.length - 1 || l.connected)) {
            setFeedback({
              type: 'success',
              message: '🎉 All layers connected! Neural network architecture complete!',
            })
            setScore(score + 50)
            setTimeout(() => {
              setLevel(level + 1)
            }, 2000)
          }
        }, 500)
      } else {
        // Invalid connection
        setFeedback({
          type: 'error',
          message: `Dimension Mismatch Error! Cannot multiply [${layer1.dimensions[0]}×${layer1.dimensions[1]}] × [${layer2.dimensions[0]}×${layer2.dimensions[1]}]. Columns of first matrix (${layer1.dimensions[1]}) must equal rows of second matrix (${layer2.dimensions[0]}).`,
        })
        setSelectedLayer(null)
      }
    } else {
      setSelectedLayer(layerId)
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Find clicked layer
    const clickedLayer = layers.find(
      (layer) =>
        x >= layer.position.x &&
        x <= layer.position.x + 120 &&
        y >= layer.position.y &&
        y <= layer.position.y + 60
    )

    if (clickedLayer) {
      setDraggedLayer(clickedLayer.id)
      handleLayerClick(clickedLayer.id)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggedLayer) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === draggedLayer
          ? { ...layer, position: { x: Math.max(0, Math.min(x - 60, canvas.width - 120)), y: Math.max(0, Math.min(y - 30, canvas.height - 60)) } }
          : layer
      )
    )
  }

  const handleMouseUp = () => {
    setDraggedLayer(null)
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Matrix Architecture</h2>
          <p className="text-gray-400">Connect neural network layers by matching matrix dimensions</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-gray-400 text-sm">Level</p>
            <p className="text-2xl font-bold text-cyan-400">{level}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">Score</p>
            <p className="text-2xl font-bold text-cyan-400">{score}</p>
          </div>
        </div>
      </div>

      {/* Feedback Message */}
      {feedback && (
        <div
          className={`mb-4 p-4 rounded-lg border-2 ${
            feedback.type === 'success'
              ? 'bg-green-900/30 border-green-500 text-green-400'
              : 'bg-red-900/30 border-red-500 text-red-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <p className="text-sm">{feedback.message}</p>
          </div>
        </div>
      )}

      {/* Canvas */}
      <div className="bg-gray-900/50 border-2 border-cyan-500/30 rounded-lg p-4 mb-4">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="w-full cursor-move"
          style={{ maxHeight: '600px' }}
        />
      </div>

      {/* Instructions */}
      <div className="bg-gray-900/30 border border-gray-700 rounded-lg p-4 mb-4">
        <h3 className="text-white font-semibold mb-2">How to Play:</h3>
        <ul className="text-gray-400 text-sm space-y-1 list-disc list-inside">
          <li>Click on a layer to select it, then click another layer to connect them</li>
          <li>For valid connection: Columns of first matrix = Rows of second matrix</li>
          <li>Example: [3×4] can connect to [4×2] → Result: [3×2]</li>
          <li>Drag layers to reposition them</li>
          <li>Connect all layers to complete the level</li>
        </ul>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <button
          onClick={initializeGame}
          className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
        >
          <RotateCcw size={20} />
          Reset
        </button>
        {onComplete && (
          <button
            onClick={onComplete}
            className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-all"
          >
            <Play size={20} />
            Complete
          </button>
        )}
      </div>
    </div>
  )
}

