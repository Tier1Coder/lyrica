"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient()

  const validateForm = () => {
    if (!email.trim()) {
      setError('Email is required')
      return false
    }
    if (!password) {
      setError('Password is required')
      return false
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return false
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    return true
  }

  const getErrorMessage = (error: any) => {
    if (error.message?.includes('already registered')) {
      return 'An account with this email already exists. Try logging in instead.'
    }
    if (error.message?.includes('Invalid email')) {
      return 'Please enter a valid email address.'
    }
    if (error.message?.includes('Password')) {
      return 'Password must be at least 6 characters long.'
    }
    if (error.message?.includes('422')) {
      return 'Invalid signup data. Please check your email and password.'
    }
    return error.message || 'Signup failed. Please try again.'
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        setError(getErrorMessage(error))
        return
      }

      // Check if user needs email confirmation
      if (data.user && !data.session) {
        setError('Please check your email and click the confirmation link to complete your signup.')
        return
      }

      router.replace('/dashboard')
      router.refresh()
    } catch (err: any) {
      console.error('Signup error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="mb-4">Sign Up</h1>
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
            minLength={6}
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">Confirm Password</label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Confirm your password"
            minLength={6}
          />
        </div>
        {error && (
          <div className="p-3 rounded-md bg-danger/10 border border-danger/20">
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>
      <p className="mt-3 text-sm text-center">
        Have an account?{' '}
        <a className="text-primary hover:underline" href="/login">
          Login
        </a>
      </p>
    </div>
  )
}
