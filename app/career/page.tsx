'use client'

// Career mode is now the main page (/)
// This is a redirect/alias
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CareerPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace('/')
  }, [router])

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-blue mx-auto mb-4"></div>
        <p className="text-gray-400">Redirecting to Career Mode...</p>
      </div>
    </div>
  )
}

