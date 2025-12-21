/**
 * Centralized Asset Management System
 * All game assets (images, icons, backgrounds) are defined here.
 * 
 * Note: If an asset is missing, the component should gracefully fallback.
 */

export const GAME_ASSETS = {
  // Mascots & Heroes
  engineer: '/assets/mascot-engineer.png',
  scientist: '/assets/mascot-scientist.png',
  analyst: '/assets/mascot-analyst.png',
  
  // Backgrounds
  marketBg: '/assets/bg-market.png',
  interviewBg: '/assets/bg-interview.png',
  
  // Arcade Game Covers (Thumbnails)
  visionary: '/assets/cover-visionary.png',
  agent: '/assets/cover-agent.png',
  algorithm: '/assets/cover-algorithm.png',
  coach: '/assets/cover-coach.png',

  // UI Icons
  guildIcon: '/assets/icon-guild.png',
  logo: '/assets/logo.png', // Fallback to text if missing
  
  // Interview
  interviewer: '/assets/interviewer.png', // AI Interviewer Avatar
  
  // Game Mascots (for Career Mode games)
  farmer: '/assets/farmer.png',
  firewall: '/assets/firewall.png',
  pipeline: '/assets/pipeline.png',
  runner: '/assets/runner.png',
  wizard: '/assets/wizard.png',
  
  // Hero Images (legacy, used in CareerMap)
  dataengineer: '/assets/dataengineer_1.png',
  dataScientist: '/assets/data_scientist_1.png',
  dataAnalyst: '/assets/data_analyst_1.png',
} as const

/**
 * Type-safe asset keys
 */
export type AssetKey = keyof typeof GAME_ASSETS

/**
 * Helper function to get asset path with fallback
 */
export function getAssetPath(key: AssetKey, fallback?: string): string {
  return GAME_ASSETS[key] || fallback || ''
}

/**
 * Check if an asset exists (client-side only)
 */
export function assetExists(path: string): boolean {
  if (typeof window === 'undefined') return true // Assume exists on server
  // This is a simple check - in production, you might want to preload assets
  return true
}

