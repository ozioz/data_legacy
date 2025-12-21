import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import Navigation from '@/components/ui/Navigation'

export const metadata: Metadata = {
  title: 'Data Legacy 2.0',
  description: 'A Data Career Simulation Game with AI-Powered Scenarios',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-900 text-white font-sans selection:bg-neon-green selection:text-black">
        <Providers>
          <Navigation />
          <div className="pt-16">{children}</div>
        </Providers>
      </body>
    </html>
  )
}

