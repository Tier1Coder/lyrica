"use client"
import { useState, useEffect } from 'react'

interface LocationMapProps {
  address?: string;
  latitude?: number;
  longitude?: number;
  height?: string;
  width?: string;
  className?: string;
}

export default function LocationMap({ 
  address, 
  latitude, 
  longitude, 
  height = '400px', 
  width = '100%', 
  className = '' 
}: Readonly<LocationMapProps>) {
  const [mapUrl, setMapUrl] = useState<string>('')

  useEffect(() => {
    if (latitude && longitude) {
      setMapUrl(`https://maps.google.com/maps?q=${latitude},${longitude}&output=embed`)
    } else if (address) {
      setMapUrl(`https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed`)
    } else {
      setMapUrl('https://maps.google.com/maps?q=New+York+City&output=embed')
    }
  }, [address, latitude, longitude])

  return (
    <div 
      className={`overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 ${className}`}
      style={{ height, width }}
    >
      <iframe
        src={mapUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Map"
      />
    </div>
  )
}
