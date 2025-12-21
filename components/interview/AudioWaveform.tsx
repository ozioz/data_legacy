'use client'

import { useEffect, useState, useRef } from 'react'

interface AudioWaveformProps {
  isActive: boolean
  className?: string
}

/**
 * Audio Waveform Visualization Component
 * Shows animated bars when AI is speaking
 */
export default function AudioWaveform({ isActive, className = '' }: AudioWaveformProps) {
  const [heights, setHeights] = useState<number[]>([])
  const animationRef = useRef<number>()

  useEffect(() => {
    // Initialize with 20 bars
    if (heights.length === 0) {
      setHeights(Array(20).fill(0).map(() => Math.random() * 30 + 10))
    }
  }, [heights.length])

  useEffect(() => {
    if (!isActive) {
      // Fade out when not active
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      setHeights(Array(20).fill(0))
      return
    }

    // Animate bars when active
    const animate = () => {
      setHeights((prev) =>
        prev.map(() => {
          // Random height between 20% and 100%
          return Math.random() * 80 + 20
        })
      )
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isActive])

  if (!isActive && heights.every((h) => h === 0)) {
    return null
  }

  return (
    <div className={`flex items-end justify-center gap-1 h-16 ${className}`}>
      {heights.map((height, index) => (
        <div
          key={index}
          className="w-1 bg-gradient-to-t from-purple-500 via-purple-400 to-cyan-400 rounded-full transition-all duration-75 ease-in-out"
          style={{
            height: `${height}%`,
            opacity: isActive ? 0.8 : Math.max(0.2, height / 100),
          }}
        />
      ))}
    </div>
  )
}

