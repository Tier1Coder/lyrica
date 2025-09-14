"use client"
import { notFound } from 'next/navigation'
import { useState } from 'react'
import features from '@/config/features'
import MapClient from './ui'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function MapsPage() {
  const [address, setAddress] = useState('New York City')

  if (!features.useMaps) return notFound()

  return (
    <div className="space-y-4">
      <h1>Map</h1>
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Enter address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="flex-1"
        />
        <Button onClick={() => {}}>Search</Button>
      </div>
      <MapClient address={address} />
    </div>
  )
}
