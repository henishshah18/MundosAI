import { Card, CardContent } from '@/components/ui/card'
import { BarChart3, MessageSquare, Clock, Shield, Zap, Users } from 'lucide-react'

const features = [
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Track campaign performance with detailed metrics and visual dashboards'
  },
  {
    icon: MessageSquare,
    title: 'AI Conversations',
    description: 'Natural language processing for patient interactions and follow-ups'
  },
  {
    icon: Clock,
    title: 'Automated Scheduling',
    description: 'Smart appointment booking with conflict detection and optimization'
  },
  {
    icon: Shield,
    title: 'HIPAA Compliant',
    description: 'Enterprise-grade security ensuring patient data protection'
  },
  {
    icon: Zap,
    title: 'Real-time Updates',
    description: 'Instant notifications and live campaign status monitoring'
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Multi-user support with role-based access and permissions'
  }
]

export function LandingFeatures() {
  return (
    <div className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive tools designed specifically for healthcare practices to improve 
            patient engagement and operational efficiency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <feature.icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
