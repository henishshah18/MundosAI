'use client'

import { useSelector } from 'react-redux'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { RootState } from '@/lib/store'
import { UserMenu } from './user-menu'
import { MobileSidebar } from './mobile-sidebar'
import { Activity } from 'lucide-react'

export function Navbar() {
const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)
const user = useSelector((state: RootState) => state.auth.user)

return (
  <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50 shadow-sm">
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center h-16">
        <div className="flex items-center space-x-3">
          {isAuthenticated && <MobileSidebar />}
          <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-xl p-2 shadow-sm">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">MedCampaign</span>
              <div className="text-xs text-gray-500 -mt-1">Healthcare Management</div>
            </div>
          </Link>
        </div>

        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <>
              {/* Removed NotificationBell */}
              <div className="h-6 w-px bg-gray-300" />
              <UserMenu user={user} />
            </>
          ) : (
            <div className="flex items-center space-x-3">
              <Link href="/signin">
                <Button variant="ghost" className="font-medium">Sign In</Button>
              </Link>
              <Link href="/signin">
                <Button className="font-medium shadow-sm">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  </nav>
)
}
