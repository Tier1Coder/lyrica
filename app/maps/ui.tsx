"use client"
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useState } from 'react'
import { LatLngExpression } from 'leaflet'

export default function MapClient() {
  const center: LatLngExpression = [51.505, -0.09]
  const [position] = useState(center)

  return (
    <div className="h-[400px] w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
      <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>Example marker.</Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
