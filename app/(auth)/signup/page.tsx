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
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) {
      setError('Signup failed')
      return
    }
    router.replace('/dashboard')
    router.refresh()
  }

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="mb-4">Sign Up</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label htmlFor="email">Email</label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" disabled={loading}>{loading ? 'Loading...' : 'Create Account'}</Button>
      </form>
      <p className="mt-3 text-sm">Have an account? <a className="text-primary underline" href="/login">Login</a></p>
    </div>
  )
}
