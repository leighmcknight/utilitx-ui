"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, FileText, Tag, X, ExternalLink } from "lucide-react"
import type { AssetRecord } from "@/lib/store"

interface RecordDetailCardProps {
  record: AssetRecord
  onClose: () => void
}

export function RecordDetailCard({ record, onClose }: RecordDetailCardProps) {
  if (!record || !record.georeference) return null

  return (
    <Card className="w-full max-w-md shadow-lg border-primary/10 overflow-hidden max-h-[calc(100vh-120px)]">
      <CardHeader className="bg-primary/5 py-3 px-4 relative">
        <Button variant="ghost" size="icon" className="absolute right-2 top-2 h-7 w-7 rounded-full" onClick={onClose}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
        <CardTitle className="text-base flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          Asset Record Details
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-y-auto max-h-[calc(100vh-180px)]">
        <div className="p-3 border-b">
          <h3 className="font-medium text-xs text-muted-foreground mb-2">Location Information</h3>
          <div className="grid grid-cols-2 gap-y-1 text-sm">
            <div>
              <span className="font-medium">Latitude:</span>
            </div>
            <div>{record.georeference.lat.toFixed(6)}</div>

            <div>
              <span className="font-medium">Longitude:</span>
            </div>
            <div>{record.georeference.lon.toFixed(6)}</div>

            <div>
              <span className="font-medium">Source:</span>
            </div>
            <div>{record.georeference.source || "N/A"}</div>

            {record.georeference.intersection && (
              <>
                <div>
                  <span className="font-medium">Intersection:</span>
                </div>
                <div>{record.georeference.intersection}</div>
              </>
            )}

            {record.georeference.address && (
              <>
                <div>
                  <span className="font-medium">Address:</span>
                </div>
                <div>{record.georeference.address}</div>
              </>
            )}
          </div>
        </div>

        <div className="p-3 border-b">
          <h3 className="font-medium text-xs text-muted-foreground mb-2">Quality Metrics</h3>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-primary/5">
              Confidence: {(record.georeference.conf * 100).toFixed(0)}%
            </Badge>
            <Badge variant="outline" className="bg-primary/5">
              Trust Score: {(record.georeference.trust_score * 100).toFixed(0)}%
            </Badge>
            <Badge variant="outline" className="bg-primary/5">
              Fallback: {record.georeference.fallback_used ? "Yes" : "No"}
            </Badge>
          </div>
        </div>

        {record.text_blob_summary && (
          <div className="p-3 border-b">
            <h3 className="font-medium text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              Summary
            </h3>
            <p className="text-sm whitespace-pre-line">{record.text_blob_summary}</p>
          </div>
        )}

        {record.tiles && Object.keys(record.tiles).length > 0 && (
          <div className="p-3 border-b">
            <h3 className="font-medium text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" />
              Text Extractions
            </h3>
            <div className="max-h-40 overflow-y-auto pr-2">
              {Object.entries(record.tiles).map(([key, tile]) => (
                <div key={key} className="mb-2 last:mb-0">
                  <p className="text-xs font-medium text-muted-foreground">{key}</p>
                  <p className="text-sm bg-muted/30 p-2 rounded-md">{tile.text_blob}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-3 bg-muted/10 flex justify-end">
          <Button variant="outline" size="sm" className="flex items-center gap-1.5 text-xs">
            <ExternalLink className="h-3 w-3" />
            View Full Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
