'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Activity, Users, Calendar } from 'lucide-react'
import Link from 'next/link'

export function LandingHero() {
  return (
    <div className="relative bg-gradient-to-br from-teal-50 to-white">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Streamline Your
            <span className="text-primary"> Medical Campaigns</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Automate patient recovery and recall campaigns with AI-powered conversations, 
            intelligent handoffs, and comprehensive appointment management.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/signin">
              <Button size="lg" className="text-lg px-8 py-3">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="secondary" size="lg" className="text-lg px-8 py-3">
              Watch Demo
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm">
              <Activity className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">AI-Powered Campaigns</h3>
              <p className="text-gray-600 text-center">
                Automated recovery and recall campaigns with intelligent conversation handling
              </p>
            </div>
            <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm">
              <Users className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Smart Handoffs</h3>
              <p className="text-gray-600 text-center">
                Seamless transition to human agents when AI reaches its limits
              </p>
            </div>
            <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm">
              <Calendar className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Appointment Management</h3>
              <p className="text-gray-600 text-center">
                Complete scheduling system with automated reminders and follow-ups
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
