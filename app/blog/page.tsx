import { notFound } from 'next/navigation'
import features from '@/config/features'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'

export default async function BlogListPage() {
  if (!features.useBlog) return notFound()
  const supabase = await createServerClient()
  const { data: posts, error } = await supabase.from('posts').select('id,title,published_at,inserted_at').order('inserted_at', { ascending: false })
  if (error) console.error('blog list error', error)
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1>Blog</h1>
        <Link href="/blog/new" className="text-sm underline text-primary">New Post</Link>
      </div>
      <ul className="space-y-3">
        {(posts || []).map((p) => (
          <li key={p.id} className="rounded-md border border-gray-200 dark:border-gray-800 p-3">
            <Link href={`/blog/${p.id}`} className="font-medium text-primary underline">{p.title}</Link>
            <div className="text-xs text-gray-500">{p.published_at ? 'Published' : 'Draft'} • {new Date(p.inserted_at).toLocaleString()}</div>
          </li>
        ))}
      </ul>
      {(!posts || posts.length === 0) && <p className="text-sm text-gray-500">No posts yet.</p>}
    </div>
  )
}
