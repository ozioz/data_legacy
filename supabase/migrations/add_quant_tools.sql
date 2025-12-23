-- Add Quant Tools columns to users table - REMOVED: Focus on Data Career Simulation
-- NOTE: Quant Tools feature has been removed to focus strictly on Data Professional Career Simulation.
-- These columns are commented out for future migration cleanup.

/*
-- Add math_skill_score column (default 0)
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS math_skill_score INTEGER DEFAULT 0 CHECK (math_skill_score >= 0);

-- Add fee_discount_expires_at column (timestamp for when fee discount expires)
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS fee_discount_expires_at TIMESTAMPTZ;

-- Add comment for documentation
COMMENT ON COLUMN public.users.math_skill_score IS 'User''s math/statistics skill score from Quant Tools mini-games';
COMMENT ON COLUMN public.users.fee_discount_expires_at IS 'Timestamp when the 0% trading fee discount expires (10 minutes after correct Quant Tools answer)';

-- Create index for fee_discount_expires_at for efficient queries
CREATE INDEX IF NOT EXISTS idx_users_fee_discount_expires_at ON public.users(fee_discount_expires_at) WHERE fee_discount_expires_at IS NOT NULL;
*/

