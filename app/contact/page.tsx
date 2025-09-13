import { notFound, redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import features from '@/config/features'
import ContactClient from './ui'

export default async function ContactPage() {
  if (!features.useContact) return notFound()

  const supabase = createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login?redirect=/contact')
  }

  return (
    <div className="max-w-lg">
      <h1 className="mb-4">Contact Us</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Send us a message and we'll get back to you soon.
      </p>
      <ContactClient userEmail={session.user.email} />
    </div>
  )
}
