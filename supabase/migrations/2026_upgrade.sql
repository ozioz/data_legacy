-- =====================================================
-- Data Legacy 2.0 - Advanced Social, Economy & Memory Upgrade
-- Migration: 2026_upgrade.sql
-- Date: 2026
-- =====================================================

-- =====================================================
-- 1. ENABLE VECTOR SUPPORT
-- =====================================================

-- Enable vector extension for semantic search and embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- =====================================================
-- 2. GUILD BOSS RAIDS
-- =====================================================

-- Table: guild_raids
-- Stores active and completed boss raids for guilds
CREATE TABLE IF NOT EXISTS public.guild_raids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
    boss_name TEXT NOT NULL,
    boss_description TEXT,
    total_hp INTEGER NOT NULL DEFAULT 10000,
    current_hp INTEGER NOT NULL DEFAULT 10000,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'defeated', 'expired')),
    rewards_json JSONB DEFAULT '{}'::jsonb,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    defeated_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: raid_contributions
-- Tracks individual user contributions to guild raids
CREATE TABLE IF NOT EXISTS public.raid_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    raid_id UUID NOT NULL REFERENCES public.guild_raids(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    damage_dealt INTEGER NOT NULL DEFAULT 0,
    contribution_type TEXT DEFAULT 'damage' CHECK (contribution_type IN ('damage', 'heal', 'buff', 'debuff')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(raid_id, user_id, created_at) -- Prevent duplicate entries in same timestamp
);

-- Indexes for guild_raids
CREATE INDEX IF NOT EXISTS idx_guild_raids_guild_id ON public.guild_raids(guild_id);
CREATE INDEX IF NOT EXISTS idx_guild_raids_status ON public.guild_raids(status);
CREATE INDEX IF NOT EXISTS idx_guild_raids_started_at ON public.guild_raids(started_at DESC);

-- Indexes for raid_contributions
CREATE INDEX IF NOT EXISTS idx_raid_contributions_raid_id ON public.raid_contributions(raid_id);
CREATE INDEX IF NOT EXISTS idx_raid_contributions_user_id ON public.raid_contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_raid_contributions_damage ON public.raid_contributions(damage_dealt DESC);

-- =====================================================
-- 3. DYNAMIC MARKET - REMOVED: Focus on Data Career Simulation
-- =====================================================
-- NOTE: Marketplace features have been removed to focus strictly on Data Professional Career Simulation.
-- These tables are commented out for future migration cleanup.

/*
-- Table: market_news
-- Stores market news events that affect prices
CREATE TABLE IF NOT EXISTS public.market_news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    headline TEXT NOT NULL,
    description TEXT,
    effect_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    -- effect_json structure: { "item_type": "raw_data", "price_change_percent": 15, "duration_hours": 24 }
    is_active BOOLEAN NOT NULL DEFAULT true,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add volatility_index to market_listings (if column doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'market_listings' 
        AND column_name = 'volatility_index'
    ) THEN
        ALTER TABLE public.market_listings 
        ADD COLUMN volatility_index DECIMAL(5,2) DEFAULT 0.00 CHECK (volatility_index >= 0 AND volatility_index <= 100);
    END IF;
END $$;

-- Indexes for market_news
CREATE INDEX IF NOT EXISTS idx_market_news_is_active ON public.market_news(is_active);
CREATE INDEX IF NOT EXISTS idx_market_news_expires_at ON public.market_news(expires_at);
CREATE INDEX IF NOT EXISTS idx_market_news_created_at ON public.market_news(created_at DESC);

-- Index for volatility_index
CREATE INDEX IF NOT EXISTS idx_market_listings_volatility ON public.market_listings(volatility_index DESC);
*/

-- =====================================================
-- 4. USER MEMORY (LONG-TERM)
-- =====================================================

-- Table: user_memory
-- Stores long-term user memory with vector embeddings for semantic search
CREATE TABLE IF NOT EXISTS public.user_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    context_embedding vector(1536), -- OpenAI ada-002 embedding dimension
    textual_summary TEXT NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('game_completion', 'behavioral_choice', 'interview_session', 'guild_activity', 'market_transaction', 'achievement', 'custom')),
    event_data JSONB DEFAULT '{}'::jsonb,
    importance_score DECIMAL(3,2) DEFAULT 0.50 CHECK (importance_score >= 0 AND importance_score <= 1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for user_memory
CREATE INDEX IF NOT EXISTS idx_user_memory_user_id ON public.user_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_user_memory_event_type ON public.user_memory(event_type);
CREATE INDEX IF NOT EXISTS idx_user_memory_created_at ON public.user_memory(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_memory_importance ON public.user_memory(importance_score DESC);

-- Vector similarity search index (HNSW for fast approximate nearest neighbor search)
CREATE INDEX IF NOT EXISTS idx_user_memory_embedding ON public.user_memory 
USING hnsw (context_embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all new tables
ALTER TABLE public.guild_raids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raid_contributions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.market_news ENABLE ROW LEVEL SECURITY; -- COMMENTED OUT (Marketplace removed)
ALTER TABLE public.user_memory ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Guild Raids Policies
-- =====================================================

-- Anyone can view active raids
DROP POLICY IF EXISTS "Anyone can view active guild raids" ON public.guild_raids;
CREATE POLICY "Anyone can view active guild raids" ON public.guild_raids
    FOR SELECT
    USING (true);

-- Guild members can view their guild's raids
DROP POLICY IF EXISTS "Guild members can view their guild raids" ON public.guild_raids;
CREATE POLICY "Guild members can view their guild raids" ON public.guild_raids
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.guild_members
            WHERE guild_members.guild_id = guild_raids.guild_id
            AND guild_members.user_id = auth.uid()
        )
    );

-- Guild leaders can create raids
DROP POLICY IF EXISTS "Guild leaders can create raids" ON public.guild_raids;
CREATE POLICY "Guild leaders can create raids" ON public.guild_raids
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.guilds
            WHERE guilds.id = guild_raids.guild_id
            AND guilds.leader_id = auth.uid()
        )
    );

-- Guild leaders can update their guild's raids
DROP POLICY IF EXISTS "Guild leaders can update their guild raids" ON public.guild_raids;
CREATE POLICY "Guild leaders can update their guild raids" ON public.guild_raids
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.guilds
            WHERE guilds.id = guild_raids.guild_id
            AND guilds.leader_id = auth.uid()
        )
    );

-- =====================================================
-- Raid Contributions Policies
-- =====================================================

-- Anyone can view contributions (for leaderboards)
DROP POLICY IF EXISTS "Anyone can view raid contributions" ON public.raid_contributions;
CREATE POLICY "Anyone can view raid contributions" ON public.raid_contributions
    FOR SELECT
    USING (true);

-- Users can insert their own contributions
DROP POLICY IF EXISTS "Users can create their own contributions" ON public.raid_contributions;
CREATE POLICY "Users can create their own contributions" ON public.raid_contributions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own contributions
DROP POLICY IF EXISTS "Users can update their own contributions" ON public.raid_contributions;
CREATE POLICY "Users can update their own contributions" ON public.raid_contributions
    FOR UPDATE
    USING (auth.uid() = user_id);

-- =====================================================
-- Market News Policies - COMMENTED OUT (Marketplace removed)
-- =====================================================
/*
-- Anyone can view market news
DROP POLICY IF EXISTS "Anyone can view market news" ON public.market_news;
CREATE POLICY "Anyone can view market news" ON public.market_news
    FOR SELECT
    USING (true);

-- Only authenticated users can create news (admin check can be added later)
DROP POLICY IF EXISTS "Authenticated users can create market news" ON public.market_news;
CREATE POLICY "Authenticated users can create market news" ON public.market_news
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated users can update news
DROP POLICY IF EXISTS "Authenticated users can update market news" ON public.market_news;
CREATE POLICY "Authenticated users can update market news" ON public.market_news
    FOR UPDATE
    USING (auth.role() = 'authenticated');
*/

-- =====================================================
-- User Memory Policies
-- =====================================================

-- Users can only view their own memories
DROP POLICY IF EXISTS "Users can view their own memories" ON public.user_memory;
CREATE POLICY "Users can view their own memories" ON public.user_memory
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own memories
DROP POLICY IF EXISTS "Users can create their own memories" ON public.user_memory;
CREATE POLICY "Users can create their own memories" ON public.user_memory
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own memories
DROP POLICY IF EXISTS "Users can update their own memories" ON public.user_memory;
CREATE POLICY "Users can update their own memories" ON public.user_memory
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own memories
DROP POLICY IF EXISTS "Users can delete their own memories" ON public.user_memory;
CREATE POLICY "Users can delete their own memories" ON public.user_memory
    FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- 6. TRIGGERS
-- =====================================================

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_guild_raids_updated_at ON public.guild_raids;
CREATE TRIGGER update_guild_raids_updated_at
    BEFORE UPDATE ON public.guild_raids
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_raid_contributions_updated_at ON public.raid_contributions;
CREATE TRIGGER update_raid_contributions_updated_at
    BEFORE UPDATE ON public.raid_contributions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- COMMENTED OUT (Marketplace removed)
/*
DROP TRIGGER IF EXISTS update_market_news_updated_at ON public.market_news;
CREATE TRIGGER update_market_news_updated_at
    BEFORE UPDATE ON public.market_news
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
*/

DROP TRIGGER IF EXISTS update_user_memory_updated_at ON public.user_memory;
CREATE TRIGGER update_user_memory_updated_at
    BEFORE UPDATE ON public.user_memory
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 7. VIEWS
-- =====================================================

-- View: active_guild_raids
-- Shows all active raids with guild info
CREATE OR REPLACE VIEW public.active_guild_raids AS
SELECT 
    gr.id,
    gr.guild_id,
    g.name AS guild_name,
    gr.boss_name,
    gr.boss_description,
    gr.total_hp,
    gr.current_hp,
    ROUND((gr.current_hp::DECIMAL / gr.total_hp::DECIMAL * 100), 2) AS hp_percentage,
    gr.status,
    gr.rewards_json,
    gr.started_at,
    gr.expires_at,
    COUNT(DISTINCT rc.user_id) AS contributor_count,
    COALESCE(SUM(rc.damage_dealt), 0) AS total_damage_dealt
FROM public.guild_raids gr
LEFT JOIN public.guilds g ON g.id = gr.guild_id
LEFT JOIN public.raid_contributions rc ON rc.raid_id = gr.id
WHERE gr.status = 'active'
GROUP BY gr.id, gr.guild_id, g.name, gr.boss_name, gr.boss_description, 
         gr.total_hp, gr.current_hp, gr.status, gr.rewards_json, 
         gr.started_at, gr.expires_at;

-- View: raid_leaderboard
-- Shows top contributors for each raid
CREATE OR REPLACE VIEW public.raid_leaderboard AS
SELECT 
    rc.raid_id,
    gr.boss_name,
    rc.user_id,
    u.email,
    SUM(rc.damage_dealt) AS total_damage,
    COUNT(rc.id) AS contribution_count,
    MAX(rc.created_at) AS last_contribution
FROM public.raid_contributions rc
JOIN public.guild_raids gr ON gr.id = rc.raid_id
LEFT JOIN auth.users u ON u.id = rc.user_id
GROUP BY rc.raid_id, gr.boss_name, rc.user_id, u.email
ORDER BY total_damage DESC;

-- View: active_market_news - COMMENTED OUT (Marketplace removed)
/*
CREATE OR REPLACE VIEW public.active_market_news AS
SELECT 
    id,
    headline,
    description,
    effect_json,
    created_at,
    expires_at
FROM public.market_news
WHERE is_active = true 
AND (expires_at IS NULL OR expires_at > NOW())
ORDER BY created_at DESC;
*/

-- =====================================================
-- 8. HELPER FUNCTIONS
-- =====================================================

-- Function: Get similar memories using vector similarity
CREATE OR REPLACE FUNCTION public.find_similar_memories(
    p_user_id UUID,
    p_query_embedding vector(1536),
    p_limit INTEGER DEFAULT 5,
    p_threshold DECIMAL DEFAULT 0.7
)
RETURNS TABLE (
    id UUID,
    textual_summary TEXT,
    event_type TEXT,
    event_data JSONB,
    importance_score DECIMAL,
    similarity DECIMAL,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        um.id,
        um.textual_summary,
        um.event_type,
        um.event_data,
        um.importance_score,
        1 - (um.context_embedding <=> p_query_embedding) AS similarity,
        um.created_at
    FROM public.user_memory um
    WHERE um.user_id = p_user_id
    AND um.context_embedding IS NOT NULL
    AND (1 - (um.context_embedding <=> p_query_embedding)) >= p_threshold
    ORDER BY um.context_embedding <=> p_query_embedding
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Calculate raid progress
CREATE OR REPLACE FUNCTION public.get_raid_progress(p_raid_id UUID)
RETURNS TABLE (
    raid_id UUID,
    total_hp INTEGER,
    current_hp INTEGER,
    hp_percentage DECIMAL,
    total_damage_dealt INTEGER,
    contributor_count BIGINT,
    top_contributor_id UUID,
    top_contributor_damage INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        gr.id AS raid_id,
        gr.total_hp,
        gr.current_hp,
        ROUND((gr.current_hp::DECIMAL / gr.total_hp::DECIMAL * 100), 2) AS hp_percentage,
        COALESCE(SUM(rc.damage_dealt), 0)::INTEGER AS total_damage_dealt,
        COUNT(DISTINCT rc.user_id) AS contributor_count,
        (
            SELECT rc2.user_id
            FROM public.raid_contributions rc2
            WHERE rc2.raid_id = gr.id
            GROUP BY rc2.user_id
            ORDER BY SUM(rc2.damage_dealt) DESC
            LIMIT 1
        ) AS top_contributor_id,
        (
            SELECT SUM(rc3.damage_dealt)
            FROM public.raid_contributions rc3
            WHERE rc3.raid_id = gr.id
            GROUP BY rc3.user_id
            ORDER BY SUM(rc3.damage_dealt) DESC
            LIMIT 1
        )::INTEGER AS top_contributor_damage
    FROM public.guild_raids gr
    LEFT JOIN public.raid_contributions rc ON rc.raid_id = gr.id
    WHERE gr.id = p_raid_id
    GROUP BY gr.id, gr.total_hp, gr.current_hp;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Migration Complete
-- =====================================================

