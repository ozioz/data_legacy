-- ============================================================================
-- RPC Function: apply_market_news
-- ============================================================================
-- This function applies market news effects to active listings by updating
-- prices based on the news effect_json multiplier.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.apply_market_news(
    p_news_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_news RECORD;
    v_effect JSONB;
    v_item_type TEXT;
    v_price_multiplier DECIMAL(5,2);
    v_affected_count INTEGER := 0;
    v_result JSONB;
BEGIN
    -- Get market news
    SELECT * INTO v_news
    FROM public.market_news
    WHERE id = p_news_id
      AND is_active = true;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Market news not found or inactive'
        );
    END IF;

    v_effect := v_news.effect_json;

    -- Extract item_type and price_multiplier from effect_json
    -- Expected format: { "item_type": "gpu_chip", "price_change_percent": 15 }
    v_item_type := v_effect->>'item_type';
    v_price_multiplier := 1.0 + ((v_effect->>'price_change_percent')::DECIMAL / 100.0);

    IF v_item_type IS NULL OR v_price_multiplier IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invalid effect_json format'
        );
    END IF;

    -- Update prices for active listings matching the item_type
    UPDATE public.market_listings
    SET 
        price = ROUND(price * v_price_multiplier, 2),
        volatility_index = LEAST(volatility_index + ABS((v_effect->>'price_change_percent')::DECIMAL), 100),
        updated_at = NOW()
    WHERE status = 'active'
      AND item_type = v_item_type;

    GET DIAGNOSTICS v_affected_count = ROW_COUNT;

    -- Build success result
    v_result := jsonb_build_object(
        'success', true,
        'news_id', p_news_id,
        'headline', v_news.headline,
        'item_type', v_item_type,
        'price_multiplier', v_price_multiplier,
        'affected_listings', v_affected_count
    );

    RETURN v_result;

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.apply_market_news(UUID) TO authenticated;

