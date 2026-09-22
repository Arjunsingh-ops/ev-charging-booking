"use client"

import { useState, useCallback } from "react"
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const containerStyle = {
  width: "100%",
  height: "100%",
  minHeight: "500px",
  borderRadius: "0.5rem",
}

// Center of India roughly
const center = {
  lat: 20.5937,
  lng: 78.9629,
}

export interface MapStation {
  id: string
  name: string
  city?: string
  state?: string
  latitude?: number
  longitude?: number
  lat?: number
  lng?: number
  minPrice?: number
  price_per_hour?: number
  totalPower?: number
  power_output?: number
  connectorTypes?: string[]
}

export function DiscoveryMap({ stations }: { stations: MapStation[] }) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  })

  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [selectedStation, setSelectedStation] = useState<MapStation | null>(null)

  const onLoad = useCallback(function callback(mapInstance: google.maps.Map) {
    setMap(mapInstance)
  }, [])

  const onUnmount = useCallback(function callback() {
    setMap(null)
  }, [])

  if (!isLoaded) {
    return (
      <div className="h-full min-h-[500px] w-full bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
        Loading Map View...
      </div>
    )
  }

  return (
    <div className="h-full min-h-[500px] w-full rounded-lg overflow-hidden border">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={5}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          styles: [
            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
          ],
          disableDefaultUI: true,
          zoomControl: true,
        }}
      >
        {stations.map((station) => {
          const lat = station.latitude || station.lat || center.lat
          const lng = station.longitude || station.lng || center.lng
          return (
            <Marker
              key={station.id}
              position={{ lat, lng }}
              onClick={() => setSelectedStation(station)}
              icon={{
                path: typeof window !== "undefined" && window.google?.maps?.SymbolPath ? window.google.maps.SymbolPath.CIRCLE : 0,
                fillColor: "#10b981", // Emerald Green
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 2,
                scale: 9,
              }}
            />
          )
        })}

        {selectedStation && (
          <InfoWindow
            position={{
              lat: selectedStation.latitude || selectedStation.lat || center.lat,
              lng: selectedStation.longitude || selectedStation.lng || center.lng,
            }}
            onCloseClick={() => setSelectedStation(null)}
          >
            <div className="p-2 max-w-[260px] text-zinc-900">
              <h3 className="font-bold text-base mb-1">{selectedStation.name}</h3>
              <p className="text-xs text-zinc-600 mb-3">
                {selectedStation.city}, {selectedStation.state}
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                <div>
                  <span className="text-zinc-500 block">Max Speed</span>
                  <span className="font-semibold text-zinc-800">
                    {selectedStation.totalPower || selectedStation.power_output || 60} kW
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Tariff</span>
                  <span className="font-semibold text-zinc-800">
                    {formatCurrency(selectedStation.minPrice || selectedStation.price_per_hour || 18)}/kWh
                  </span>
                </div>
              </div>

              <Button size="sm" className="w-full text-xs h-8" asChild>
                <Link href={`/user/stations/${selectedStation.id}`}>
                  View Details & Book
                </Link>
              </Button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  )
}
