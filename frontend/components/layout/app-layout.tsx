'use client'

import { useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import { Navbar } from './navbar'
import { Sidebar } from './sidebar'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar />
      {isAuthenticated ? (
        <div className="flex pt-16">
          <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:pt-16">
            <Sidebar />
          </div>
          <div className="md:pl-64 flex flex-col flex-1">
            <main className="flex-1 p-6">
              {children}
            </main>
          </div>
        </div>
      ) : (
        <main className="pt-16">
          {children}
        </main>
      )}
    </div>
  )
}
