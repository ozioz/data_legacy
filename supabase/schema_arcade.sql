-- Data Legacy 2.0 - Prompt Arcade & Career Mode Extensions
-- Run this AFTER the main schema.sql

-- ==================== PROMPT ARCADE TABLES ====================

-- Prompt Battles: Stores user inputs and AI scores for arcade games
CREATE TABLE IF NOT EXISTS public.prompt_battles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    game_type TEXT NOT NULL CHECK (game_type IN ('VISIONARY', 'AGENT_HANDLER', 'ALGORITHM', 'COACH_GPT')),
    target_context TEXT NOT NULL, -- The hidden target/context
    user_input TEXT NOT NULL, -- User's prompt/answer
    ai_score INTEGER DEFAULT 0, -- 0-100 similarity/quality score
    ai_feedback TEXT, -- AI-generated feedback
    metadata JSONB, -- Game-specific data (e.g., image description, task outcome)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Roguelite Decks: Stores active upgrades for Tower Defense runs
CREATE TABLE IF NOT EXISTS public.roguelite_decks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    session_id UUID, -- Links to game_sessions
    wave_number INTEGER DEFAULT 1,
    upgrade_cards JSONB NOT NULL, -- Array of upgrade objects
    deck_state JSONB, -- Current deck configuration
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tool Chains: Predefined chains for Agent Handler game
CREATE TABLE IF NOT EXISTS public.tool_chains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_outcome TEXT NOT NULL, -- The completed task description
    correct_sequence TEXT[] NOT NULL, -- Array of tool IDs in correct order
    tools JSONB NOT NULL, -- Available tools with metadata
    difficulty INTEGER DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== ENHANCED LEADERBOARDS ====================

-- Global Leaderboards (extends existing leaderboard view)
CREATE TABLE IF NOT EXISTS public.leaderboard_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    game_type TEXT NOT NULL,
    metric_type TEXT NOT NULL, -- 'xp', 'score', 'throughput', 'time'
    metric_value NUMERIC NOT NULL,
    level_id TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, game_type, metric_type, level_id)
);

-- ==================== IDLE GAME MECHANICS ====================

-- Idle Production: Tracks offline resource generation
CREATE TABLE IF NOT EXISTS public.idle_production (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    game_type TEXT NOT NULL,
    last_active TIMESTAMPTZ NOT NULL,
    production_rate NUMERIC DEFAULT 1, -- Resources per second
    accumulated_resources NUMERIC DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== INDEXES ====================

CREATE INDEX IF NOT EXISTS idx_prompt_battles_user_id ON public.prompt_battles(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_battles_game_type ON public.prompt_battles(game_type);
CREATE INDEX IF NOT EXISTS idx_prompt_battles_created_at ON public.prompt_battles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_roguelite_decks_user_id ON public.roguelite_decks(user_id);
CREATE INDEX IF NOT EXISTS idx_roguelite_decks_session_id ON public.roguelite_decks(session_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_game_type ON public.leaderboard_entries(game_type, metric_type, metric_value DESC);
CREATE INDEX IF NOT EXISTS idx_idle_production_user_id ON public.idle_production(user_id);

-- ==================== RLS POLICIES ====================

ALTER TABLE public.prompt_battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roguelite_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_chains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idle_production ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can insert own prompt battles" ON public.prompt_battles;
DROP POLICY IF EXISTS "Users can view own prompt battles" ON public.prompt_battles;
DROP POLICY IF EXISTS "Users can manage own roguelite decks" ON public.roguelite_decks;
DROP POLICY IF EXISTS "Anyone can view tool chains" ON public.tool_chains;
DROP POLICY IF EXISTS "Users can insert own leaderboard entries" ON public.leaderboard_entries;
DROP POLICY IF EXISTS "Anyone can view leaderboard entries" ON public.leaderboard_entries;
DROP POLICY IF EXISTS "Users can manage own idle production" ON public.idle_production;

-- Prompt Battles: Users can insert/read their own
CREATE POLICY "Users can insert own prompt battles"
    ON public.prompt_battles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own prompt battles"
    ON public.prompt_battles FOR SELECT
    USING (auth.uid() = user_id);

-- Roguelite Decks: Users can manage their own decks
CREATE POLICY "Users can manage own roguelite decks"
    ON public.roguelite_decks FOR ALL
    USING (auth.uid() = user_id);

-- Tool Chains: Public read (for game data)
CREATE POLICY "Anyone can view tool chains"
    ON public.tool_chains FOR SELECT
    USING (true);

-- Leaderboard Entries: Users can insert, anyone can read
CREATE POLICY "Users can insert own leaderboard entries"
    ON public.leaderboard_entries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view leaderboard entries"
    ON public.leaderboard_entries FOR SELECT
    USING (true);

-- Idle Production: Users can manage their own
CREATE POLICY "Users can manage own idle production"
    ON public.idle_production FOR ALL
    USING (auth.uid() = user_id);

-- ==================== FUNCTIONS ====================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_roguelite_deck_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_roguelite_decks_updated_at ON public.roguelite_decks;
CREATE TRIGGER update_roguelite_decks_updated_at 
    BEFORE UPDATE ON public.roguelite_decks
    FOR EACH ROW EXECUTE FUNCTION update_roguelite_deck_timestamp();

-- Function to calculate idle resources
CREATE OR REPLACE FUNCTION calculate_idle_resources(
    p_user_id UUID,
    p_game_type TEXT
)
RETURNS NUMERIC AS $$
DECLARE
    v_production_rate NUMERIC;
    v_last_active TIMESTAMPTZ;
    v_seconds_elapsed NUMERIC;
    v_resources NUMERIC;
BEGIN
    SELECT production_rate, last_active, accumulated_resources
    INTO v_production_rate, v_last_active, v_resources
    FROM public.idle_production
    WHERE user_id = p_user_id AND game_type = p_game_type;

    IF v_last_active IS NULL THEN
        RETURN 0;
    END IF;

    v_seconds_elapsed := EXTRACT(EPOCH FROM (NOW() - v_last_active));
    v_resources := v_resources + (v_production_rate * v_seconds_elapsed);

    -- Cap at reasonable maximum (24 hours)
    IF v_seconds_elapsed > 86400 THEN
        v_seconds_elapsed := 86400;
        v_resources := v_production_rate * 86400;
    END IF;

    RETURN v_resources;
END;
$$ language 'plpgsql';

-- ==================== SAMPLE DATA ====================

-- Insert sample tool chains for Agent Handler
INSERT INTO public.tool_chains (task_outcome, correct_sequence, tools, difficulty) VALUES
(
    'Meeting booked for tomorrow at 2 PM and synced to calendar',
    ARRAY['search_calendar', 'check_availability', 'book_meeting', 'sync_calendar', 'send_confirmation'],
    '[
        {"id": "search_calendar", "name": "Search Calendar", "icon": "calendar"},
        {"id": "check_availability", "name": "Check Availability", "icon": "clock"},
        {"id": "book_meeting", "name": "Book Meeting", "icon": "calendar-plus"},
        {"id": "sync_calendar", "name": "Sync Calendar", "icon": "refresh"},
        {"id": "send_confirmation", "name": "Send Confirmation", "icon": "mail"},
        {"id": "cancel_meeting", "name": "Cancel Meeting", "icon": "x"},
        {"id": "reschedule", "name": "Reschedule", "icon": "arrow-right"}
    ]'::jsonb,
    2
),
(
    'Product ordered, payment processed, shipping label created',
    ARRAY['search_product', 'add_to_cart', 'process_payment', 'create_shipping_label', 'send_tracking'],
    '[
        {"id": "search_product", "name": "Search Product", "icon": "search"},
        {"id": "add_to_cart", "name": "Add to Cart", "icon": "shopping-cart"},
        {"id": "process_payment", "name": "Process Payment", "icon": "credit-card"},
        {"id": "create_shipping_label", "name": "Create Shipping Label", "icon": "package"},
        {"id": "send_tracking", "name": "Send Tracking", "icon": "mail"},
        {"id": "apply_discount", "name": "Apply Discount", "icon": "tag"},
        {"id": "check_inventory", "name": "Check Inventory", "icon": "database"}
    ]'::jsonb,
    3
)
ON CONFLICT DO NOTHING;

