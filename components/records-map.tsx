"use client"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"
import type { AssetRecord } from "@/lib/store"
import dynamic from "next/dynamic"

// Dynamically import the Google Maps component with no SSR
const GoogleMapComponent = dynamic(() => import("@/components/google-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex-1 bg-gray-100 flex items-center justify-center min-h-[500px]">
      <p>Loading map...</p>
    </div>
  ),
})

interface RecordsMapProps {
  records: AssetRecord[]
  selectedRecord: string | null
  onSelectRecord: (id: string) => void
  onRecordUpdate?: (updatedRecord: AssetRecord, index: number) => void
  getRecordId: (record: AssetRecord, index: number) => string
}

export function RecordsMap({ records, selectedRecord, onSelectRecord, onRecordUpdate, getRecordId }: RecordsMapProps) {
  const { toast } = useToast()
  const isMobile = useMobile()

  // Filter records with valid georeference data
  const validRecords = records.filter(
    (record) =>
      record.georeference && typeof record.georeference.lat === "number" && typeof record.georeference.lon === "number",
  )

  return (
    <Card className="overflow-hidden border shadow-md h-full flex flex-col">
      <div className="w-full flex-1 relative">
        <GoogleMapComponent
          records={validRecords}
          selectedRecord={selectedRecord}
          onSelectRecord={onSelectRecord}
          getRecordId={getRecordId}
          onRecordUpdate={onRecordUpdate}
        />
      </div>
      <div className="p-4 bg-white border-t">
        <div className="text-sm">
          <p className="font-medium mb-2">Map Legend</p>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-600"></div>
            <span className="text-xs">Asset Location (drag to adjust)</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
