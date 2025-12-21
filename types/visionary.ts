/**
 * TypeScript interfaces for Visionary Game
 */

export interface VisionaryLevel {
  id: string
  image_path: string
  options: VisionaryOptions
  difficulty: 'Easy' | 'Medium' | 'Hard'
}

export interface VisionaryOptions {
  subjects: string[]
  styles: string[]
  lightings: string[]
}

export interface VisionaryCorrectAttributes {
  subject: string
  style: string
  lighting: string
}

export interface VisionaryUserSelections {
  subject: string | null
  style: string | null
  lighting: string | null
}

export interface VisionaryValidationResult {
  score: number // 0-100
  isCorrect: boolean
  feedback: {
    subject: { correct: boolean; message: string }
    style: { correct: boolean; message: string }
    lighting: { correct: boolean; message: string }
  }
  correctAttributes?: VisionaryCorrectAttributes // Only returned if isCorrect is true
}

