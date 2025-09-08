import { notFound } from 'next/navigation'
import features from '@/config/features'
import dynamic from 'next/dynamic'

const MapClient = dynamic(() => import('./ui'), { ssr: false })

export default function MapsPage() {
  if (!features.useMaps) return notFound()
  return (
    <div className="space-y-4">
      <h1>Map</h1>
      <MapClient />
    </div>
  )
}
