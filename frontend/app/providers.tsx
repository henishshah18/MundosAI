'use client'

import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { store } from '@/lib/store'
import { useState } from 'react'
import { Toaster } from 'sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        {children}
        {/* Explicitly setting position and closeButton, and attempting to justify content to the end */}
        <Toaster 
          richColors 
          position="top-right" 
          closeButton 
          // This class targets the direct children (individual toasts) and tries to justify their content to the end.
          // This is an attempt to override potential default alignment issues for the close button.
          className="[&>div]:justify-end" 
        />
      </QueryClientProvider>
    </Provider>
  )
}
