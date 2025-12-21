-- ============================================================================
-- Data Legacy 2.0 - Social, Economy & AI Features Schema
-- ============================================================================
-- This schema adds:
-- 1. Vector extension for semantic search
-- 2. Guild system (social features)
-- 3. Marketplace (economy features)
-- 4. AI Interview Sessions (smarter AI features)
-- ============================================================================

-- Enable Vector Extension for Semantic Search
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- GUILDS (Social Features)
-- ============================================================================

-- Guilds Table
CREATE TABLE IF NOT EXISTS public.guilds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    leader_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    total_xp BIGINT DEFAULT 0,
    member_count INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT guild_name_length CHECK (char_length(name) >= 3 AND char_length(name) <= 100)
);

-- Guild Members Table
CREATE TABLE IF NOT EXISTS public.guild_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('leader', 'officer', 'member')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    contributed_xp BIGINT DEFAULT 0,
    UNIQUE(guild_id, user_id)
);

-- ============================================================================
-- MARKETPLACE (Economy Features)
-- ============================================================================

-- Market Listings Table
CREATE TABLE IF NOT EXISTS public.market_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL,
    item_name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(12, 2) NOT NULL CHECK (price > 0),
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    sold_at TIMESTAMPTZ,
    buyer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- User Inventory Table
CREATE TABLE IF NOT EXISTS public.user_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL,
    item_name VARCHAR(200) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 0),
    metadata JSONB DEFAULT '{}'::jsonb,
    acquired_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, item_type, item_name)
);

-- ============================================================================
-- AI INTERVIEW SESSIONS (Smarter AI Features)
-- ============================================================================

-- AI Interview Sessions Table
CREATE TABLE IF NOT EXISTS public.ai_interview_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_role VARCHAR(100) NOT NULL,
    job_level VARCHAR(50) NOT NULL CHECK (job_level IN ('junior', 'mid', 'senior', 'lead', 'architect')),
    transcript_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    feedback_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
    status VARCHAR(20) NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration_seconds INTEGER
);

-- Add vector column for semantic search (for future use)
ALTER TABLE public.ai_interview_sessions 
ADD COLUMN IF NOT EXISTS transcript_embedding vector(1536);

-- ============================================================================
-- INDEXES for Performance
-- ============================================================================

-- Guilds indexes
CREATE INDEX IF NOT EXISTS idx_guilds_leader_id ON public.guilds(leader_id);
CREATE INDEX IF NOT EXISTS idx_guilds_total_xp ON public.guilds(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_guild_members_guild_id ON public.guild_members(guild_id);
CREATE INDEX IF NOT EXISTS idx_guild_members_user_id ON public.guild_members(user_id);

-- Marketplace indexes
CREATE INDEX IF NOT EXISTS idx_market_listings_seller_id ON public.market_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_market_listings_item_type ON public.market_listings(item_type);
CREATE INDEX IF NOT EXISTS idx_market_listings_status ON public.market_listings(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_market_listings_created_at ON public.market_listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_inventory_user_id ON public.user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_item_type ON public.user_inventory(item_type);

-- AI Interview indexes
CREATE INDEX IF NOT EXISTS idx_ai_interview_sessions_user_id ON public.ai_interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_interview_sessions_job_role ON public.ai_interview_sessions(job_role);
CREATE INDEX IF NOT EXISTS idx_ai_interview_sessions_status ON public.ai_interview_sessions(status);
CREATE INDEX IF NOT EXISTS idx_ai_interview_sessions_created_at ON public.ai_interview_sessions(created_at DESC);

-- Vector similarity search index (for future use)
CREATE INDEX IF NOT EXISTS idx_ai_interview_transcript_embedding 
ON public.ai_interview_sessions 
USING ivfflat (transcript_embedding vector_cosine_ops)
WITH (lists = 100);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.guilds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_interview_sessions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- GUILDS POLICIES
-- ============================================================================

-- Guilds: Everyone can read (for leaderboards)
DROP POLICY IF EXISTS "Guilds are viewable by everyone" ON public.guilds;
CREATE POLICY "Guilds are viewable by everyone"
    ON public.guilds FOR SELECT
    USING (true);

-- Guilds: Only authenticated users can create
DROP POLICY IF EXISTS "Authenticated users can create guilds" ON public.guilds;
CREATE POLICY "Authenticated users can create guilds"
    ON public.guilds FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Guilds: Only leader can update
DROP POLICY IF EXISTS "Guild leaders can update their guild" ON public.guilds;
CREATE POLICY "Guild leaders can update their guild"
    ON public.guilds FOR UPDATE
    USING (auth.uid() = leader_id)
    WITH CHECK (auth.uid() = leader_id);

-- Guilds: Only leader can delete
DROP POLICY IF EXISTS "Guild leaders can delete their guild" ON public.guilds;
CREATE POLICY "Guild leaders can delete their guild"
    ON public.guilds FOR DELETE
    USING (auth.uid() = leader_id);

-- ============================================================================
-- GUILD MEMBERS POLICIES
-- ============================================================================

-- Guild Members: Members can view their guild's members
DROP POLICY IF EXISTS "Guild members can view their guild" ON public.guild_members;
CREATE POLICY "Guild members can view their guild"
    ON public.guild_members FOR SELECT
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.guild_members gm
            WHERE gm.guild_id = guild_members.guild_id
            AND gm.user_id = auth.uid()
        )
    );

-- Guild Members: Users can join guilds
DROP POLICY IF EXISTS "Users can join guilds" ON public.guild_members;
CREATE POLICY "Users can join guilds"
    ON public.guild_members FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Guild Members: Leaders can update member roles
DROP POLICY IF EXISTS "Guild leaders can update member roles" ON public.guild_members;
CREATE POLICY "Guild leaders can update member roles"
    ON public.guild_members FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.guilds g
            WHERE g.id = guild_members.guild_id
            AND g.leader_id = auth.uid()
        )
    );

-- Guild Members: Users can leave, leaders can remove members
DROP POLICY IF EXISTS "Users can leave or be removed from guilds" ON public.guild_members;
CREATE POLICY "Users can leave or be removed from guilds"
    ON public.guild_members FOR DELETE
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.guilds g
            WHERE g.id = guild_members.guild_id
            AND g.leader_id = auth.uid()
        )
    );

-- ============================================================================
-- MARKETPLACE POLICIES
-- ============================================================================

-- Market Listings: Everyone can view active listings
DROP POLICY IF EXISTS "Active listings are viewable by everyone" ON public.market_listings;
CREATE POLICY "Active listings are viewable by everyone"
    ON public.market_listings FOR SELECT
    USING (status = 'active' OR auth.uid() = seller_id);

-- Market Listings: Authenticated users can create listings
DROP POLICY IF EXISTS "Authenticated users can create listings" ON public.market_listings;
CREATE POLICY "Authenticated users can create listings"
    ON public.market_listings FOR INSERT
    WITH CHECK (auth.uid() = seller_id);

-- Market Listings: Only seller can update their listings
DROP POLICY IF EXISTS "Sellers can update their listings" ON public.market_listings;
CREATE POLICY "Sellers can update their listings"
    ON public.market_listings FOR UPDATE
    USING (auth.uid() = seller_id)
    WITH CHECK (auth.uid() = seller_id);

-- Market Listings: Only seller can delete their listings
DROP POLICY IF EXISTS "Sellers can delete their listings" ON public.market_listings;
CREATE POLICY "Sellers can delete their listings"
    ON public.market_listings FOR DELETE
    USING (auth.uid() = seller_id);

-- ============================================================================
-- USER INVENTORY POLICIES
-- ============================================================================

-- User Inventory: Users can only view their own inventory
DROP POLICY IF EXISTS "Users can view own inventory" ON public.user_inventory;
CREATE POLICY "Users can view own inventory"
    ON public.user_inventory FOR SELECT
    USING (auth.uid() = user_id);

-- User Inventory: Users can insert their own items
DROP POLICY IF EXISTS "Users can insert own inventory" ON public.user_inventory;
CREATE POLICY "Users can insert own inventory"
    ON public.user_inventory FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- User Inventory: Users can update their own inventory
DROP POLICY IF EXISTS "Users can update own inventory" ON public.user_inventory;
CREATE POLICY "Users can update own inventory"
    ON public.user_inventory FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- User Inventory: Users can delete their own inventory
DROP POLICY IF EXISTS "Users can delete own inventory" ON public.user_inventory;
CREATE POLICY "Users can delete own inventory"
    ON public.user_inventory FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- AI INTERVIEW SESSIONS POLICIES
-- ============================================================================

-- AI Interview Sessions: Users can only view their own sessions
DROP POLICY IF EXISTS "Users can view own interview sessions" ON public.ai_interview_sessions;
CREATE POLICY "Users can view own interview sessions"
    ON public.ai_interview_sessions FOR SELECT
    USING (auth.uid() = user_id);

-- AI Interview Sessions: Users can create their own sessions
DROP POLICY IF EXISTS "Users can create own interview sessions" ON public.ai_interview_sessions;
CREATE POLICY "Users can create own interview sessions"
    ON public.ai_interview_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- AI Interview Sessions: Users can update their own sessions
DROP POLICY IF EXISTS "Users can update own interview sessions" ON public.ai_interview_sessions;
CREATE POLICY "Users can update own interview sessions"
    ON public.ai_interview_sessions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- AI Interview Sessions: Users can delete their own sessions
DROP POLICY IF EXISTS "Users can delete own interview sessions" ON public.ai_interview_sessions;
CREATE POLICY "Users can delete own interview sessions"
    ON public.ai_interview_sessions FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function: Update guild member count
CREATE OR REPLACE FUNCTION public.update_guild_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.guilds
        SET member_count = (
            SELECT COUNT(*) FROM public.guild_members
            WHERE guild_id = NEW.guild_id
        )
        WHERE id = NEW.guild_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.guilds
        SET member_count = (
            SELECT COUNT(*) FROM public.guild_members
            WHERE guild_id = OLD.guild_id
        )
        WHERE id = OLD.guild_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Auto-update guild member count
DROP TRIGGER IF EXISTS trigger_update_guild_member_count ON public.guild_members;
CREATE TRIGGER trigger_update_guild_member_count
    AFTER INSERT OR DELETE ON public.guild_members
    FOR EACH ROW
    EXECUTE FUNCTION public.update_guild_member_count();

-- Function: Update guild total XP from member contributions
CREATE OR REPLACE FUNCTION public.update_guild_total_xp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.guilds
    SET total_xp = (
        SELECT COALESCE(SUM(contributed_xp), 0) FROM public.guild_members
        WHERE guild_id = NEW.guild_id
    )
    WHERE id = NEW.guild_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Auto-update guild total XP
DROP TRIGGER IF EXISTS trigger_update_guild_total_xp ON public.guild_members;
CREATE TRIGGER trigger_update_guild_total_xp
    AFTER INSERT OR UPDATE OF contributed_xp ON public.guild_members
    FOR EACH ROW
    EXECUTE FUNCTION public.update_guild_total_xp();

-- Function: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers: Auto-update updated_at
DROP TRIGGER IF EXISTS trigger_update_guilds_updated_at ON public.guilds;
CREATE TRIGGER trigger_update_guilds_updated_at
    BEFORE UPDATE ON public.guilds
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_market_listings_updated_at ON public.market_listings;
CREATE TRIGGER trigger_update_market_listings_updated_at
    BEFORE UPDATE ON public.market_listings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_user_inventory_updated_at ON public.user_inventory;
CREATE TRIGGER trigger_update_user_inventory_updated_at
    BEFORE UPDATE ON public.user_inventory
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- VIEWS for Convenience
-- ============================================================================

-- View: Guild Leaderboard
CREATE OR REPLACE VIEW public.guild_leaderboard AS
SELECT 
    g.id,
    g.name,
    g.description,
    g.total_xp,
    g.member_count,
    g.created_at,
    u.email as leader_email,
    COUNT(gm.id) as actual_member_count
FROM public.guilds g
LEFT JOIN auth.users u ON g.leader_id = u.id
LEFT JOIN public.guild_members gm ON g.id = gm.guild_id
GROUP BY g.id, g.name, g.description, g.total_xp, g.member_count, g.created_at, u.email
ORDER BY g.total_xp DESC;

-- View: Active Market Listings
CREATE OR REPLACE VIEW public.active_market_listings AS
SELECT 
    ml.id,
    ml.seller_id,
    ml.item_type,
    ml.item_name,
    ml.description,
    ml.price,
    ml.quantity,
    ml.created_at,
    u.email as seller_email
FROM public.market_listings ml
LEFT JOIN auth.users u ON ml.seller_id = u.id
WHERE ml.status = 'active'
ORDER BY ml.created_at DESC;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant SELECT on views to authenticated users
GRANT SELECT ON public.guild_leaderboard TO authenticated;
GRANT SELECT ON public.active_market_listings TO authenticated;

-- ============================================================================
-- COMMENTS for Documentation
-- ============================================================================

COMMENT ON TABLE public.guilds IS 'Guilds (social groups) for players to join and collaborate';
COMMENT ON TABLE public.guild_members IS 'Membership records for guilds';
COMMENT ON TABLE public.market_listings IS 'Marketplace listings for trading items';
COMMENT ON TABLE public.user_inventory IS 'User inventory of items and resources';
COMMENT ON TABLE public.ai_interview_sessions IS 'AI-powered interview sessions with vector embeddings for semantic search';
COMMENT ON COLUMN public.ai_interview_sessions.transcript_embedding IS 'Vector embedding for semantic similarity search (1536 dimensions for OpenAI embeddings)';

