'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ShoppingCart, TrendingUp, TrendingDown, Package, Plus, X, Calculator } from 'lucide-react'
import QuantTools from '@/components/market/QuantTools'
import {
  getMarketListings,
  getUserInventory,
  createMarketListing,
  buyMarketItem,
  getLivePrices,
  cancelMarketListing,
  getActiveMarketNews,
  generateMarketNews,
} from '@/app/actions/market-actions'
import { GAME_ASSETS } from '@/lib/game/assets'

export default function MarketPage() {
  const [listings, setListings] = useState<any[]>([])
  const [inventory, setInventory] = useState<any[]>([])
  const [prices, setPrices] = useState<any[]>([])
  const [marketNews, setMarketNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [generatingNews, setGeneratingNews] = useState(false)
  const [showQuantTools, setShowQuantTools] = useState(false)

  useEffect(() => {
    loadData()
    // Refresh prices every 10 seconds
    const priceInterval = setInterval(() => {
      loadPrices()
    }, 10000)
    return () => clearInterval(priceInterval)
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [listingsResult, inventoryResult, pricesResult, newsResult] = await Promise.all([
      getMarketListings(50),
      getUserInventory(),
      getLivePrices(),
      getActiveMarketNews(5),
    ])

    if (listingsResult.success) setListings(listingsResult.data)
    if (inventoryResult.success) setInventory(inventoryResult.data)
    if (pricesResult.success) setPrices(pricesResult.data)
    if (newsResult.success) setMarketNews(newsResult.data)
    setLoading(false)
  }

  const loadPrices = async () => {
    const result = await getLivePrices()
    if (result.success) setPrices(result.data)
  }

  const handleGenerateNews = async () => {
    setGeneratingNews(true)
    const result = await generateMarketNews()
    if (result.success) {
      // Reload data to show new news and updated prices
      await loadData()
      alert(`Market News Generated: ${result.news.headline}\nEffect: ${result.effect?.item_type || 'N/A'} ${result.effect?.price_change_percent ? (result.effect.price_change_percent > 0 ? '+' : '') + result.effect.price_change_percent + '%' : 'N/A'}`)
    } else {
      alert(result.error || 'Failed to generate market news')
    }
    setGeneratingNews(false)
  }

  const handleBuy = async (listingId: string, quantity: number) => {
    if (!confirm(`Buy ${quantity} items from this listing?`)) return

    const result = await buyMarketItem(listingId, quantity)
    if (result.success) {
      alert('Purchase successful!')
      loadData()
    } else {
      alert(result.error || 'Purchase failed')
    }
  }

  const handleCreateListing = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      item_type: formData.get('item_type') as string,
      item_name: formData.get('item_name') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      quantity: parseInt(formData.get('quantity') as string),
    }

    const result = await createMarketListing(data)
    if (result.success) {
      setShowCreateModal(false)
      setSelectedItem(null)
      loadData()
    } else {
      alert(result.error || 'Failed to create listing')
    }
  }

  const handleCancelListing = async (listingId: string) => {
    if (!confirm('Cancel this listing? Items will be returned to your inventory.')) return

    const result = await cancelMarketListing(listingId)
    if (result.success) {
      loadData()
    } else {
      alert(result.error || 'Failed to cancel listing')
    }
  }

  // Market News Ticker Component
  const NewsTicker = () => {
    if (!marketNews || marketNews.length === 0) return null

    return (
      <div className="relative w-full bg-black/50 border-b border-neon-blue/30 overflow-hidden mb-6">
        <div className="flex items-center py-2">
          <div className="flex-shrink-0 px-4 text-neon-blue font-bold text-sm whitespace-nowrap">
            📰 MARKET NEWS:
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="flex animate-scroll-left space-x-8">
              {marketNews.map((news: any, index: number) => {
                const effect = news.effect_json || {}
                const changePercent = effect.price_change_percent || 0
                const isPositive = changePercent > 0
                return (
                  <div key={news.id || index} className="flex items-center space-x-4 whitespace-nowrap">
                    <span className="text-white text-sm">{news.headline}</span>
                    {effect.item_type && (
                      <span className={`text-xs font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {effect.item_type}: {isPositive ? '+' : ''}{changePercent}%
                      </span>
                    )}
                  </div>
                )
              })}
              {/* Duplicate for seamless loop */}
              {marketNews.map((news: any, index: number) => {
                const effect = news.effect_json || {}
                const changePercent = effect.price_change_percent || 0
                const isPositive = changePercent > 0
                return (
                  <div key={`dup-${news.id || index}`} className="flex items-center space-x-4 whitespace-nowrap">
                    <span className="text-white text-sm">{news.headline}</span>
                    {effect.item_type && (
                      <span className={`text-xs font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {effect.item_type}: {isPositive ? '+' : ''}{changePercent}%
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
          <button
            onClick={handleGenerateNews}
            disabled={generatingNews}
            className="flex-shrink-0 px-4 py-1 mx-2 bg-neon-blue/20 hover:bg-neon-blue/30 text-neon-blue text-xs font-semibold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generatingNews ? 'Generating...' : 'Generate News'}
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-white">Loading marketplace...</div>
        </div>
      </div>
    )
  }

  // Check if background image exists, fallback to gradient
  const hasMarketBg = true // In production, you might want to check this

  return (
    <div className="min-h-screen relative p-8">
      {/* Background Image with Fallback Gradient */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900"></div>
        {GAME_ASSETS.marketBg && (
          <Image
            src={GAME_ASSETS.marketBg}
            alt="Marketplace background"
            fill
            className="object-cover opacity-30"
            priority
            onError={(e) => {
              // Hide image on error, gradient will show
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-purple-900/80 to-gray-900/80"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Marketplace</h1>
            <p className="text-gray-300">Buy and sell resources from Data Farm</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowQuantTools(true)}
              className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
            >
              <Calculator className="w-5 h-5" />
              Quant Tools
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Listing
            </button>
          </div>
        </div>

        {/* Market News Ticker */}
        <NewsTicker />

        {/* Live Prices */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-6 h-6 text-green-400" />
            <h2 className="text-2xl font-bold text-white">Live Prices</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {prices.map((price) => (
              <div key={price.item_type} className="p-4 bg-gray-900/50 rounded-lg">
                <p className="text-gray-400 text-sm mb-1">{price.item_type.replace('_', ' ')}</p>
                <p className="text-white font-bold text-lg">${price.current_price.toFixed(2)}</p>
                <div className="flex items-center gap-1 mt-1">
                  {price.change_percent >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                  <span
                    className={`text-sm ${
                      price.change_percent >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {price.change_percent >= 0 ? '+' : ''}
                    {price.change_percent.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Inventory Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-6 h-6 text-purple-400" />
                <h2 className="text-xl font-bold text-white">Your Inventory</h2>
              </div>
              {inventory.length === 0 ? (
                <p className="text-gray-400 text-sm">No items in inventory</p>
              ) : (
                <div className="space-y-3">
                  {inventory.map((item) => (
                    <div
                      key={`${item.item_type}-${item.item_name}`}
                      className="p-3 bg-gray-900/50 rounded-lg cursor-pointer hover:bg-gray-900 transition-colors"
                      onClick={() => {
                        setSelectedItem(item)
                        setShowCreateModal(true)
                      }}
                    >
                      <p className="text-white font-semibold">{item.item_name}</p>
                      <p className="text-gray-400 text-sm">{item.item_type}</p>
                      <p className="text-purple-400 text-sm mt-1">Qty: {item.quantity}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Market Listings */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Active Listings</h2>
              {listings.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No active listings</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {listings.map((listing) => (
                    <div
                      key={listing.id}
                      className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg hover:border-purple-500 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-white">{listing.item_name}</h3>
                          <p className="text-gray-400 text-sm">{listing.item_type}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-yellow-400 font-bold text-xl">${listing.price}</p>
                          <p className="text-gray-400 text-sm">per unit</p>
                        </div>
                      </div>
                      {listing.description && (
                        <p className="text-gray-300 text-sm mb-3 line-clamp-2">{listing.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <p className="text-gray-400 text-sm">Quantity: {listing.quantity}</p>
                        <button
                          onClick={() => handleBuy(listing.id, 1)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                        >
                          Buy
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Create Listing Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Create Listing</h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setSelectedItem(null)
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleCreateListing} className="space-y-4">
                {selectedItem ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Item</label>
                      <input
                        type="text"
                        value={`${selectedItem.item_name} (${selectedItem.item_type})`}
                        disabled
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-400"
                      />
                      <input type="hidden" name="item_type" value={selectedItem.item_type} />
                      <input type="hidden" name="item_name" value={selectedItem.item_name} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Quantity (Max: {selectedItem.quantity})
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        required
                        min={1}
                        max={selectedItem.quantity}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Item Type</label>
                      <input
                        type="text"
                        name="item_type"
                        required
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Item Name</label>
                      <input
                        type="text"
                        name="item_name"
                        required
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Quantity</label>
                      <input
                        type="number"
                        name="quantity"
                        required
                        min={1}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Price per Unit</label>
                  <input
                    type="number"
                    name="price"
                    required
                    min={0.01}
                    step={0.01}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description (Optional)</label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white resize-none"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    Create Listing
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false)
                      setSelectedItem(null)
                    }}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Quant Tools Modal */}
      {showQuantTools && <QuantTools prices={prices} onClose={() => setShowQuantTools(false)} />}
    </div>
  )
}

