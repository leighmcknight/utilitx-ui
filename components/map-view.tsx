"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { loadGoogleMapsApi } from "@/lib/load-google-maps"

interface MapViewProps {
  boundingBox?: {
    north: number
    south: number
    east: number
    west: number
  }
  markers?: Array<{
    id: string
    lat: number
    lng: number
    title: string
  }>
}

export function MapView({ boundingBox, markers = [] }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any | null>(null)
  const [mapMarkers, setMapMarkers] = useState<any[]>([])

  useEffect(() => {
    let isMounted = true

    const initMap = async () => {
      try {
        // Load Google Maps API using our centralized loader
        await loadGoogleMapsApi()

        if (!isMounted || !mapRef.current || typeof window === "undefined" || !window.google) return

        const google = window.google

        // Default center (Durham Region, ON)
        const initialCenter = { lat: 43.9, lng: -79.0 }

        // Create the map
        const newMap = new google.maps.Map(mapRef.current, {
          center: initialCenter,
          zoom: 10,
          mapTypeId: "hybrid",
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
        })

        setMap(newMap)
      } catch (error) {
        console.error("Error initializing map:", error)
      }
    }

    initMap()

    return () => {
      isMounted = false
      // Clean up markers
      mapMarkers.forEach((marker) => {
        if (marker && typeof marker.setMap === "function") {
          marker.setMap(null)
        }
      })
    }
  }, [])

  // Update map when bounding box changes
  useEffect(() => {
    if (map && boundingBox && typeof window !== "undefined" && window.google) {
      const google = window.google

      // Create bounds from the bounding box
      const bounds = new google.maps.LatLngBounds(
        { lat: boundingBox.south, lng: boundingBox.west },
        { lat: boundingBox.north, lng: boundingBox.east },
      )

      // Fit the map to the bounds
      map.fitBounds(bounds)

      // Add a rectangle to show the bounding box
      new google.maps.Rectangle({
        map,
        bounds,
        editable: false,
        strokeColor: "#0c4160",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#0c4160",
        fillOpacity: 0.1,
      })
    }
  }, [map, boundingBox])

  // Update markers when they change
  useEffect(() => {
    if (map && markers.length > 0 && typeof window !== "undefined" && window.google) {
      const google = window.google

      // Clear existing markers
      mapMarkers.forEach((marker) => {
        if (marker && typeof marker.setMap === "function") {
          marker.setMap(null)
        }
      })

      // Add new markers
      const newMarkers = markers.map((markerData) => {
        // Create custom marker icon
        const markerIcon = {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: "#0c4160",
          fillOpacity: 0.9,
          strokeWeight: 2,
          strokeColor: "white",
          scale: 10,
        }

        // Create marker
        const marker = new google.maps.Marker({
          position: { lat: markerData.lat, lng: markerData.lng },
          map,
          title: markerData.title,
          icon: markerIcon,
        })

        // Add click listener to show info window
        const infoWindow = new google.maps.InfoWindow({
          content: `<div style="padding: 8px;"><strong>${markerData.title}</strong></div>`,
        })

        marker.addListener("click", () => {
          infoWindow.open(map, marker)
        })

        return marker
      })

      setMapMarkers(newMarkers)
    }
  }, [map, markers])

  return (
    <Card className="mt-8">
      <CardContent className="p-0">
        <div ref={mapRef} className="h-[500px] w-full" />
      </CardContent>
    </Card>
  )
}

// Default export for dynamic import
export default MapView
