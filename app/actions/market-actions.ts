'use server'

import { createServerClient } from '@/lib/supabase/server'
import { groq } from '@/lib/groq/client'
import { FAST_MODEL } from '@/lib/groq/models'
import type { Database } from '@/types/supabase'

type MarketListing = Database['public']['Tables']['market_listings']['Row']
type MarketListingInsert = Database['public']['Tables']['market_listings']['Insert']
type UserInventory = Database['public']['Tables']['user_inventory']['Row']
type UserInventoryInsert = Database['public']['Tables']['user_inventory']['Insert']

/**
 * Get active market listings
 */
export async function getMarketListings(limit: number = 50) {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('active_market_listings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching market listings:', error)
      return { success: false, data: [], error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error in getMarketListings:', error)
    return { success: false, data: [], error: 'Failed to fetch listings' }
  }
}

/**
 * Create a market listing
 */
export async function createMarketListing(data: {
  item_type: string
  item_name: string
  description?: string
  price: number
  quantity: number
}) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Check if user has enough items in inventory
    const { data: inventory } = await supabase
      .from('user_inventory')
      .select('quantity')
      .eq('user_id', user.id)
      .eq('item_type', data.item_type)
      .eq('item_name', data.item_name)
      .single()

    if (!inventory || (inventory as any).quantity < data.quantity) {
      return { success: false, error: 'Insufficient items in inventory' }
    }

    // Create listing
    const { data: listing, error: listingError } = await (supabase as any)
      .from('market_listings')
      .insert({
        seller_id: user.id,
        item_type: data.item_type,
        item_name: data.item_name,
        description: data.description || '',
        price: data.price,
        quantity: data.quantity,
        status: 'active',
      })
      .select()
      .single()

    if (listingError) {
      console.error('Error creating listing:', listingError)
      return { success: false, error: listingError.message }
    }

    // Deduct items from inventory (reserved for sale)
    const newQuantity = (inventory as any).quantity - data.quantity
    if (newQuantity > 0) {
      await (supabase as any)
        .from('user_inventory')
        .update({ quantity: newQuantity })
        .eq('user_id', user.id)
        .eq('item_type', data.item_type)
        .eq('item_name', data.item_name)
    } else {
      await (supabase as any)
        .from('user_inventory')
        .delete()
        .eq('user_id', user.id)
        .eq('item_type', data.item_type)
        .eq('item_name', data.item_name)
    }

    return { success: true, listing }
  } catch (error) {
    console.error('Error in createMarketListing:', error)
    return { success: false, error: 'Failed to create listing' }
  }
}

/**
 * Buy an item from marketplace (uses RPC function for transaction safety)
 */
export async function buyMarketItem(listingId: string, quantity: number) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Use RPC function for safe transaction
    const { data, error } = await (supabase as any).rpc('execute_market_transaction', {
      p_listing_id: listingId,
      p_buyer_id: user.id,
      p_quantity: quantity,
    })

    if (error) {
      console.error('Error executing transaction:', error)
      return { success: false, error: error.message }
    }

    return { success: true, transaction: data }
  } catch (error) {
    console.error('Error in buyMarketItem:', error)
    return { success: false, error: 'Failed to complete transaction' }
  }
}

/**
 * Get user inventory
 */
export async function getUserInventory() {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, data: [], error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('user_inventory')
      .select('*')
      .eq('user_id', user.id)
      .order('acquired_at', { ascending: false })

    if (error) {
      console.error('Error fetching inventory:', error)
      return { success: false, data: [], error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error in getUserInventory:', error)
    return { success: false, data: [], error: 'Failed to fetch inventory' }
  }
}

/**
 * Cancel a market listing
 */
export async function cancelMarketListing(listingId: string) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get listing
    const { data: listing } = await supabase
      .from('market_listings')
      .select('*')
      .eq('id', listingId)
      .eq('seller_id', user.id)
      .single()

    if (!listing || (listing as any).status !== 'active') {
      return { success: false, error: 'Listing not found or already sold' }
    }

    // Update listing status
    const { error: updateError } = await (supabase as any)
      .from('market_listings')
      .update({ status: 'cancelled' })
      .eq('id', listingId)

    if (updateError) {
      console.error('Error cancelling listing:', updateError)
      return { success: false, error: updateError.message }
    }

    // Return items to inventory
    const { data: inventory } = await supabase
      .from('user_inventory')
      .select('quantity')
      .eq('user_id', user.id)
      .eq('item_type', (listing as any).item_type)
      .eq('item_name', (listing as any).item_name)
      .single()

    if (inventory) {
      await (supabase as any)
        .from('user_inventory')
        .update({ quantity: (inventory as any).quantity + (listing as any).quantity })
        .eq('user_id', user.id)
        .eq('item_type', (listing as any).item_type)
        .eq('item_name', (listing as any).item_name)
    } else {
      await (supabase as any).from('user_inventory').insert({
        user_id: user.id,
        item_type: (listing as any).item_type,
        item_name: (listing as any).item_name,
        quantity: (listing as any).quantity,
      })
    }

    return { success: true }
  } catch (error) {
    console.error('Error in cancelMarketListing:', error)
    return { success: false, error: 'Failed to cancel listing' }
  }
}

/**
 * Get live prices (mock data with fluctuation)
 */
export async function getLivePrices() {
  // Mock price data with random fluctuation
  const basePrices: Record<string, number> = {
    raw_data: 10,
    processed_data: 25,
    gpu_chip: 100,
    cpu_core: 50,
    memory_module: 30,
    storage_drive: 40,
  }

  const prices: Array<{ item_type: string; base_price: number; current_price: number; change_percent: number }> = []

  for (const [itemType, basePrice] of Object.entries(basePrices)) {
    // Random fluctuation between -10% and +10%
    const fluctuation = (Math.random() - 0.5) * 0.2
    const currentPrice = basePrice * (1 + fluctuation)
    const changePercent = fluctuation * 100

    prices.push({
      item_type: itemType,
      base_price: basePrice,
      current_price: Math.round(currentPrice * 100) / 100,
      change_percent: Math.round(changePercent * 100) / 100,
    })
  }

  return { success: true, data: prices }
}

/**
 * Generate market news using AI and apply price effects
 */
export async function generateMarketNews() {
  try {
    const supabase = await createServerClient()

    // Generate headline using FAST_MODEL
    const systemPrompt = `You are a tech news headline generator for a data economy game. Generate a short, impactful tech headline (max 80 characters) that could affect data/tech item prices. Examples: "Chip Shortage Hits GPU Market", "AI Training Demand Surges", "Data Privacy Regulations Tighten". Return ONLY the headline text, no quotes or explanations.`

    const completion = await groq.chat.completions.create({
      model: FAST_MODEL, // Use FAST_MODEL for instant news generation
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: 'Generate a tech headline that could affect marketplace prices.',
        },
      ],
      temperature: 0.8, // Higher temperature for creative headlines
      max_tokens: 100,
    })

    const headline = completion.choices[0]?.message?.content?.trim() || 'Market Update'

    // Analyze headline to determine price effect
    // Use AI to determine which item type and price change
    const analysisPrompt = `Analyze this tech headline and determine:
1. Which item type it affects: raw_data, processed_data, gpu_chip, cpu_core, memory_module, storage_drive
2. Price change percentage: -30 to +30 (negative = price drop, positive = price increase)

Headline: "${headline}"

Return ONLY valid JSON:
{
  "item_type": "gpu_chip",
  "price_change_percent": 15,
  "description": "Brief explanation"
}`

    const analysisCompletion = await groq.chat.completions.create({
      model: FAST_MODEL,
      messages: [
        { role: 'system', content: 'You are a market analyst. Return only valid JSON.' },
        { role: 'user', content: analysisPrompt },
      ],
      temperature: 0.3, // Lower temperature for consistent analysis
      max_tokens: 200,
      response_format: { type: 'json_object' },
    })

    const analysisText = analysisCompletion.choices[0]?.message?.content?.trim() || '{}'
    let effectJson: {
      item_type: string
      price_change_percent: number
      description?: string
    }

    try {
      effectJson = JSON.parse(analysisText)
    } catch {
      // Fallback: Default effect
      effectJson = {
        item_type: 'gpu_chip',
        price_change_percent: Math.floor(Math.random() * 20) - 10, // -10% to +10%
        description: 'Market fluctuation',
      }
    }

    // Validate and clamp price change
    const priceChangePercent = Math.max(-30, Math.min(30, effectJson.price_change_percent || 0))
    const validItemTypes = ['raw_data', 'processed_data', 'gpu_chip', 'cpu_core', 'memory_module', 'storage_drive']
    const itemType = validItemTypes.includes(effectJson.item_type) ? effectJson.item_type : 'gpu_chip'

    const finalEffectJson = {
      item_type: itemType,
      price_change_percent: priceChangePercent,
      description: effectJson.description || `Market news affecting ${itemType}`,
    }

    // Create market news entry
    const { data: news, error: newsError } = await (supabase as any)
      .from('market_news')
      .insert({
        headline: headline.substring(0, 200), // Ensure max length
        description: finalEffectJson.description,
        effect_json: finalEffectJson,
        is_active: true,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      })
      .select()
      .single()

    if (newsError) {
      console.error('Error creating market news:', newsError)
      return { success: false, error: newsError.message }
    }

    // Apply news effects to active listings using RPC
    const { data: applyResult, error: applyError } = await (supabase as any).rpc('apply_market_news', {
      p_news_id: news.id,
    })

    if (applyError) {
      console.error('Error applying market news:', applyError)
      // News was created but application failed - still return success with warning
      return {
        success: true,
        news,
        effect: finalEffectJson,
        warning: 'News created but price update failed',
      }
    }

    return {
      success: true,
      news,
      effect: finalEffectJson,
      applied: applyResult,
    }
  } catch (error: any) {
    console.error('Error generating market news:', error)
    return { success: false, error: error?.message || 'Failed to generate market news' }
  }
}

/**
 * Get active market news
 */
export async function getActiveMarketNews(limit: number = 5) {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('active_market_news')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching market news:', error)
      return { success: false, data: [], error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error in getActiveMarketNews:', error)
    return { success: false, data: [], error: 'Failed to fetch market news' }
  }
}

/**
 * Get price history for statistical analysis
 */
export async function getPriceHistory(limit: number = 20) {
  try {
    // Generate mock price history based on current prices
    const pricesResult = await getLivePrices()
    if (!pricesResult.success) {
      return { success: false, data: [], error: 'Failed to get prices' }
    }

    // Generate historical data points
    const history: Array<{ time: number; price: number; item_type: string }> = []
    const currentPrices = pricesResult.data

    for (let i = limit - 1; i >= 0; i--) {
      const timeOffset = i * 5 // 5 minutes apart
      currentPrices.forEach((priceData: any) => {
        // Add some random variation to simulate historical prices
        const variation = (Math.random() - 0.5) * 0.1 // ±5% variation
        const historicalPrice = priceData.current_price * (1 + variation)
        history.push({
          time: Date.now() - timeOffset * 60 * 1000,
          price: Math.round(historicalPrice * 100) / 100,
          item_type: priceData.item_type,
        })
      })
    }

    return { success: true, data: history }
  } catch (error) {
    console.error('Error in getPriceHistory:', error)
    return { success: false, data: [], error: 'Failed to fetch price history' }
  }
}

/**
 * Submit Quant Tools answer and update math skill score
 */
export async function submitQuantAnswer(
  questionType: 'volatility' | 'probability',
  userAnswer: string,
  correctAnswer: string | number
) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Check if answer is correct
    let isCorrect = false
    if (questionType === 'volatility') {
      isCorrect = userAnswer.toLowerCase() === String(correctAnswer).toLowerCase()
    } else if (questionType === 'probability') {
      const userNum = parseInt(userAnswer)
      isCorrect = !isNaN(userNum) && userNum === correctAnswer
    }

    // Get current user data
    const { data: userData } = await supabase
      .from('users')
      .select('math_skill_score, fee_discount_expires_at')
      .eq('id', user.id)
      .single()

    const currentMathScore = (userData as any)?.math_skill_score || 0
    const newMathScore = isCorrect ? currentMathScore + 10 : Math.max(0, currentMathScore - 2)

    // Calculate fee discount expiration (10 minutes from now if correct)
    const feeDiscountExpiresAt = isCorrect
      ? new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
      : (userData as any)?.fee_discount_expires_at || null

    // Update user profile
    const { error: updateError } = await (supabase as any)
      .from('users')
      .update({
        math_skill_score: newMathScore,
        fee_discount_expires_at: feeDiscountExpiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating user:', updateError)
      return { success: false, error: updateError.message }
    }

    return {
      success: true,
      isCorrect,
      mathScore: newMathScore,
      feeDiscountExpiresAt,
    }
  } catch (error: any) {
    console.error('Error in submitQuantAnswer:', error)
    return { success: false, error: error?.message || 'Failed to submit answer' }
  }
}

