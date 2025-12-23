-- Add Project Genesis columns to career_progress table
-- These columns store the state of the 4-stage Project Genesis simulation

ALTER TABLE public.career_progress
ADD COLUMN IF NOT EXISTS raw_data_quality INTEGER DEFAULT 0 CHECK (raw_data_quality >= 0 AND raw_data_quality <= 100),
ADD COLUMN IF NOT EXISTS model_integrity INTEGER DEFAULT 0 CHECK (model_integrity >= 0 AND model_integrity <= 100),
ADD COLUMN IF NOT EXISTS semantic_layer_score INTEGER DEFAULT 0 CHECK (semantic_layer_score >= 0 AND semantic_layer_score <= 100),
ADD COLUMN IF NOT EXISTS business_value INTEGER DEFAULT 0 CHECK (business_value >= 0 AND business_value <= 100),
ADD COLUMN IF NOT EXISTS current_stage INTEGER DEFAULT 1 CHECK (current_stage >= 1 AND current_stage <= 4),
ADD COLUMN IF NOT EXISTS stages_completed INTEGER[] DEFAULT ARRAY[]::INTEGER[];

-- Add comment for documentation
COMMENT ON COLUMN public.career_progress.raw_data_quality IS 'Stage 1: Source Ingestion quality score (0-100)';
COMMENT ON COLUMN public.career_progress.model_integrity IS 'Stage 2: Data Modeling integrity score (0-100)';
COMMENT ON COLUMN public.career_progress.semantic_layer_score IS 'Stage 3: Semantic Layer score (0-100)';
COMMENT ON COLUMN public.career_progress.business_value IS 'Stage 4: Reporting business value score (0-100)';
COMMENT ON COLUMN public.career_progress.current_stage IS 'Current stage in Project Genesis (1-4)';
COMMENT ON COLUMN public.career_progress.stages_completed IS 'Array of completed stage numbers [1,2,3,4]';

