"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { loadGoogleMapsApi } from "@/lib/load-google-maps"
import { DynamicBoundingBoxMap } from "./dynamic-map-components"
import { ClientOnly } from "./client-only"

interface GeographicRegionProps {
  onRegionSelected: (region: string, boundingBox: any) => void
  markers?: Array<{
    id: string
    lat: number
    lng: number
    title: string
  }>
}

export function GeographicRegion({ onRegionSelected, markers = [] }: GeographicRegionProps) {
  const [regionName, setRegionName] = useState("")
  const [boundingBox, setBoundingBox] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleGetBoundingBox = async () => {
    if (!regionName) return

    setLoading(true)
    setError("")

    try {
      // Load Google Maps API using our centralized loader
      await loadGoogleMapsApi()

      if (typeof window === "undefined" || !window.google) {
        setError("Google Maps API not available")
        setLoading(false)
        return
      }

      // Use Google Maps Geocoding API
      const geocoder = new window.google.maps.Geocoder()

      geocoder.geocode({ address: regionName }, (results, status) => {
        if (status === "OK" && results && results.length > 0) {
          const result = results[0]
          const viewport = result.geometry.viewport

          // Extract bounding box from viewport
          const newBoundingBox = {
            north: viewport.getNorthEast().lat(),
            east: viewport.getNorthEast().lng(),
            south: viewport.getSouthWest().lat(),
            west: viewport.getSouthWest().lng(),
          }

          setBoundingBox(newBoundingBox)
          onRegionSelected(regionName, newBoundingBox)
          setLoading(false)

          console.log("regionName (in geographic): ", regionName);
          console.log("boundingBox (in geographic): ", boundingBox);
        } else {
          setError(`Could not find region: ${status}`)
          setLoading(false)
        }
      })
    } catch (err) {
      setError("Error loading Google Maps API")
      setLoading(false)
      console.error(err)
    }

  }

  // For demo purposes, let's add a function to use a predefined region
  const usePredefinedRegion = () => {
    const predefinedRegion = "Durham Region, ON"
    const predefinedBoundingBox = {
      north: 44.5167599,
      east: -78.324079,
      south: 43.520641,
      west: -79.327997,
    }

    setRegionName(predefinedRegion)
    setBoundingBox(predefinedBoundingBox)
    onRegionSelected(predefinedRegion, predefinedBoundingBox)
  }

  return (
    <div className="mb-8">
      <div className="flex items-center mb-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-200 text-white mr-2">
          <span className="text-sm font-bold">1</span>
        </div>
        <h2 className="text-xl font-semibold">Define Geographic Region</h2>
      </div>

      <p className="text-gray-600 mb-4">
        Enter a region name (e.g., "Durham Region, ON") to get its bounding box coordinates
      </p>

      <div className="mb-4">
        <label htmlFor="region-name" className="block text-sm font-medium text-gray-700 mb-1">
          Region Name
        </label>
        <div className="flex gap-4">
          <Input
            id="region-name"
            value={regionName}
            onChange={(e) => setRegionName(e.target.value)}
            placeholder="e.g., Durham Region, ON"
            className="flex-1"
          />
          <Button
            style={{ backgroundColor: "#3b82f6", color: "white" }}
            onClick={handleGetBoundingBox}
            disabled={!regionName || loading}
            className="bg-primary-200 hover:bg-primary-300"
          >
            {loading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Loading...
              </span>
            ) : (
              <>
                <MapPin className="mr-2 h-4 w-4" />
                Get Bounding Box
              </>
            )}
          </Button>
        </div>
        <div className="mt-2">
          <Button variant="outline" onClick={usePredefinedRegion} className="text-sm">
            Use Demo Region (Durham Region, ON)
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {boundingBox && (
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="text-sm text-gray-500 mb-2">
              <span className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                Bounding box for {regionName}
              </span>
            </div>
            <div className="h-[400px] border border-gray-300 rounded-md overflow-hidden">
              <ClientOnly fallback={<div className="flex items-center justify-center h-full">Loading map...</div>}>
                <DynamicBoundingBoxMap boundingBox={boundingBox} markers={markers} />
              </ClientOnly>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
