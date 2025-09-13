import { notFound } from 'next/navigation'
import features from '@/config/features'
import { createServerClient } from '@/lib/supabase/server'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'

export default async function BlogDetailPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params
  if (!features.useBlog) return notFound()
  const supabase = await createServerClient()
  const { data: post, error } = await supabase.from('posts').select('*').eq('id', id).single()
  if (error) {
    console.error('blog detail error', error)
    return notFound()
  }
  return (
    <article className="prose dark:prose-invert max-w-2xl">
      <h1>{post.title}</h1>
      {!post.published_at && (
        <p className="text-xs text-yellow-600">Draft</p>
      )}
      <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{post.content}</ReactMarkdown>
    </article>
  )
}
