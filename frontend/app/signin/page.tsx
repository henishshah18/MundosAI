import { SignInForm } from '@/components/auth/sign-in-form' // Corrected import path

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <SignInForm />
      </div>
    </div>
  )
}
