'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { login } from '@/lib/slices/authSlice'
import { toast } from 'sonner'
import api from '@/lib/api'

// Backend-authenticated sign-in

export function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const router = useRouter()
  const dispatch = useDispatch()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const body = new URLSearchParams()
      body.append('username', email)
      body.append('password', password)
      const { data } = await api.post('/api/v1/auth/login', body, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      const token: string | undefined = data?.access_token
      if (!token) {
        throw new Error('No token received')
      }
      localStorage.setItem('authToken', token)
      // Fetch user profile
      const me = await api.get('/api/v1/users/me')
      const user = me.data
      dispatch(
        login({
          email: user.email,
          name: user.name,
          role: user.role,
          clinicName: user.clinicName ?? 'Clinic',
        })
      )
      toast.success('Welcome back!', { description: 'You have successfully signed in.' })
      router.push('/dashboard')
    } catch (err: any) {
      toast.error('Invalid credentials', { description: 'Please check your email and password.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
        <CardDescription>
          Enter your credentials to access your account.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end">
            <Button variant="link" type="button" className="px-0">
              Forgot password?
            </Button>
          </div>
          
          {/* Demo credentials helper (optional) */}
          <div className="bg-blue-50 p-4 rounded-lg text-sm border border-blue-200">
            <p className="font-medium text-blue-800 mb-2">Demo Credentials:</p>
            <div className="text-blue-700 space-y-1">
              <p>• admin@example.com / password</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
