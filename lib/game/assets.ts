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
  interviewBg: '/assets/bg-interview.png',
  
  // Arcade Game Covers (Thumbnails)
  visionary: '/assets/cover-visionary.png',
  agent: '/assets/cover-agent.png',
  algorithm: '/assets/cover-algorithm.png',
  coach: '/assets/cover-coach.png',
  neuralChess: '/assets/cover-neural-chess.png', // Placeholder - add actual image later

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
  
  // RPG Office Scene Assets - Monster Office Pack
  heroEngineer: '/assets/rpg/Monster Office/Lil Dude/Lil Dude Idle.png',
  heroScientist: '/assets/rpg/Monster Office/Lil Dude/Lil Dude Big.png',
  heroAnalyst: '/assets/rpg/Monster Office/Lil Dude/Lil Dude Idle.png',
  floorTile: '/assets/rpg/Monster Office/Full Office/Office Space.png',
  deskSprite: '/assets/rpg/Monster Office/Computer/Computer.png',
  deskMonitor: '/assets/rpg/Monster Office/Monitor/Moniter.png',
  deskKeyboard: '/assets/rpg/Monster Office/Keyboard/Keyboard.aseprite',
  deskMouse: '/assets/rpg/Monster Office/Mouse/Mouse.aseprite',
  deskChair: '/assets/rpg/Monster Office/Desk Chair/Desktop Chair.aseprite',
  serverRack: '/assets/rpg/Monster Office/Tower/Tower.aseprite',
  meetingTable: '/assets/rpg/Monster Office/Coffee Table/Coffee Table.aseprite',
  meetingChair: '/assets/rpg/Monster Office/Chair/Chair_Breaking_1.png',
  meetingCouch: '/assets/rpg/Monster Office/Couch/Couch_Breaking_1.png',
  meetingTV: '/assets/rpg/Monster Office/TV/TV.aseprite',
  shadow: '/assets/rpg/shadow.png',
  monster: '/assets/rpg/Monster Office/Monster/Globuloid.png',
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

