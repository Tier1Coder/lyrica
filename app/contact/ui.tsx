"use client"
import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function ContactClient() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus(null)
    setLoading(true)
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message })
    })
    setLoading(false)
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      setStatus(j?.error || 'Submission failed')
      return
    }
    setName(''); setEmail(''); setMessage('')
    setStatus('Message submitted!')
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label htmlFor="name">Name</label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <label htmlFor="email">Email</label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <label htmlFor="msg">Message</label>
        <textarea id="msg" className="w-full h-40 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm" value={message} onChange={(e) => setMessage(e.target.value)} required />
      </div>
      {status && (
        <p className={`text-sm ${status === 'Message submitted!' ? 'text-green-600' : 'text-danger'}`}>{status}</p>
      )}
      <Button type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send'}</Button>
    </form>
  )
}
