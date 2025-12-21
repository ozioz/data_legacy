'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Users } from 'lucide-react'
import { createGuild } from '@/app/actions/guild-actions'
import Link from 'next/link'

export default function CreateGuildPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (name.length < 3 || name.length > 100) {
      setError('Guild name must be between 3 and 100 characters')
      setLoading(false)
      return
    }

    const result = await createGuild({ name, description })
    setLoading(false)

    if (result.success && result.guild) {
      router.push(`/guilds/${result.guild.id}`)
    } else {
      setError(result.error || 'Failed to create guild')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/guilds"
          className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Guilds
        </Link>

        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl font-bold text-white">Create a Guild</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Guild Name *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={3}
                maxLength={100}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                placeholder="Enter guild name (3-100 characters)"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                maxLength={500}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                placeholder="Describe your guild (optional, max 500 characters)"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">{error}</div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-semibold"
              >
                {loading ? 'Creating...' : 'Create Guild'}
              </button>
              <Link
                href="/guilds"
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-semibold"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

