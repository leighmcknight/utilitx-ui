"use client"

import { useEffect, useRef, useState } from "react"
import { loadGoogleMapsApi } from "@/lib/load-google-maps"

interface BoundingBoxMapProps {
  boundingBox: {
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

export function BoundingBoxMap({ boundingBox, markers = [] }: BoundingBoxMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any | null>(null)
  const rectangleRef = useRef<any | null>(null)
  const [mapMarkers, setMapMarkers] = useState<any[]>([])

  useEffect(() => {
    let isMounted = true

    const initMap = async () => {
      try {
        // Load Google Maps API using our centralized loader
        await loadGoogleMapsApi()

        if (!isMounted || !mapRef.current || typeof window === "undefined" || !window.google) return

        const google = window.google

        // Create bounds from the bounding box
        const bounds = new google.maps.LatLngBounds(
          { lat: boundingBox.south, lng: boundingBox.west },
          { lat: boundingBox.north, lng: boundingBox.east },
        )

        // Create the map
        const newMap = new google.maps.Map(mapRef.current, {
          center: bounds.getCenter(),
          zoom: 10,
          mapTypeId: "hybrid",
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
        })

        // Fit the map to the bounds
        newMap.fitBounds(bounds)

        // Add a rectangle to show the bounding box
        if (rectangleRef.current) {
          rectangleRef.current.setMap(null)
        }

        rectangleRef.current = new google.maps.Rectangle({
          map: newMap,
          bounds: bounds,
          editable: false,
          strokeColor: "#0c4160",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#0c4160",
          fillOpacity: 0.1,
        })

        setMap(newMap)
      } catch (error) {
        console.error("Error initializing map:", error)
      }
    }

    initMap()

    return () => {
      isMounted = false
      if (rectangleRef.current && typeof window !== "undefined" && window.google) {
        rectangleRef.current.setMap(null)
      }
      // Clean up markers
      mapMarkers.forEach((marker) => {
        if (marker && typeof marker.setMap === "function") {
          marker.setMap(null)
        }
      })
    }
  }, [boundingBox])

  // Update rectangle when bounding box changes
  useEffect(() => {
    if (map && boundingBox && rectangleRef.current && typeof window !== "undefined" && window.google) {
      const google = window.google

      // Create bounds from the bounding box
      const bounds = new google.maps.LatLngBounds(
        { lat: boundingBox.south, lng: boundingBox.west },
        { lat: boundingBox.north, lng: boundingBox.east },
      )

      // Update rectangle bounds
      rectangleRef.current.setBounds(bounds)

      // Fit the map to the bounds
      map.fitBounds(bounds)
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

  return <div ref={mapRef} className="h-full w-full" />
}

// Default export for dynamic import
export default BoundingBoxMap
