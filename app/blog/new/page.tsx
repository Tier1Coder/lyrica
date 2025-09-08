"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function NewPostPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [publish, setPublish] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, publish }),
    })
    setLoading(false)
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      setError(j?.error || 'Failed to create post')
      return
    }
    const { id } = await res.json()
    router.replace(`/blog/${id}`)
    router.refresh()
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-4">New Post</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label htmlFor="title">Title</label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="content">Content (Markdown)</label>
          <textarea id="content" className="w-full h-48 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm" value={content} onChange={(e) => setContent(e.target.value)} required />
        </div>
        <div className="flex items-center gap-2">
          <input id="publish" type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} />
          <label htmlFor="publish">Publish now</label>
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
      </form>
    </div>
  )
}
