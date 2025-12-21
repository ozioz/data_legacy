-- Data Legacy 2.0 - Supabase Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    chosen_class TEXT CHECK (chosen_class IN ('ENGINEER', 'SCIENTIST', 'ANALYST')),
    current_level INTEGER DEFAULT 1,
    total_xp INTEGER DEFAULT 0,
    unlocked_levels TEXT[] DEFAULT ARRAY['ENGINEER_1', 'SCIENTIST_1', 'ANALYST_1', 'ENGINEER_BEHAVIORAL_1', 'SCIENTIST_BEHAVIORAL_1', 'ANALYST_BEHAVIORAL_1'],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game Sessions table (tracks all game plays)
CREATE TABLE IF NOT EXISTS public.game_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    game_type TEXT NOT NULL CHECK (game_type IN ('PIPELINE', 'RUNNER', 'QUERY', 'FARM', 'TOWER', 'BEHAVIORAL')),
    level_id TEXT NOT NULL,
    score INTEGER,
    duration INTEGER, -- in seconds
    won BOOLEAN DEFAULT false,
    xp_earned INTEGER DEFAULT 0,
    game_config JSONB, -- stores game-specific config for analysis
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Behavioral Choices table (tracks RPG scenario decisions)
CREATE TABLE IF NOT EXISTS public.behavioral_choices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.game_sessions(id) ON DELETE CASCADE,
    scenario_context TEXT NOT NULL, -- The AI-generated scenario text
    chosen_action INTEGER NOT NULL, -- Index of the choice (0, 1, 2)
    choice_text TEXT NOT NULL, -- The actual choice text
    ai_feedback TEXT, -- AI-generated feedback
    score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leaderboard view (for quick access to top players)
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
    u.id,
    u.email,
    u.chosen_class,
    u.total_xp,
    u.current_level,
    ROW_NUMBER() OVER (ORDER BY u.total_xp DESC) as rank
FROM public.users u
WHERE u.total_xp > 0
ORDER BY u.total_xp DESC
LIMIT 100;

-- Game Balance Analytics view (for data-driven balancing)
CREATE OR REPLACE VIEW public.game_balance_stats AS
SELECT 
    game_type,
    level_id,
    COUNT(*) as total_plays,
    SUM(CASE WHEN won THEN 1 ELSE 0 END) as wins,
    ROUND(AVG(score)::numeric, 2) as avg_score,
    ROUND(AVG(duration)::numeric, 2) as avg_duration,
    ROUND((SUM(CASE WHEN won THEN 1 ELSE 0 END)::numeric / COUNT(*)::numeric) * 100, 2) as win_rate
FROM public.game_sessions
GROUP BY game_type, level_id;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON public.game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_created_at ON public.game_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_sessions_game_type ON public.game_sessions(game_type);
CREATE INDEX IF NOT EXISTS idx_behavioral_choices_user_id ON public.behavioral_choices(user_id);
CREATE INDEX IF NOT EXISTS idx_behavioral_choices_session_id ON public.behavioral_choices(session_id);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behavioral_choices ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own game sessions" ON public.game_sessions;
DROP POLICY IF EXISTS "Users can view own game sessions" ON public.game_sessions;
DROP POLICY IF EXISTS "Anyone can view leaderboard" ON public.users;
DROP POLICY IF EXISTS "Users can insert own behavioral choices" ON public.behavioral_choices;
DROP POLICY IF EXISTS "Users can view own behavioral choices" ON public.behavioral_choices;

-- Users policies: Users can read/update their own data
CREATE POLICY "Users can view own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.users FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Game Sessions policies: Users can insert/read their own sessions
CREATE POLICY "Users can insert own game sessions"
    ON public.game_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own game sessions"
    ON public.game_sessions FOR SELECT
    USING (auth.uid() = user_id);

-- Leaderboard: Public read access
CREATE POLICY "Anyone can view leaderboard"
    ON public.users FOR SELECT
    USING (true);

-- Behavioral Choices policies: Users can insert/read their own choices
CREATE POLICY "Users can insert own behavioral choices"
    ON public.behavioral_choices FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own behavioral choices"
    ON public.behavioral_choices FOR SELECT
    USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

