'use client'

import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { RootState } from '@/lib/store'
import { LandingHero } from './landing-hero'
import { LandingFeatures } from './landing-features'
import { LandingStats } from './landing-stats'
import { LandingCTA } from './landing-cta'

export function LandingPage() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <LandingHero />
      <LandingFeatures />
      <LandingStats />
      <LandingCTA />
    </div>
  )
}
