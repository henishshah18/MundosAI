'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BarChart3, Calendar, Users } from 'lucide-react'

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
    description: 'Overview & Analytics'
  },
  {
    title: 'Scheduling',
    href: '/scheduling',
    icon: Calendar,
    badge: '12',
    description: 'Manage Appointments'
  },
  {
    title: 'Handoffs',
    href: '/handoffs',
    icon: Users,
    badge: '7',
    description: 'Human Interventions'
  }
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="pb-12 w-64 bg-white border-r border-gray-200 shadow-sm">
      <div className="space-y-4 py-6">
        <div className="px-4 py-2">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Navigation</h2>
          <div className="space-y-2">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start h-auto p-3 text-left hover:bg-gray-50 transition-all duration-200",
                      isActive && "bg-primary/10 text-primary hover:bg-primary/15 border-r-2 border-primary"
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-3">
                        <item.icon className={cn(
                          "h-5 w-5",
                          isActive ? "text-primary" : "text-gray-500"
                        )} />
                        <div>
                          <div className={cn(
                            "font-medium",
                            isActive ? "text-primary" : "text-gray-700"
                          )}>
                            {item.title}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {item.description}
                          </div>
                        </div>
                      </div>
                      {item.badge && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                  </Button>
                </Link>
              )
            })}
          </div>
        </div>
        
        <div className="px-4">
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20">
            <h3 className="font-semibold text-primary mb-2">Quick Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Today's Appointments</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pending Handoffs</span>
                <span className="font-medium">7</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active Campaigns</span>
                <span className="font-medium">42</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
