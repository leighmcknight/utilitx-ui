"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FileText, MapPin } from "lucide-react"

interface ResultsViewProps {
  results: Array<{
    id: string
    filename: string
    status: string
    coordinates: {
      lat: number
      lng: number
    }
    metadata: {
      title: string
      date: string
      scale: string
    }
  }>
  onViewOnMap: (resultId: string) => void
}

export function ResultsView({ results, onViewOnMap }: ResultsViewProps) {
  if (results.length === 0) {
    return null
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="text-xl">Processing Results</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Filename</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Coordinates</TableHead>
              <TableHead>Metadata</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result) => (
              <TableRow key={result.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-gray-500" />
                    {result.filename}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {result.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>Lat: {result.coordinates.lat.toFixed(6)}</div>
                    <div>Lng: {result.coordinates.lng.toFixed(6)}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>
                      <strong>Title:</strong> {result.metadata.title}
                    </div>
                    <div>
                      <strong>Date:</strong> {result.metadata.date}
                    </div>
                    <div>
                      <strong>Scale:</strong> {result.metadata.scale}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => onViewOnMap(result.id)}
                    className="flex items-center text-sm text-primary-200 hover:text-primary-300"
                  >
                    <MapPin className="h-4 w-4 mr-1" />
                    View on Map
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
