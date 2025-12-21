'use client'

import { X, HelpCircle } from 'lucide-react'
import { ReactNode, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface GameInstructionsProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  icon?: ReactNode
}

export default function GameInstructions({
  isOpen,
  onClose,
  title,
  children,
  icon,
}: GameInstructionsProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!isOpen || !mounted) return null

  const modalContent = (
    <>
      {/* Backdrop - prevents interaction with background */}
      <div 
        className="fixed inset-0 bg-black/95 backdrop-blur-md" 
        onClick={onClose}
        style={{ 
          position: 'fixed',
          zIndex: 99998,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}
      />
      {/* Modal Content */}
      <div 
        className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none"
        style={{ 
          position: 'fixed',
          zIndex: 99999,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}
      >
        <div 
          className="relative bg-slate-800 border-2 border-neon-blue rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(0,255,255,0.3)] pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {icon || <HelpCircle size={32} className="text-neon-blue" />}
              <h2 className="text-2xl font-bold text-white">{title}</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-slate-700 rounded-lg z-10 relative"
            >
              <X size={24} />
            </button>
          </div>
          <div className="text-gray-300 space-y-4 leading-relaxed">{children}</div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-neon-blue text-black font-bold rounded-lg hover:bg-cyan-400 transition-all"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </>
  )

  // Use portal to render directly to body, bypassing any parent z-index contexts
  return createPortal(modalContent, document.body)
}

