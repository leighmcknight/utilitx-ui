"use client"

import { useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { AssetRecord } from "@/lib/store"
import type { LatLngExpression } from "leaflet"

// Fix Leaflet icon issues
const fixLeafletIcons = () => {
  // Only run on the client
  if (typeof window !== "undefined" && window.L) {
    delete L.Icon.Default.prototype._getIconUrl

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    })
  }
}

interface LeafletMapProps {
  records: AssetRecord[]
  selectedRecord: string | null
  onSelectRecord: (id: string) => void
  getRecordId: (record: AssetRecord, index: number) => string
  center: LatLngExpression
  zoom: number
}

export default function LeafletMap({
  records,
  selectedRecord,
  onSelectRecord,
  getRecordId,
  center,
  zoom,
}: LeafletMapProps) {
  const mapRef = useRef(null)

  // Initialize Leaflet on component mount
  useEffect(() => {
    fixLeafletIcons()
  }, [])

  // Helper function to get marker color based on trust score
  function getTrustScoreColor(trustScore: number) {
    if (trustScore >= 0.9) return "green"
    if (trustScore >= 0.7) return "orange"
    if (trustScore >= 0.5) return "darkorange"
    return "red"
  }

  // Create a custom div icon for the marker
  const createCustomIcon = (trustScore: number, isSelected: boolean) => {
    return L.divIcon({
      className: "custom-marker",
      html: `<div style="
        width: ${isSelected ? "24px" : "16px"};
        height: ${isSelected ? "24px" : "16px"};
        background-color: ${getTrustScoreColor(trustScore)};
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 0 4px rgba(0,0,0,0.4);
        ${isSelected ? "transform: scale(1.5);" : ""}
      "></div>`,
      iconSize: [isSelected ? 24 : 16, isSelected ? 24 : 16],
      iconAnchor: [isSelected ? 12 : 8, isSelected ? 12 : 8],
    })
  }

  return (
    <div style={{ height: "500px", width: "100%" }}>
      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }} zoomControl={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />

        {records.map((record, index) => {
          const recordId = getRecordId(record, index)
          const isSelected = selectedRecord === recordId

          return (
            <Marker
              key={recordId}
              position={[record.georeference.lat, record.georeference.lon]}
              icon={createCustomIcon(record.georeference.trust_score, isSelected)}
              eventHandlers={{
                click: () => onSelectRecord(recordId),
              }}
            >
              <Popup>
                <div className="p-1">
                  <h3 className="font-bold text-sm">Location Details</h3>
                  <p className="text-xs mt-1">
                    Lat: {record.georeference.lat.toFixed(6)}, Lon: {record.georeference.lon.toFixed(6)}
                  </p>
                  <p className="text-xs">Source: {record.georeference.source || "N/A"}</p>
                  <p className="text-xs">Confidence: {(record.georeference.conf * 100).toFixed(0)}%</p>
                  <p className="text-xs">Trust Score: {(record.georeference.trust_score * 100).toFixed(0)}%</p>
                  {record.georeference.intersection && (
                    <p className="text-xs">Intersection: {record.georeference.intersection}</p>
                  )}
                  {record.georeference.address && <p className="text-xs">Address: {record.georeference.address}</p>}
                  <div className="mt-2 text-xs text-gray-500 max-w-[200px] truncate">{record.text_blob_summary}</div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
