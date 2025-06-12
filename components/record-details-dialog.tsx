"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Info, FileCode, MapPin, Copy, Download } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { ClientOnly } from "./client-only"
import { DynamicBoundingBoxMap } from "./dynamic-map-components"

interface RecordDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  record: any | null
}

export function RecordDetailsDialog({ open, onOpenChange, record }: RecordDetailsDialogProps) {
  const { toast } = useToast()

  if (!record) return null

  const formatIntersection = (intersection: string | undefined) => {
    if (!intersection) return "N/A"
    return intersection
  }

  // Extract text content from tiles
  const textContent = record.metadata?.tiles
    ? Object.values(record.metadata.tiles)
        .map((tile: any) => tile.text_blob || "")
        .join("\n\n")
    : ""

  // Determine drawing type based on content
  let drawingType = "Unknown"
  if (textContent.includes("STORM SEWER") || textContent.includes("STM") || textContent.includes("SANITARY")) {
    drawingType = "Sewer Plan"
  } else if (textContent.includes("WATER MAIN") || textContent.includes("W.M.") || textContent.includes("WATERMAIN")) {
    drawingType = "Water Main"
  } else if (textContent.includes("PAVEMENT") || textContent.includes("ROAD")) {
    drawingType = "Road Plan"
  }

  // Identify key elements in the drawing
  const keyElements = []
  if (textContent.includes("STORM SEWER") || textContent.includes("STM")) keyElements.push("Storm Sewer")
  if (textContent.includes("SANITARY") || textContent.includes("SAN")) keyElements.push("Sanitary Sewer")
  if (textContent.includes("WATER MAIN") || textContent.includes("W.M.") || textContent.includes("WATERMAIN"))
    keyElements.push("Water Main")
  if (textContent.includes("PAVEMENT") || textContent.includes("ROAD")) keyElements.push("Road")
  if (textContent.includes("CURB") || textContent.includes("GUTTER")) keyElements.push("Curb & Gutter")
  if (textContent.includes("SIDEWALK") || textContent.includes("S/W")) keyElements.push("Sidewalk")
  if (textContent.includes("CATCH BASIN") || textContent.includes("C.B.")) keyElements.push("Catch Basin")
  if (textContent.includes("MANHOLE") || textContent.includes("M.H.")) keyElements.push("Manhole")

  const handleCopyText = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(textContent)
      toast({
        title: "Text Copied",
        description: "The extracted text has been copied to your clipboard.",
      })
    }
  }

  const handleCopyJSON = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(JSON.stringify(record, null, 2))
      toast({
        title: "JSON Copied",
        description: "The raw JSON data has been copied to your clipboard.",
      })
    }
  }

  const handleDownloadText = () => {
    if (typeof window !== "undefined") {
      const blob = new Blob([textContent], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${record.record_id}_text.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Record Details: {record.record_id}
          </DialogTitle>
          <DialogDescription>Detailed information about the processed record</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="summary" className="flex-1 overflow-hidden flex flex-col">
          <TabsList>
            <TabsTrigger value="summary" className="flex items-center">
              <Info className="h-4 w-4 mr-2" />
              Summary
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Extracted Text
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Map View
            </TabsTrigger>
            <TabsTrigger value="json" className="flex items-center">
              <FileCode className="h-4 w-4 mr-2" />
              Raw JSON
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[calc(80vh-180px)]">
              <div className="space-y-6 p-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Record ID</p>
                      <p className="font-mono">{record.record_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Drawing Type</p>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {drawingType}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p>{formatIntersection(record.metadata?.georeference?.intersection)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="text-sm">{record.metadata?.georeference?.address || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Confidence</p>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {((record.metadata?.georeference?.trust_score || 0) * 100).toFixed(0)}%
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Georeference Source</p>
                      <p>{record.metadata?.georeference?.georeference_source || "Unknown"}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Geographic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Coordinates</p>
                      <p className="font-mono">
                        Lat: {record.metadata?.georeference?.lat?.toFixed(6) || "N/A"}
                        <br />
                        Lon: {record.metadata?.georeference?.lon?.toFixed(6) || "N/A"}
                      </p>
                    </div>
                    {record.metadata?.bounding_box && (
                      <div>
                        <p className="text-sm text-gray-500">Bounding Box</p>
                        <p className="font-mono text-sm">
                          NE: {record.metadata.bounding_box.northeast.lat.toFixed(6)},{" "}
                          {record.metadata.bounding_box.northeast.lng.toFixed(6)}
                          <br />
                          SW: {record.metadata.bounding_box.southwest.lat.toFixed(6)},{" "}
                          {record.metadata.bounding_box.southwest.lng.toFixed(6)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Drawing Content Analysis</h3>
                  <div className="mb-2">
                    <p className="text-sm text-gray-500">Key Elements</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {keyElements.map((element) => (
                        <Badge key={element} variant="outline" className="bg-gray-100">
                          {element}
                        </Badge>
                      ))}
                      {keyElements.length === 0 && <p className="text-sm text-gray-500">No key elements identified</p>}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Text Preview</p>
                    <div className="bg-gray-50 p-3 rounded-md mt-1">
                      <p className="text-sm line-clamp-3">{textContent.substring(0, 200)}...</p>
                    </div>
                  </div>
                </div>

                {record.error && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-red-600">Errors</h3>
                    <p className="text-red-600">{record.error}</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="text" className="flex-1 overflow-hidden">
            <div className="flex justify-end gap-2 p-2 bg-gray-50 border-b">
              <Button variant="outline" size="sm" onClick={handleCopyText}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Text
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadText}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
            <ScrollArea className="h-[calc(80vh-220px)]">
              <div className="p-4">
                <pre className="whitespace-pre-wrap font-mono text-sm">{textContent}</pre>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="map" className="flex-1 overflow-hidden">
            <div className="h-[calc(80vh-180px)]">
              <ClientOnly fallback={<div className="flex items-center justify-center h-full">Loading map...</div>}>
                {record.metadata?.bounding_box ? (
                  <DynamicBoundingBoxMap
                    boundingBox={record.metadata.bounding_box}
                    markers={[
                      {
                        id: record.record_id,
                        lat: record.metadata.georeference?.lat || 0,
                        lng: record.metadata.georeference?.lon || 0,
                        title: record.metadata.georeference?.intersection || record.record_id,
                      },
                    ]}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No geographic data available for this record.</p>
                  </div>
                )}
              </ClientOnly>
            </div>
          </TabsContent>

          <TabsContent value="json" className="flex-1 overflow-hidden">
            <div className="flex justify-end gap-2 p-2 bg-gray-50 border-b">
              <Button variant="outline" size="sm" onClick={handleCopyJSON}>
                <Copy className="h-4 w-4 mr-2" />
                Copy JSON
              </Button>
            </div>
            <ScrollArea className="h-[calc(80vh-220px)]">
              <div className="p-4">
                <pre className="bg-gray-50 p-3 rounded-md text-sm whitespace-pre-wrap font-mono overflow-x-auto">
                  {JSON.stringify(record, null, 2)}
                </pre>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export default RecordDetailsDialog
