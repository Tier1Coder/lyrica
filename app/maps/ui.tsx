"use client"
import LocationMap from '@/components/ui/Map'

interface MapClientProps {
  address?: string;
  latitude?: number;
  longitude?: number;
}

export default function MapClient({ address, latitude, longitude }: Readonly<MapClientProps>) {
  return <LocationMap address={address} latitude={latitude} longitude={longitude} />
}
