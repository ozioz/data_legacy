/**
 * Supabase Database Types
 * Auto-generated types for Data Legacy 2.0 database schema
 * 
 * Run: npx supabase gen types typescript --project-id <project-id> > types/supabase.ts
 * Or manually maintain this file as schema changes
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // Existing tables (from schema.sql and schema_arcade.sql)
      users: {
        Row: {
          id: string
          email: string | null
          chosen_class: string | null
          current_level: number
          total_xp: number
          math_skill_score?: number
          fee_discount_expires_at?: string | null
          is_admin?: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          chosen_class?: string | null
          current_level?: number
          total_xp?: number
          math_skill_score?: number
          fee_discount_expires_at?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          chosen_class?: string | null
          current_level?: number
          total_xp?: number
          math_skill_score?: number
          fee_discount_expires_at?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      game_sessions: {
        Row: {
          id: string
          user_id: string
          game_type: string
          level: string
          score: number
          won: boolean
          duration_seconds: number
          config: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          game_type: string
          level: string
          score: number
          won: boolean
          duration_seconds: number
          config?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          game_type?: string
          level?: string
          score?: number
          won?: boolean
          duration_seconds?: number
          config?: Json
          created_at?: string
        }
      }
      behavioral_choices: {
        Row: {
          id: string
          user_id: string
          session_id: string
          scenario: string
          choice: string
          ai_feedback: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_id: string
          scenario: string
          choice: string
          ai_feedback?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_id?: string
          scenario?: string
          choice?: string
          ai_feedback?: string | null
          created_at?: string
        }
      }
      prompt_battles: {
        Row: {
          id: string
          user_id: string
          game_type: string
          target_prompt: string
          user_prompt: string
          score: number
          feedback: string
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          game_type: string
          target_prompt: string
          user_prompt: string
          score: number
          feedback: string
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          game_type?: string
          target_prompt?: string
          user_prompt?: string
          score?: number
          feedback?: string
          metadata?: Json
          created_at?: string
        }
      }
      roguelite_decks: {
        Row: {
          id: string
          user_id: string
          game_session_id: string
          upgrades: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          game_session_id: string
          upgrades: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          game_session_id?: string
          upgrades?: Json
          created_at?: string
          updated_at?: string
        }
      }
      tool_chains: {
        Row: {
          id: string
          task_outcome: string
          correct_sequence: string[]
          difficulty: string
          created_at: string
        }
        Insert: {
          id?: string
          task_outcome: string
          correct_sequence: string[]
          difficulty?: string
          created_at?: string
        }
        Update: {
          id?: string
          task_outcome?: string
          correct_sequence?: string[]
          difficulty?: string
          created_at?: string
        }
      }
      leaderboard_entries: {
        Row: {
          id: string
          user_id: string
          game_type: string
          score: number
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          game_type: string
          score: number
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          game_type?: string
          score?: number
          metadata?: Json
          created_at?: string
        }
      }
      idle_production: {
        Row: {
          id: string
          user_id: string
          resource_type: string
          production_rate: number
          last_active: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          resource_type: string
          production_rate: number
          last_active?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          resource_type?: string
          production_rate?: number
          last_active?: string
          created_at?: string
        }
      }
      // ============================================================================
      // NEW TABLES: Social, Economy & AI Features
      // ============================================================================
      guilds: {
        Row: {
          id: string
          name: string
          description: string | null
          leader_id: string
          total_xp: number
          member_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          leader_id: string
          total_xp?: number
          member_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          leader_id?: string
          total_xp?: number
          member_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      guild_members: {
        Row: {
          id: string
          guild_id: string
          user_id: string
          role: 'leader' | 'officer' | 'member'
          joined_at: string
          contributed_xp: number
        }
        Insert: {
          id?: string
          guild_id: string
          user_id: string
          role?: 'leader' | 'officer' | 'member'
          joined_at?: string
          contributed_xp?: number
        }
        Update: {
          id?: string
          guild_id?: string
          user_id?: string
          role?: 'leader' | 'officer' | 'member'
          joined_at?: string
          contributed_xp?: number
        }
      }
      market_listings: {
        Row: {
          id: string
          seller_id: string
          item_type: string
          item_name: string
          description: string | null
          price: number
          quantity: number
          status: 'active' | 'sold' | 'cancelled'
          volatility_index: number | null
          created_at: string
          updated_at: string
          sold_at: string | null
          buyer_id: string | null
        }
        Insert: {
          id?: string
          seller_id: string
          item_type: string
          item_name: string
          description?: string | null
          price: number
          quantity?: number
          status?: 'active' | 'sold' | 'cancelled'
          volatility_index?: number | null
          created_at?: string
          updated_at?: string
          sold_at?: string | null
          buyer_id?: string | null
        }
        Update: {
          id?: string
          seller_id?: string
          item_type?: string
          item_name?: string
          description?: string | null
          price?: number
          quantity?: number
          status?: 'active' | 'sold' | 'cancelled'
          volatility_index?: number | null
          created_at?: string
          updated_at?: string
          sold_at?: string | null
          buyer_id?: string | null
        }
      }
      user_inventory: {
        Row: {
          id: string
          user_id: string
          item_type: string
          item_name: string
          quantity: number
          metadata: Json
          acquired_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          item_type: string
          item_name: string
          quantity?: number
          metadata?: Json
          acquired_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          item_type?: string
          item_name?: string
          quantity?: number
          metadata?: Json
          acquired_at?: string
          updated_at?: string
        }
      }
      ai_interview_sessions: {
        Row: {
          id: string
          user_id: string
          job_role: string
          job_level: 'junior' | 'mid' | 'senior' | 'lead' | 'architect'
          transcript_json: Json
          feedback_json: Json
          overall_score: number | null
          status: 'in_progress' | 'completed' | 'cancelled'
          created_at: string
          completed_at: string | null
          duration_seconds: number | null
          transcript_embedding: number[] | null // Vector type as array
        }
        Insert: {
          id?: string
          user_id: string
          job_role: string
          job_level: 'junior' | 'mid' | 'senior' | 'lead' | 'architect'
          transcript_json?: Json
          feedback_json?: Json
          overall_score?: number | null
          status?: 'in_progress' | 'completed' | 'cancelled'
          created_at?: string
          completed_at?: string | null
          duration_seconds?: number | null
          transcript_embedding?: number[] | null
        }
        Update: {
          id?: string
          user_id?: string
          job_role?: string
          job_level?: 'junior' | 'mid' | 'senior' | 'lead' | 'architect'
          transcript_json?: Json
          feedback_json?: Json
          overall_score?: number | null
          status?: 'in_progress' | 'completed' | 'cancelled'
          created_at?: string
          completed_at?: string | null
          duration_seconds?: number | null
          transcript_embedding?: number[] | null
        }
      }
      // ============================================================================
      // NEW TABLES: Advanced Social, Economy & Memory Features (2026 Upgrade)
      // ============================================================================
      guild_raids: {
        Row: {
          id: string
          guild_id: string
          boss_name: string
          boss_description: string | null
          total_hp: number
          current_hp: number
          status: 'active' | 'defeated' | 'expired'
          rewards_json: Json
          started_at: string
          defeated_at: string | null
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          guild_id: string
          boss_name: string
          boss_description?: string | null
          total_hp?: number
          current_hp?: number
          status?: 'active' | 'defeated' | 'expired'
          rewards_json?: Json
          started_at?: string
          defeated_at?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          guild_id?: string
          boss_name?: string
          boss_description?: string | null
          total_hp?: number
          current_hp?: number
          status?: 'active' | 'defeated' | 'expired'
          rewards_json?: Json
          started_at?: string
          defeated_at?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      raid_contributions: {
        Row: {
          id: string
          raid_id: string
          user_id: string
          damage_dealt: number
          contribution_type: 'damage' | 'heal' | 'buff' | 'debuff'
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          raid_id: string
          user_id: string
          damage_dealt?: number
          contribution_type?: 'damage' | 'heal' | 'buff' | 'debuff'
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          raid_id?: string
          user_id?: string
          damage_dealt?: number
          contribution_type?: 'damage' | 'heal' | 'buff' | 'debuff'
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      market_news: {
        Row: {
          id: string
          headline: string
          description: string | null
          effect_json: Json
          is_active: boolean
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          headline: string
          description?: string | null
          effect_json?: Json
          is_active?: boolean
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          headline?: string
          description?: string | null
          effect_json?: Json
          is_active?: boolean
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_memory: {
        Row: {
          id: string
          user_id: string
          context_embedding: number[] | null // Vector(1536) as array
          textual_summary: string
          event_type: 'game_completion' | 'behavioral_choice' | 'interview_session' | 'guild_activity' | 'market_transaction' | 'achievement' | 'custom'
          event_data: Json
          importance_score: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          context_embedding?: number[] | null
          textual_summary: string
          event_type: 'game_completion' | 'behavioral_choice' | 'interview_session' | 'guild_activity' | 'market_transaction' | 'achievement' | 'custom'
          event_data?: Json
          importance_score?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          context_embedding?: number[] | null
          textual_summary?: string
          event_type?: 'game_completion' | 'behavioral_choice' | 'interview_session' | 'guild_activity' | 'market_transaction' | 'achievement' | 'custom'
          event_data?: Json
          importance_score?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      leaderboard: {
        Row: {
          id: string
          email: string | null
          chosen_class: string | null
          current_level: number
          total_xp: number
          rank: number
        }
      }
      game_balance_stats: {
        Row: {
          game_type: string
          level: string
          total_plays: number
          wins: number
          losses: number
          avg_score: number
          win_rate: number
        }
      }
      guild_leaderboard: {
        Row: {
          id: string
          name: string
          description: string | null
          total_xp: number
          member_count: number
          created_at: string
          leader_email: string | null
          actual_member_count: number
        }
      }
      active_market_listings: {
        Row: {
          id: string
          seller_id: string
          item_type: string
          item_name: string
          description: string | null
          price: number
          quantity: number
          volatility_index: number | null
          created_at: string
          seller_email: string | null
        }
      }
      active_guild_raids: {
        Row: {
          id: string
          guild_id: string
          guild_name: string | null
          boss_name: string
          boss_description: string | null
          total_hp: number
          current_hp: number
          hp_percentage: number
          status: string
          rewards_json: Json
          started_at: string
          expires_at: string | null
          contributor_count: number
          total_damage_dealt: number
        }
      }
      raid_leaderboard: {
        Row: {
          raid_id: string
          boss_name: string
          user_id: string
          email: string | null
          total_damage: number
          contribution_count: number
          last_contribution: string
        }
      }
      active_market_news: {
        Row: {
          id: string
          headline: string
          description: string | null
          effect_json: Json
          created_at: string
          expires_at: string | null
        }
      }
    }
    Functions: {
      calculate_idle_resources: {
        Args: {
          p_user_id: string
          p_resource_type: string
        }
        Returns: {
          resource_type: string
          production_rate: number
          time_elapsed_seconds: number
          resources_generated: number
        }[]
      }
      update_roguelite_deck_timestamp: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      find_similar_memories: {
        Args: {
          p_user_id: string
          p_query_embedding: number[]
          p_limit?: number
          p_threshold?: number
        }
        Returns: {
          id: string
          textual_summary: string
          event_type: string
          event_data: Json
          importance_score: number
          similarity: number
          created_at: string
        }[]
      }
      get_raid_progress: {
        Args: {
          p_raid_id: string
        }
        Returns: {
          raid_id: string
          total_hp: number
          current_hp: number
          hp_percentage: number
          total_damage_dealt: number
          contributor_count: number
          top_contributor_id: string | null
          top_contributor_damage: number | null
        }[]
      }
    }
  }
}

// ============================================================================
// TypeScript Interfaces for Type Safety
// ============================================================================

export type Guild = Database['public']['Tables']['guilds']['Row']
export type GuildInsert = Database['public']['Tables']['guilds']['Insert']
export type GuildUpdate = Database['public']['Tables']['guilds']['Update']

export type GuildMember = Database['public']['Tables']['guild_members']['Row']
export type GuildMemberInsert = Database['public']['Tables']['guild_members']['Insert']
export type GuildMemberUpdate = Database['public']['Tables']['guild_members']['Update']

export type MarketListing = Database['public']['Tables']['market_listings']['Row']
export type MarketListingInsert = Database['public']['Tables']['market_listings']['Insert']
export type MarketListingUpdate = Database['public']['Tables']['market_listings']['Update']

export type UserInventory = Database['public']['Tables']['user_inventory']['Row']
export type UserInventoryInsert = Database['public']['Tables']['user_inventory']['Insert']
export type UserInventoryUpdate = Database['public']['Tables']['user_inventory']['Update']

export type AIInterviewSession = Database['public']['Tables']['ai_interview_sessions']['Row']
export type AIInterviewSessionInsert = Database['public']['Tables']['ai_interview_sessions']['Insert']
export type AIInterviewSessionUpdate = Database['public']['Tables']['ai_interview_sessions']['Update']

export type GuildLeaderboard = Database['public']['Views']['guild_leaderboard']['Row']
export type ActiveMarketListing = Database['public']['Views']['active_market_listings']['Row']
export type ActiveGuildRaid = Database['public']['Views']['active_guild_raids']['Row']
export type RaidLeaderboard = Database['public']['Views']['raid_leaderboard']['Row']
export type ActiveMarketNews = Database['public']['Views']['active_market_news']['Row']

// ============================================================================
// New Table Types (2026 Upgrade)
// ============================================================================

export type GuildRaid = Database['public']['Tables']['guild_raids']['Row']
export type GuildRaidInsert = Database['public']['Tables']['guild_raids']['Insert']
export type GuildRaidUpdate = Database['public']['Tables']['guild_raids']['Update']

export type RaidContribution = Database['public']['Tables']['raid_contributions']['Row']
export type RaidContributionInsert = Database['public']['Tables']['raid_contributions']['Insert']
export type RaidContributionUpdate = Database['public']['Tables']['raid_contributions']['Update']

export type MarketNews = Database['public']['Tables']['market_news']['Row']
export type MarketNewsInsert = Database['public']['Tables']['market_news']['Insert']
export type MarketNewsUpdate = Database['public']['Tables']['market_news']['Update']

export type UserMemory = Database['public']['Tables']['user_memory']['Row']
export type UserMemoryInsert = Database['public']['Tables']['user_memory']['Insert']
export type UserMemoryUpdate = Database['public']['Tables']['user_memory']['Update']

// ============================================================================
// Helper Types
// ============================================================================

export type GuildRole = 'leader' | 'officer' | 'member'
export type MarketListingStatus = 'active' | 'sold' | 'cancelled'
export type JobLevel = 'junior' | 'mid' | 'senior' | 'lead' | 'architect'
export type InterviewSessionStatus = 'in_progress' | 'completed' | 'cancelled'
export type RaidStatus = 'active' | 'defeated' | 'expired'
export type ContributionType = 'damage' | 'heal' | 'buff' | 'debuff'
export type MemoryEventType = 'game_completion' | 'behavioral_choice' | 'interview_session' | 'guild_activity' | 'market_transaction' | 'achievement' | 'custom'

// ============================================================================
// Extended Types for Application Use
// ============================================================================

export interface GuildWithMembers extends Guild {
  members?: GuildMember[]
  leader?: {
    id: string
    email: string | null
  }
}

export interface MarketListingWithSeller extends MarketListing {
  seller?: {
    id: string
    email: string | null
  }
}

export interface AIInterviewSessionWithUser extends AIInterviewSession {
  user?: {
    id: string
    email: string | null
  }
}

export interface GuildRaidWithProgress extends GuildRaid {
  progress?: {
    hp_percentage: number
    total_damage_dealt: number
    contributor_count: number
    top_contributor_id: string | null
    top_contributor_damage: number | null
  }
  guild?: {
    id: string
    name: string
  }
}

export interface UserMemoryWithSimilarity extends UserMemory {
  similarity?: number // Cosine similarity score from vector search
}

// ============================================================================
// Vector Search Types (for semantic similarity)
// ============================================================================

export interface VectorSearchResult {
  id: string
  job_role: string
  overall_score: number | null
  similarity: number // Cosine similarity score (0-1)
  created_at: string
}

export interface TranscriptMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
}

export interface InterviewFeedback {
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  threats: string[]
  recommendations: string[]
  technical_score: number
  communication_score: number
  problem_solving_score: number
  overall_score: number // 0-100
  overall_assessment: string
  swot_analysis: string // Detailed SWOT summary
}

