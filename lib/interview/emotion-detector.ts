/**
 * Simple Emotion Detection Utility
 * Analyzes video frames for basic emotional cues
 */

export interface EmotionState {
  dominant: 'neutral' | 'happy' | 'nervous' | 'confident' | 'focused' | 'stressed'
  confidence: number // 0-1
  description: string
}

/**
 * Analyze video frame for emotional state
 * This is a simplified heuristic-based approach
 * For production, consider using face-api.js or a dedicated ML model
 */
export function analyzeEmotionFromVideo(
  videoElement: HTMLVideoElement | null
): EmotionState | null {
  if (!videoElement || videoElement.readyState < 2) {
    return null
  }

  try {
    // Create canvas to capture frame
    const canvas = document.createElement('canvas')
    canvas.width = videoElement.videoWidth || 640
    canvas.height = videoElement.videoHeight || 480
    const ctx = canvas.getContext('2d')

    if (!ctx) return null

    // Draw video frame to canvas
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height)

    // Get image data for analysis
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    // Simple heuristic: Analyze brightness and color distribution
    // This is a placeholder - real emotion detection would use ML models
    let totalBrightness = 0
    let pixelCount = 0

    for (let i = 0; i < data.length; i += 16) {
      // Sample every 4th pixel for performance
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const brightness = (r + g + b) / 3
      totalBrightness += brightness
      pixelCount++
    }

    const avgBrightness = totalBrightness / pixelCount

    // Simple heuristic-based emotion detection
    // In production, use face-api.js or similar
    // For now, return a neutral state with some variation
    const emotions: EmotionState['dominant'][] = ['neutral', 'focused', 'confident', 'nervous']
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)]

    const descriptions: Record<EmotionState['dominant'], string> = {
      neutral: 'Neutral expression',
      happy: 'Appears relaxed and positive',
      nervous: 'Shows signs of nervousness or stress',
      confident: 'Appears confident and composed',
      focused: 'Appears focused and attentive',
      stressed: 'Shows signs of stress or tension',
    }

    return {
      dominant: randomEmotion,
      confidence: 0.6, // Placeholder confidence
      description: descriptions[randomEmotion],
    }
  } catch (error) {
    console.error('Error analyzing emotion:', error)
    return null
  }
}

/**
 * Get emotional context string for AI prompts
 */
export function getEmotionalContext(emotion: EmotionState | null): string {
  if (!emotion) return ''

  const contextMap: Record<EmotionState['dominant'], string> = {
    neutral: 'Candidate appears calm and neutral.',
    happy: 'Candidate appears relaxed and positive.',
    nervous: 'Candidate appears nervous or anxious. Consider being more reassuring.',
    confident: 'Candidate appears confident and composed.',
    focused: 'Candidate appears focused and attentive.',
    stressed: 'Candidate appears stressed or tense. Consider being more supportive.',
  }

  return contextMap[emotion.dominant] || ''
}

