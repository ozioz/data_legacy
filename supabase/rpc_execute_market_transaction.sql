-- ============================================================================
-- RPC Function: execute_market_transaction
-- ============================================================================
-- This function safely executes a marketplace transaction using a database
-- transaction to ensure atomicity (all-or-nothing).
-- ============================================================================

CREATE OR REPLACE FUNCTION public.execute_market_transaction(
    p_listing_id UUID,
    p_buyer_id UUID,
    p_quantity INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_listing RECORD;
    v_total_cost DECIMAL(12, 2);
    v_buyer_balance DECIMAL(12, 2);
    v_seller_balance DECIMAL(12, 2);
    v_result JSONB;
BEGIN
    -- Get listing details
    SELECT * INTO v_listing
    FROM public.market_listings
    WHERE id = p_listing_id
      AND status = 'active'
      AND quantity >= p_quantity
      AND seller_id != p_buyer_id; -- Prevent self-purchase

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Listing not found, insufficient quantity, or invalid purchase'
        );
    END IF;

    -- Calculate total cost
    v_total_cost := v_listing.price * p_quantity;

    -- Check buyer's balance (assuming users table has a balance/coins column)
    -- If balance column doesn't exist, we'll use a default check
    SELECT COALESCE(total_xp, 0) INTO v_buyer_balance
    FROM public.users
    WHERE id = p_buyer_id;

    -- For now, we'll use XP as currency (you can add a separate coins column later)
    -- Check if buyer has enough "coins" (using total_xp as proxy)
    IF v_buyer_balance < v_total_cost THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Insufficient balance'
        );
    END IF;

    -- Start transaction (all operations must succeed)
    BEGIN
        -- Update listing: reduce quantity or mark as sold
        IF v_listing.quantity = p_quantity THEN
            -- Fully sold
            UPDATE public.market_listings
            SET status = 'sold',
                sold_at = NOW(),
                buyer_id = p_buyer_id,
                updated_at = NOW()
            WHERE id = p_listing_id;
        ELSE
            -- Partially sold
            UPDATE public.market_listings
            SET quantity = quantity - p_quantity,
                updated_at = NOW()
            WHERE id = p_listing_id;
        END IF;

        -- Transfer items to buyer's inventory
        INSERT INTO public.user_inventory (user_id, item_type, item_name, quantity, metadata)
        VALUES (p_buyer_id, v_listing.item_type, v_listing.item_name, p_quantity, '{}'::jsonb)
        ON CONFLICT (user_id, item_type, item_name)
        DO UPDATE SET
            quantity = user_inventory.quantity + p_quantity,
            updated_at = NOW();

        -- Deduct coins from buyer (using total_xp as proxy - you should add a coins column)
        UPDATE public.users
        SET total_xp = total_xp - v_total_cost
        WHERE id = p_buyer_id;

        -- Add coins to seller (using total_xp as proxy)
        UPDATE public.users
        SET total_xp = total_xp + v_total_cost
        WHERE id = v_listing.seller_id;

        -- Build success result
        v_result := jsonb_build_object(
            'success', true,
            'listing_id', p_listing_id,
            'buyer_id', p_buyer_id,
            'seller_id', v_listing.seller_id,
            'item_type', v_listing.item_type,
            'item_name', v_listing.item_name,
            'quantity', p_quantity,
            'total_cost', v_total_cost
        );

        RETURN v_result;

    EXCEPTION
        WHEN OTHERS THEN
            -- Rollback on any error
            RETURN jsonb_build_object(
                'success', false,
                'error', SQLERRM
            );
    END;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.execute_market_transaction(UUID, UUID, INTEGER) TO authenticated;

