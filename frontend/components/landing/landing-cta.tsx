'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function LandingCTA() {
  return (
    <div className="py-20 bg-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Ready to Transform Your Practice?
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Start your free trial today and see how AI-powered campaigns can 
          revolutionize your patient engagement.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signin">
            <Button size="lg" className="text-lg px-8 py-3">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Button variant="secondary" size="lg" className="text-lg px-8 py-3">
            Schedule Demo
          </Button>
        </div>
        
        <p className="text-sm text-gray-500 mt-6">
          No credit card required • 14-day free trial • Cancel anytime
        </p>
      </div>
    </div>
  )
}
