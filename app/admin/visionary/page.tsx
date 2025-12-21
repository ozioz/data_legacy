'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  scanVisionaryImages,
  autoGenerateVisionaryLevels,
  getAvailableVisionaryImages,
} from '@/app/actions/visionary-actions'
import { Loader2, RefreshCw, CheckCircle, XCircle, Image as ImageIcon, ArrowLeft, Shield } from 'lucide-react'

export default function VisionaryAdminPage() {
  const [images, setImages] = useState<string[]>([])
  const [levels, setLevels] = useState<Array<{ image_path: string; id: string; difficulty: string }>>([])
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; details?: string } | null>(null)
  const [scanResult, setScanResult] = useState<string[]>([])

  useEffect(() => {
    loadData()
    // Also scan images on mount
    scanImages()
  }, [])

  const scanImages = async () => {
    try {
      const result = await scanVisionaryImages()
      if (result.success) {
        setScanResult(result.images)
      }
    } catch (error) {
      console.error('Error scanning images:', error)
    }
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await getAvailableVisionaryImages()
      if (data.success) {
        setImages(data.images)
        setLevels(data.levels)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    setResult(null)
    try {
      console.log('[Admin] Starting sync...')
      const result = await autoGenerateVisionaryLevels()
      console.log('[Admin] Sync result:', result)
      
      if (result.success) {
        const message = result.error
          ? `⚠️ Partially synced! Created: ${result.created}, Updated: ${result.updated}. ${result.error}`
          : `✅ Successfully synced! Created: ${result.created}, Updated: ${result.updated}`
        setResult({
          success: !result.error,
          message,
          details: result.error || undefined,
        })
        await loadData() // Reload to show updated data
      } else {
        setResult({ 
          success: false, 
          message: `❌ Error: ${result.error || 'Unknown error'}`,
          details: 'Check browser console and server logs for details'
        })
      }
    } catch (error: any) {
      console.error('[Admin] Sync error:', error)
      setResult({ 
        success: false, 
        message: `❌ Error: ${error.message || error}`,
        details: error.stack || 'Check browser console for details'
      })
    } finally {
      setSyncing(false)
    }
  }

  const imagesWithoutLevels = images.filter(
    (img) => !levels.some((level) => level.image_path === img)
  )
  const levelsWithoutImages = levels.filter(
    (level) => !images.some((img) => img === level.image_path)
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Shield size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-1">
                    Visionary Game Admin
                  </h1>
                  <p className="text-gray-400">Manage Visionary game levels and sync with image directory</p>
                </div>
              </div>
            </div>
            <Link
              href="/admin"
              className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-purple-500 transition-all flex items-center gap-2 text-gray-300 hover:text-white"
            >
              <ArrowLeft size={18} />
              <span>Back to Admin</span>
            </Link>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-slate-800/90 backdrop-blur-xl border-2 border-slate-700 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Sync Levels</h2>
              <p className="text-sm text-gray-400">
                Automatically create/update levels for all images in /public/assets/visionary/
              </p>
            </div>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {syncing ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw size={20} />
                  Sync Levels
                </>
              )}
            </button>
          </div>

          {result && (
            <div
              className={`p-4 rounded-lg ${
                result.success
                  ? 'bg-green-900/30 border border-green-500/50'
                  : 'bg-red-900/30 border border-red-500/50'
              }`}
            >
              <p className={result.success ? 'text-green-400' : 'text-red-400'}>{result.message}</p>
              {result.details && (
                <p className="text-xs text-gray-400 mt-2 font-mono">{result.details}</p>
              )}
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-800/90 backdrop-blur-xl border-2 border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <ImageIcon className="text-purple-400" size={24} />
              <h3 className="text-lg font-bold text-white">Total Images</h3>
            </div>
            <p className="text-3xl font-bold text-purple-400">{images.length}</p>
            <p className="text-sm text-gray-400 mt-1">Found in directory</p>
            {scanResult.length > 0 && scanResult.length !== images.length && (
              <p className="text-xs text-yellow-400 mt-1">⚠️ Scan found {scanResult.length} images</p>
            )}
          </div>

          <div className="bg-slate-800/90 backdrop-blur-xl border-2 border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="text-green-400" size={24} />
              <h3 className="text-lg font-bold text-white">Active Levels</h3>
            </div>
            <p className="text-3xl font-bold text-green-400">{levels.length}</p>
            <p className="text-sm text-gray-400 mt-1">In database</p>
          </div>

          <div className="bg-slate-800/90 backdrop-blur-xl border-2 border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <XCircle className="text-yellow-400" size={24} />
              <h3 className="text-lg font-bold text-white">Missing Levels</h3>
            </div>
            <p className="text-3xl font-bold text-yellow-400">{imagesWithoutLevels.length}</p>
            <p className="text-sm text-gray-400 mt-1">Need sync</p>
          </div>
        </div>

        {/* Images List */}
        <div className="bg-slate-800/90 backdrop-blur-xl border-2 border-slate-700 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Images & Levels Status</h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-purple-400" size={32} />
            </div>
          ) : (
            <div className="space-y-3">
              {images.map((imagePath) => {
                const level = levels.find((l) => l.image_path === imagePath)
                return (
                  <div
                    key={imagePath}
                    className={`p-4 rounded-lg border-2 ${
                      level
                        ? 'bg-green-900/20 border-green-500/50'
                        : 'bg-yellow-900/20 border-yellow-500/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {level ? (
                          <CheckCircle className="text-green-400" size={20} />
                        ) : (
                          <XCircle className="text-yellow-400" size={20} />
                        )}
                        <span className="text-white font-mono text-sm">{imagePath}</span>
                      </div>
                      {level && (
                        <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/50 rounded-lg text-purple-400 text-xs font-semibold">
                          {level.difficulty}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}

              {images.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <p>No images found in /public/assets/visionary/</p>
                  <p className="text-sm mt-2">Add image files (.jpg, .png, .webp) to that directory</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

