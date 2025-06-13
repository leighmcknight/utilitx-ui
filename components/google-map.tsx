"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api"
import type { AssetRecord } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { AlertTriangle, MapPin } from "lucide-react"
import { RecordDetailCard } from "./record-detail-card"
import { useMobile } from "@/hooks/use-mobile"

const containerStyle = {
  width: "100%",
  height: "100%",
  minHeight: "500px",
}

// Center on Canada by default
const defaultCenter = {
  lat: 56.1304,
  lng: -106.3468,
}

// Default zoom level for Canada
const defaultZoom = 4

// Use the provided API key
const GOOGLE_MAPS_API_KEY = "AIzaSyBm0xX2JVYtdsVnO78koeR6bIkBpz8hAYQ"

interface GoogleMapComponentProps {
  records: AssetRecord[]
  selectedRecord: string | null
  onSelectRecord: (id: string) => void
  getRecordId: (record: AssetRecord, index: number) => string
  onRecordUpdate?: (updatedRecord: AssetRecord, index: number) => void
}

export default function GoogleMapComponent({
  records,
  selectedRecord,
  onSelectRecord,
  getRecordId,
  onRecordUpdate,
}: GoogleMapComponentProps) {
  const mapRef = useRef<google.maps.Map | null>(null)
  const [selectedRecordData, setSelectedRecordData] = useState<AssetRecord | null>(null)
  const [apiKeyError, setApiKeyError] = useState(false)
  const isMobile = useMobile()

  // Load the Google Maps JavaScript API with the provided API key
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    // You can add libraries here if needed
    // libraries: ['places']
  })

  // Check for API key error
  useEffect(() => {
    if (loadError) {
      console.error("Google Maps API error:", loadError)
      if (loadError.message.includes("ApiProjectMapError") || loadError.message.includes("API key")) {
        setApiKeyError(true)
      }
    }
  }, [loadError])

  // Helper function to get marker color - now always returns red
  const getTrustScoreColor = () => {
    return "red"
  }

  // Filter records with valid georeference data
  const validRecords = records.filter(
    (record) =>
      record.metadata.georeference && typeof record.metadata.georeference.lat === "number" && typeof record.metadata.georeference.lon === "number",
  )

  // Calculate bounds to fit all markers
  const getBounds = useCallback(() => {
    if (validRecords.length === 0 || !isLoaded || typeof window === "undefined" || !window.google) return null

    const bounds = new window.google.maps.LatLngBounds()
    validRecords.forEach((record) => {
      bounds.extend({
        lat: record.metadata.georeference.lat,
        lng: record.metadata.georeference.lon,
      })
    })
    return bounds
  }, [validRecords, isLoaded])

  // Fit map to bounds when records change
  useEffect(() => {
    if (mapRef.current && isLoaded && typeof window !== "undefined" && window.google) {
      const bounds = getBounds()
      if (bounds) {
        mapRef.current.fitBounds(bounds)
        // If there's only one marker, zoom out a bit
        if (validRecords.length === 1) {
          mapRef.current.setZoom(10)
        }
      }
    }
  }, [validRecords, isLoaded, getBounds])

  // Update selected record when it changes
  useEffect(() => {
    if (selectedRecord && isLoaded) {
      const record = validRecords.find((record, index) => getRecordId(record, index) === selectedRecord)
      if (record) {
        setSelectedRecordData(record)

        // Center the map on the selected record
        if (mapRef.current) {
          mapRef.current.panTo({
            lat: record.metadata.georeference.lat,
            lng: record.metadata.georeference.lon,
          })
        }
      }
    } else {
      setSelectedRecordData(null)
    }
  }, [selectedRecord, validRecords, getRecordId, isLoaded])

  // Store map reference when the map is loaded
  const onLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map
      const bounds = getBounds()
      if (bounds) {
        map.fitBounds(bounds)
      }
    },
    [getBounds],
  )

  const onUnmount = useCallback(() => {
    mapRef.current = null
  }, [])

  // Handle marker click
  const handleMarkerClick = (record: AssetRecord, index: number) => {
    onSelectRecord(getRecordId(record, index))
  }

  // Handle marker drag end
  const handleMarkerDragEnd = (event: google.maps.MapMouseEvent, record: AssetRecord, index: number) => {
    if (!event.latLng || !onRecordUpdate) return

    const newLat = event.latLng.lat()
    const newLng = event.latLng.lng()

    // Create a copy of the record with updated coordinates
    const updatedRecord = {
      ...record,
      georeference: {
        ...record.metadata.georeference,
        lat: newLat,
        lon: newLng,
        // Mark as manually adjusted
        source: record.metadata.georeference.source ? `${record.metadata.georeference.source} (adjusted)` : "manually adjusted",
      },
    }

    // Update the record
    onRecordUpdate(updatedRecord, index)

    // If this is the selected record, update the selected record data
    if (selectedRecordData && getRecordId(record, index) === selectedRecord) {
      setSelectedRecordData(updatedRecord)
    }
  }

  // Create custom marker icon
  const createMarkerIcon = (isSelected: boolean) => {
    if (typeof window === "undefined" || !window.google) return null

    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      fillColor: getTrustScoreColor(),
      fillOpacity: 1,
      scale: isSelected ? 10 : 8,
      strokeColor: "#FFFFFF",
      strokeWeight: 2,
    }
  }

  // Handle closing the detail card
  const handleCloseDetail = () => {
    onSelectRecord("")
  }

  // Fallback map component when API key is not configured
  if (apiKeyError) {
    return (
      <div className="h-full min-h-[500px] flex flex-col">
        <div className="bg-amber-50 border-amber-200 border p-4 rounded-md m-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800">Google Maps API Key Error</h3>
              <p className="text-sm text-amber-700 mt-1">
                The Google Maps API key is invalid or has restrictions. Please check your API key configuration.
              </p>
              <div className="mt-3">
                <a
                  href="https://developers.google.com/maps/documentation/javascript/get-api-key"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Learn how to set up a Google Maps API key
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-gray-100 p-4 overflow-auto">
          <h3 className="font-medium mb-3">Asset Locations ({validRecords.length})</h3>
          <div className="grid gap-3">
            {validRecords.map((record, index) => {
              const recordId = getRecordId(record, index)
              const isSelected = selectedRecord === recordId

              return (
                <Card
                  key={recordId}
                  className={`p-3 cursor-pointer ${isSelected ? "border-primary border-2" : ""}`}
                  onClick={() => handleMarkerClick(record, index)}
                >
                  <div className="flex items-start">
                    <div
                      className="w-6 h-6 rounded-full mr-3 mt-1 flex-shrink-0"
                      style={{ backgroundColor: getTrustScoreColor() }}
                    ></div>
                    <div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                        <span className="text-sm font-medium">
                          {record.metadata.georeference.lat.toFixed(4)}, {record.metadata.georeference.lon.toFixed(4)}
                        </span>
                      </div>
                      {record.metadata.georeference.source && (
                        <p className="text-xs text-gray-500 mt-1">Source: {record.metadata.georeference.source}</p>
                      )}
                      {record.metadata.georeference.intersection && (
                        <p className="text-xs text-gray-500 mt-1">Intersection: {record.metadata.georeference.intersection}</p>
                      )}
                      {record.text_blob_summary && (
                        <p className="text-xs mt-2 line-clamp-2">{record.text_blob_summary}</p>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  if (loadError && !apiKeyError) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px] bg-gray-100">
        <div className="text-center p-4">
          <p className="text-red-500 mb-2">Error loading Google Maps</p>
          <p className="text-sm text-gray-600">{loadError.message}</p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px] bg-gray-100">
        <p>Loading Google Maps...</p>
      </div>
    )
  }

  return (
    <div className="relative h-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={defaultZoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          fullscreenControl: false,
          mapTypeControl: true,
          streetViewControl: false,
          zoomControl: true,
          mapTypeId:
            typeof window !== "undefined" && window.google ? (window as any).google.maps.MapTypeId.ROADMAP : undefined,
        }}
      >
        {validRecords.map((record, index) => {
          const recordId = getRecordId(record, index)
          const isSelected = selectedRecord === recordId

          return (
            <Marker
              key={recordId}
              position={{
                lat: record.metadata.georeference.lat,
                lng: record.metadata.georeference.lon,
              }}
              onClick={() => handleMarkerClick(record, index)}
              icon={createMarkerIcon(isSelected)}
              zIndex={isSelected ? 1000 : 1}
              animation={
                isSelected && typeof window !== "undefined" && window.google
                  ? (window as any).google.maps.Animation.BOUNCE
                  : undefined
              }
              // Make markers draggable
              draggable={true}
              onDragEnd={(e) => handleMarkerDragEnd(e, record, index)}
            />
          )
        })}
      </GoogleMap>

      {/* Detail Card Overlay - Positioned differently for mobile and desktop */}
      {selectedRecordData && (
        <div
          className={`absolute z-10 ${isMobile ? "bottom-0 left-0 right-0 max-h-[70vh]" : "top-4 right-4 max-w-md"}`}
        >
          <RecordDetailCard record={selectedRecordData} onClose={handleCloseDetail} />
        </div>
      )}
    </div>
  )
}
