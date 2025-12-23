import { create } from 'zustand'
// import { persist, createJSONStorage } from 'zustand/middleware' // Temporarily disabled
import { GAME_TYPES, LEVELS, HEROES, CAREER_PATHS } from '@/lib/game/constants'

export type GameState = 'MODE_SELECTION' | 'HERO_SELECTION' | 'PATH_SELECTION' | 'CAREER_MAP' | 'PLAYING' | 'BRIEFING'
export type HeroType = keyof typeof HEROES
export type PathType = keyof typeof CAREER_PATHS

// Project Genesis - End-to-End Data Project State
export interface ProjectState {
  // Stage 1: Source Ingestion (PipelinePuzzle)
  raw_data_quality: number // 0-100
  
  // Stage 2: Data Modeling (Kimball/QueryMaster)
  model_integrity: number // 0-100
  
  // Stage 3: Semantic Layer (Future game)
  semantic_layer_score: number // 0-100
  
  // Stage 4: Reporting (Future game)
  business_value: number // 0-100
  
  // Progress tracking
  current_stage: 1 | 2 | 3 | 4
  stages_completed: number[] // Array of completed stage numbers
  last_game_type: string | null
  last_game_score: number
}

interface GameStore {
  // Game State
  gameState: GameState
  playerHero: HeroType | null
  selectedPath: PathType | null
  currentLevel: typeof LEVELS[keyof typeof LEVELS] | null
  
  // Progress
  unlockedLevels: string[]
  totalXP: number
  trophyCollected: boolean
  
  // Project Genesis State
  projectState: ProjectState
  
  // UI State
  showBriefing: boolean
  showGameModal: boolean
  selectedZone: 'DESK' | 'MEETING' | 'SERVER' | null
  
  // Virtual CTO State
  ctoMessage: { text: string; state: 'idle' | 'thinking' | 'warning' | 'celebrating' } | null
  
  // Actions
  setGameState: (state: GameState) => void
  setPlayerHero: (hero: HeroType | null) => void
  setSelectedPath: (path: PathType | null) => void
  setCurrentLevel: (level: typeof LEVELS[keyof typeof LEVELS] | null) => void
  setUnlockedLevels: (levels: string[]) => void
  addUnlockedLevel: (levelId: string) => void
  addXP: (amount: number) => void
  setTrophyCollected: (collected: boolean) => void
  setShowBriefing: (show: boolean) => void
  setShowGameModal: (show: boolean) => void
  setSelectedZone: (zone: 'DESK' | 'MEETING' | 'SERVER' | null) => void
  resetGame: () => void
  
  // Virtual CTO Actions
  triggerCTOMessage: (message: { text: string; state: 'idle' | 'thinking' | 'warning' | 'celebrating' }) => void
  clearCTOMessage: () => void
  
  // Project Genesis Actions
  setProjectState: (state: Partial<ProjectState>) => void
  updateProjectState: (updates: Partial<ProjectState>) => void
  calculateRawDataQuality: (throughput: number, hintCount: number, won: boolean) => number
  calculateModelIntegrity: (score: number, won: boolean) => number
  calculateSemanticLayerScore: (completedRequests: number, totalRequests: number, won: boolean) => number
  saveStageResult: (stage: number, score: number, won: boolean, metricValue: number) => void
  unlockNextStage: (currentStage: number) => void
  syncProjectStateToDB: () => Promise<void>
  loadProjectStateFromDB: () => Promise<void>
}

const initialState = {
  gameState: 'MODE_SELECTION' as GameState,
  playerHero: null as HeroType | null,
  selectedPath: null as PathType | null,
  currentLevel: null,
  unlockedLevels: [
    'ENGINEER_1',
    'SCIENTIST_1',
    'ANALYST_1',
    'ENGINEER_BEHAVIORAL_1',
    'SCIENTIST_BEHAVIORAL_1',
    'ANALYST_BEHAVIORAL_1',
  ],
  totalXP: 0,
  trophyCollected: false,
  projectState: {
    raw_data_quality: 0,
    model_integrity: 0,
    semantic_layer_score: 0,
    business_value: 0,
    current_stage: 1,
    stages_completed: [],
    last_game_type: null,
    last_game_score: 0,
  } as ProjectState,
  showBriefing: false,
  showGameModal: false,
  selectedZone: null,
  ctoMessage: null,
}

// Temporarily disable persist to fix CSP issue
// Will re-enable with proper configuration later
export const useGameStore = create<GameStore>()((set, get) => ({
  ...initialState,
  
  setGameState: (state) => set({ gameState: state }),
  setPlayerHero: (hero) => set({ playerHero: hero }),
  setSelectedPath: (path) => set({ selectedPath: path }),
  setCurrentLevel: (level) => set({ currentLevel: level }),
  setUnlockedLevels: (levels) => set({ unlockedLevels: levels }),
  addUnlockedLevel: (levelId) =>
    set((state) => {
      if (state.unlockedLevels.includes(levelId)) {
        return state
      }
      return { unlockedLevels: [...state.unlockedLevels, levelId] }
    }),
  addXP: (amount) =>
    set((state) => ({ totalXP: state.totalXP + amount })),
  setTrophyCollected: (collected) => set({ trophyCollected: collected }),
  setShowBriefing: (show) => set({ showBriefing: show }),
  setShowGameModal: (show) => set({ showGameModal: show }),
  setSelectedZone: (zone) => set({ selectedZone: zone }),
        resetGame: () => set({
          ...initialState,
          gameState: 'MODE_SELECTION',
        }),
        
        // Virtual CTO Actions
        triggerCTOMessage: (message) => set({ ctoMessage: message }),
        clearCTOMessage: () => set({ ctoMessage: null }),
        
        // Project Genesis Actions
  setProjectState: (state) => set({ projectState: { ...get().projectState, ...state } }),
  updateProjectState: (updates) => set((state) => ({
    projectState: { ...state.projectState, ...updates }
  })),
  
  // Calculate Raw Data Quality from PipelinePuzzle (Stage 1)
  calculateRawDataQuality: (throughput: number, hintCount: number, won: boolean) => {
    if (!won) return 0
    
    // Base score from throughput (0-60 points)
    // Good throughput: > 0.5 items/s = 60 points, < 0.1 items/s = 20 points
    const throughputScore = Math.min(60, Math.max(20, throughput * 100))
    
    // Penalty for hints (0-40 points)
    // No hints = 40 points, 1 hint = 30 points, 2+ hints = 20 points
    const hintPenalty = Math.max(20, 40 - (hintCount * 10))
    
    return Math.round(throughputScore + hintPenalty)
  },
  
  // Calculate Model Integrity from QueryMaster/Kimball (Stage 2)
  calculateModelIntegrity: (score: number, won: boolean) => {
    if (!won) return 0
    // Score is already 0-100 from the game
    return Math.min(100, Math.max(0, score))
  },
  
  // Calculate Semantic Layer Score from MetricLab (Stage 3)
  calculateSemanticLayerScore: (completedRequests: number, totalRequests: number, won: boolean) => {
    if (!won) return 0
    // Base score: 60 points for completion, +10 per request completed
    const baseScore = 60
    const bonusPerRequest = 10
    return Math.min(100, baseScore + (completedRequests * bonusPerRequest))
  },
  
  // Save stage result and update project state
  saveStageResult: (stage: number, score: number, won: boolean, metricValue: number) => {
    const state = get()
    const updates: Partial<ProjectState> = {
      last_game_type: `STAGE_${stage}`,
      last_game_score: score,
    }
    
    // Update metric based on stage
    if (stage === 1 && won) {
      updates.raw_data_quality = metricValue
      if (!state.projectState.stages_completed.includes(1)) {
        updates.stages_completed = [...state.projectState.stages_completed, 1]
        updates.current_stage = 2 // Unlock next stage
      }
    } else if (stage === 2 && won) {
      updates.model_integrity = metricValue
      if (!state.projectState.stages_completed.includes(2)) {
        updates.stages_completed = [...state.projectState.stages_completed, 2]
        updates.current_stage = 3
      }
    } else if (stage === 3 && won) {
      updates.semantic_layer_score = metricValue
      if (!state.projectState.stages_completed.includes(3)) {
        updates.stages_completed = [...state.projectState.stages_completed, 3]
        updates.current_stage = 4
      }
    } else if (stage === 4 && won) {
      updates.business_value = metricValue
      if (!state.projectState.stages_completed.includes(4)) {
        updates.stages_completed = [...state.projectState.stages_completed, 4]
      }
    }
    
    set((state) => ({
      projectState: { ...state.projectState, ...updates }
    }))
  },
  
  // Unlock next stage
  unlockNextStage: (currentStage: number) => {
    const state = get()
    if (currentStage < 4 && !state.projectState.stages_completed.includes(currentStage + 1)) {
      set((state) => ({
        projectState: {
          ...state.projectState,
          current_stage: (currentStage + 1) as 1 | 2 | 3 | 4
        }
      }))
    }
  },
  
  // Sync project state to database
  syncProjectStateToDB: async () => {
    const state = get()
    try {
      const { saveProjectProgress } = await import('@/app/actions/game-actions')
      await saveProjectProgress(state.projectState)
    } catch (error) {
      console.error('Error syncing project state to DB:', error)
    }
  },
  
  // Load project state from database
  loadProjectStateFromDB: async () => {
    try {
      const { getProjectProgress } = await import('@/app/actions/game-actions')
      const result = await getProjectProgress()
      if (result.success && result.data) {
        set({ projectState: result.data as ProjectState })
      }
    } catch (error) {
      console.error('Error loading project state from DB:', error)
    }
  },
}))

// TODO: Re-enable persist with proper CSP configuration
// export const useGameStore = create<GameStore>()(
//   persist(
//     (set) => ({ ... }),
//     {
//       name: 'datalegacy-game-storage',
//       storage: createJSONStorage(() => localStorage),
//       ...
//     }
//   )
// )

