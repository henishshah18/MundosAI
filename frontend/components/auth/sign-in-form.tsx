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

// Mock user database
const mockUsers = [
  {
    email: 'admin@example.com',
    password: 'password',
    name: 'Dr. Admin',
    role: 'admin',
    clinicName: 'Main Medical Center'
  },
  {
    email: 'doctor@example.com',
    password: 'password',
    name: 'Dr. Smith',
    role: 'doctor',
    clinicName: 'Family Practice'
  },
  {
    email: 'nurse@example.com',
    password: 'password',
    name: 'Nurse Johnson',
    role: 'nurse',
    clinicName: 'Community Health'
  }
]

export function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const router = useRouter()
  const dispatch = useDispatch()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call delay
    setTimeout(() => {
      // Check against mock users
      const user = mockUsers.find(u => u.email === email && u.password === password)
      
      if (user) {
        dispatch(login({ 
          email: user.email, 
          name: user.name,
          role: user.role,
          clinicName: user.clinicName
        }))
        toast.success('Welcome back!', {
          description: 'You have successfully signed in.',
        })
        router.push('/dashboard')
      } else {
        toast.error('Invalid credentials', {
          description: 'Please check your email and password.',
        })
      }
      
      setIsLoading(false)
    }, 800)
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
          
          {/* Demo credentials helper */}
          <div className="bg-blue-50 p-4 rounded-lg text-sm border border-blue-200">
            <p className="font-medium text-blue-800 mb-2">Demo Credentials:</p>
            <div className="text-blue-700 space-y-1">
              <p>• admin@example.com / password</p>
              <p>• doctor@example.com / password</p>
              <p>• nurse@example.com / password</p>
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
