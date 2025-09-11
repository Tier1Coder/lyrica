"use client"
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function LoginPage() {
  const router = useRouter()
  const q = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Handle URL parameters for messages/errors
    const errorParam = q.get('error')
    const messageParam = q.get('message')

    if (errorParam === 'auth_callback_error') {
      setError('Authentication failed. Please try logging in again.')
    } else if (messageParam === 'check_email') {
      setMessage('Please check your email and click the confirmation link.')
    } else if (messageParam === 'password_updated') {
      setMessage('Password updated successfully! You can now log in with your new password.')
    }
  }, [q])

  const getErrorMessage = (error: any) => {
    if (error.message?.includes('Invalid login credentials')) {
      return 'Invalid email or password. Please check your credentials and try again.'
    }
    if (error.message?.includes('Email not confirmed')) {
      return 'Please check your email and click the confirmation link before logging in.'
    }
    if (error.message?.includes('422')) {
      return 'Invalid login data. Please check your email and password.'
    }
    return error.message || 'Login failed. Please try again.'
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (!email.trim() || !password) {
      setError('Please enter both email and password.')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      })

      if (error) {
        setError(getErrorMessage(error))
        return
      }

      const redirectTo = q.get('redirect') || '/dashboard'
      router.replace(redirectTo)
      router.refresh()
    } catch (err) {
      console.error('Login error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="mb-4">Login</h1>

      {message && (
        <div className="mb-4 p-3 rounded-md bg-primary/10 border border-primary/20">
          <p className="text-sm text-primary">{message}</p>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />
        </div>

        {error && (
          <div className="p-3 rounded-md bg-danger/10 border border-danger/20">
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <p className="mt-3 text-sm text-center">
        No account?{' '}
        <a className="text-primary hover:underline" href="/signup">
          Sign up
        </a>
      </p>

      <p className="mt-2 text-sm text-center">
        <a className="text-primary hover:underline" href="/forgot-password">
          Forgot your password?
        </a>
      </p>
    </div>
  )
}
