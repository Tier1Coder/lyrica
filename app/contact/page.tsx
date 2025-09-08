import { notFound } from 'next/navigation'
import features from '@/config/features'
import ContactClient from './ui'

export default function ContactPage() {
  if (!features.useContact) return notFound()
  return (
    <div className="max-w-lg">
      <h1 className="mb-4">Contact</h1>
      <ContactClient />
    </div>
  )
}
