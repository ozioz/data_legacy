import { create } from 'zustand'
// import { persist, createJSONStorage } from 'zustand/middleware' // Temporarily disabled
import { GAME_TYPES, LEVELS, HEROES, CAREER_PATHS } from '@/lib/game/constants'

export type GameState = 'MODE_SELECTION' | 'HERO_SELECTION' | 'PATH_SELECTION' | 'CAREER_MAP' | 'PLAYING' | 'BRIEFING'
export type HeroType = keyof typeof HEROES
export type PathType = keyof typeof CAREER_PATHS

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
  
  // UI State
  showBriefing: boolean
  
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
  resetGame: () => void
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
  showBriefing: false,
}

// Temporarily disable persist to fix CSP issue
// Will re-enable with proper configuration later
export const useGameStore = create<GameStore>()((set) => ({
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
  resetGame: () => set({
    ...initialState,
    gameState: 'MODE_SELECTION',
  }),
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

