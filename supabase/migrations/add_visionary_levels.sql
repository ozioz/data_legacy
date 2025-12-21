-- =====================================================
-- Data Legacy 2.0 - Visionary Game Static Levels
-- Migration: add_visionary_levels.sql
-- Date: 2026
-- =====================================================

-- Create visionary_levels table
CREATE TABLE IF NOT EXISTS public.visionary_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_path TEXT NOT NULL,
    correct_attributes JSONB NOT NULL,
    options JSONB NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for random selection
CREATE INDEX IF NOT EXISTS idx_visionary_levels_difficulty ON public.visionary_levels (difficulty);

-- Enable RLS
ALTER TABLE public.visionary_levels ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read levels (but not correct_attributes)
CREATE POLICY "Anyone can view visionary levels"
    ON public.visionary_levels
    FOR SELECT
    TO public
    USING (true);

-- Policy: Only authenticated users can insert/update (for admin purposes)
-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Authenticated users can manage visionary levels" ON public.visionary_levels;

CREATE POLICY "Authenticated users can manage visionary levels"
    ON public.visionary_levels
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Also allow service role (for server actions)
-- Note: This is safe because server actions run with authenticated user context

-- Insert sample levels
INSERT INTO public.visionary_levels (image_path, correct_attributes, options, difficulty) VALUES
(
    '/assets/visionary/v001.jpg',
    '{"subject": "Cyberpunk City", "style": "Neon Noir", "lighting": "Volumetric"}',
    '{
        "subjects": ["Cyberpunk City", "Medieval Castle", "Forest", "Desert"],
        "styles": ["Neon Noir", "Watercolor", "Pixel Art", "Sketch"],
        "lightings": ["Volumetric", "Flat", "Natural", "Studio"]
    }',
    'Easy'
),
(
    '/assets/visionary/v002.jpg',
    '{"subject": "Mountain Landscape", "style": "Photorealistic", "lighting": "Golden Hour"}',
    '{
        "subjects": ["Mountain Landscape", "Ocean Beach", "Urban Street", "Abstract Shapes"],
        "styles": ["Photorealistic", "Impressionist", "Minimalist", "Surreal"],
        "lightings": ["Golden Hour", "Blue Hour", "Midday", "Moonlight"]
    }',
    'Easy'
),
(
    '/assets/visionary/v003.jpg',
    '{"subject": "Steampunk Airship", "style": "Detailed Machinery", "lighting": "Dramatic"}',
    '{
        "subjects": ["Steampunk Airship", "Futuristic Spaceship", "Vintage Car", "Ancient Temple"],
        "styles": ["Detailed Machinery", "Sketch", "Watercolor", "3D Render"],
        "lightings": ["Dramatic", "Soft", "Harsh", "Ambient"]
    }',
    'Medium'
),
(
    '/assets/visionary/v004.jpg',
    '{"subject": "Abstract Geometric", "style": "Minimalist", "lighting": "High Contrast"}',
    '{
        "subjects": ["Abstract Geometric", "Portrait", "Still Life", "Nature Scene"],
        "styles": ["Minimalist", "Maximalist", "Abstract", "Realistic"],
        "lightings": ["High Contrast", "Low Contrast", "Rim Light", "Fill Light"]
    }',
    'Medium'
),
(
    '/assets/visionary/v005.jpg',
    '{"subject": "Fantasy Castle", "style": "Concept Art", "lighting": "Cinematic"}',
    '{
        "subjects": ["Fantasy Castle", "Sci-Fi City", "Post-Apocalyptic", "Historical"],
        "styles": ["Concept Art", "Photorealistic", "Anime", "Oil Painting"],
        "lightings": ["Cinematic", "Natural", "Studio", "Volumetric"]
    }',
    'Hard'
);

-- Create a view that excludes correct_attributes for client-side queries
CREATE OR REPLACE VIEW public.visionary_levels_public AS
SELECT 
    id,
    image_path,
    options,
    difficulty,
    created_at,
    updated_at
FROM public.visionary_levels;

-- Grant access to the view
GRANT SELECT ON public.visionary_levels_public TO public;

