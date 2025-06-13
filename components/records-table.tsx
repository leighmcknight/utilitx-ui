"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { getScoreColor } from "@/lib/utils"
import { FileText, MoreHorizontal, ChevronUp, ChevronDown, ArrowUpDown, Eye, Edit, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import type { AssetRecord } from "@/lib/store"

interface RecordsTableProps {
  records: AssetRecord[]
  selectedRecord: string | null
  onSelectRecord: (id: string) => void
}

type SortField = "lat" | "lon" | "conf" | "source" | "trust_score" | "fallback_used"
type SortDirection = "asc" | "desc"

export function RecordsTable({ records, selectedRecord, onSelectRecord }: RecordsTableProps) {
  const [sortField, setSortField] = useState<SortField>("lat")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [detailRecord, setDetailRecord] = useState<AssetRecord | null>(null)
  const { toast } = useToast()

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const sortedRecords = [...records].sort((a, b) => {
    let comparison = 0

    // Ensure metadata.georeference exists before accessing properties
    if (!a.metadata.georeference || !b.metadata.georeference) return 0

    switch (sortField) {
      case "lat":
        comparison = a.metadata.georeference.lat - b.metadata.georeference.lat
        break
      case "lon":
        comparison = a.metadata.georeference.lon - b.metadata.georeference.lon
        break
      case "conf":
        comparison = a.metadata.georeference.conf - b.metadata.georeference.conf
        break
      case "source":
        comparison = (a.metadata.georeference.source || "").localeCompare(b.metadata.georeference.source || "")
        break
      case "trust_score":
        comparison = a.metadata.georeference.trust_score - b.metadata.georeference.trust_score
        break
      case "fallback_used":
        comparison = (a.metdata.metadata.georeference.fallback_used ? 1 : 0) - (b.metdata.georeference.fallback_used ? 1 : 0)
        break
    }
    return sortDirection === "asc" ? comparison : -comparison
  })

  const handleDelete = (index: number) => {
    toast({
      title: "Asset Deleted",
      description: `Asset at index ${index} has been deleted.`,
    })
  }

  const handleEdit = (index: number) => {
    toast({
      title: "Edit Asset",
      description: `Editing asset at index ${index}.`,
    })
  }

  const handleView = (index: number) => {
    toast({
      title: "View Asset",
      description: `Viewing asset at index ${index}.`,
    })
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (field !== sortField) return <ArrowUpDown className="h-4 w-4 ml-1" />
    return sortDirection === "asc" ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
  }

  // Function to get a unique ID for each record (since the new schema doesn't have an ID field)
  const getRecordId = (record: AssetRecord, index: number) => {
    if (!record.metadata.georeference) return `record-${index}`
    return `${record.metadata.georeference.lat}-${record.metadata.georeference.lon}-${index}`
  }

  // Function to truncate text
  const truncateText = (text: string | undefined, maxLength = 100) => {
    if (!text) return "N/A"
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
  }

  return (
    <>
      <div className="rounded-md border overflow-hidden h-full flex flex-col">
        <div className="overflow-auto flex-1">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => handleSort("lat")}>
                  <div className="flex items-center">
                    Latitude
                    <SortIcon field="lat" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("lon")}>
                  <div className="flex items-center">
                    Longitude
                    <SortIcon field="lon" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("conf")}>
                  <div className="flex items-center">
                    Confidence
                    <SortIcon field="conf" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("source")}>
                  <div className="flex items-center">
                    Source
                    <SortIcon field="source" />
                  </div>
                </TableHead>
                <TableHead>Intersection</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("trust_score")}>
                  <div className="flex items-center">
                    Trust Score
                    <SortIcon field="trust_score" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("fallback_used")}>
                  <div className="flex items-center">
                    Fallback Used
                    <SortIcon field="fallback_used" />
                  </div>
                </TableHead>
                <TableHead>Summary</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    No records found
                  </TableCell>
                </TableRow>
              ) : (
                sortedRecords.map((record, index) => {
                  // Skip records without metadata.georeference data
                  const recordId = getRecordId(record, index)
                  if (!record.metadata.georeference) return null

                  // TODO: REMOVE THIS LOGGING
                  // console.log("recordId: ", recordId)
                  // console.log("record.metadata.georeference: ", record.metadata.georeference)
                  // console.log("!record.metadata.georeference: ", !record.metadata.georeference)
                  // console.log("selectedRecord === recordId: ", selectedRecord === recordId)
                  // console.log("starting return")
                  // console.log("record: ", record)
                  // console.log("record.metadata.georeference.lat: ", record.metadata.georeference.lat)
                  // console.log("record.metadata.georeference.lon: ", record.metadata.georeference.lon)
                  // console.log("record.metadata.georeference.conf: ", record.metadata.georeference.conf)
                  // console.log("record.metadata.georeference.source: ", record.metadata.georeference.source)
                  // console.log("record.metadata.georeference.intersection: ", record.metadata.georeference.intersection.length)
                  // console.log("record.metadata.georeference.intersection: ", detailRecord)

                  // record.metadata.georeference.intersection


                  return (
                    // <div></div>
                    <TableRow
                      key={recordId}
                      className={`cursor-pointer ${selectedRecord === recordId ? "bg-muted/50" : ""}`}
                      onClick={() => onSelectRecord(recordId)}
                    >
                      <TableCell>{record.metadata.georeference.lat.toFixed(6)}</TableCell>
                      <TableCell>{record.metadata.georeference.lon.toFixed(6)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getScoreColor(Math.round(record.metadata.georeference.conf * 100))}>
                          {(record.metadata.georeference.conf * 100).toFixed(0)}%
                        </Badge>
                      </TableCell>
                      <TableCell>{record.metadata.georeference.source || "N/A"}</TableCell>
                      <TableCell>
                        {Array.isArray(record.metadata.georeference.intersection)
                        ? record.metadata.georeference.intersection.map(item => item.name).join(", ")
                        : record.metadata.georeference.intersection || "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getScoreColor(Math.round(record.metadata.georeference.trust_score * 100))}
                        >
                          {(record.metadata.georeference.trust_score * 100).toFixed(0)}%
                        </Badge>
                      </TableCell>
                      <TableCell>{record.metadata.georeference.fallback_used ? "Yes" : "No"}</TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate">{truncateText(record.text_blob_summary, 50)}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" onClick={() => setDetailRecord(record)}>
                              <FileText className="h-4 w-4" />
                              <span className="sr-only">View Details</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Asset Details</DialogTitle>
                            </DialogHeader>
                            {detailRecord && detailRecord.metadata.georeference && (
                              <div className="space-y-4">
                                <div>
                                  <h3 className="text-lg font-semibold">metadata.georeference</h3>
                                  <div className="grid grid-cols-2 gap-2 mt-2">
                                    <div>
                                      <p className="text-sm font-medium">Latitude</p>
                                      <p className="text-sm">{detailRecord.metadata.georeference.lat.toFixed(6)}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">Longitude</p>
                                      <p className="text-sm">{detailRecord.metadata.georeference.lon.toFixed(6)}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">Confidence</p>
                                      <p className="text-sm">
                                        {(detailRecord.metadata.georeference.conf * 100).toFixed(0) + "%"}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">Source</p>
                                      <p className="text-sm">{detailRecord.metadata.georeference.source || "N/A"}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">Intersection</p>
                                      <p className="text-sm">{detailRecord.metadata.georeference.intersection || "N/A"}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">Address</p>
                                      <p className="text-sm">{detailRecord.metadata.georeference.address || "N/A"}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">Trust Score</p>
                                      <p className="text-sm">
                                        {(detailRecord.metadata.georeference.trust_score * 100).toFixed(0) + "%"}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">Fallback Used</p>
                                      <p className="text-sm">
                                        {detailRecord.metadata.georeference.fallback_used ? "Yes" : "No"}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {detailRecord.bounding_box && (
                                  <div>
                                    <h3 className="text-lg font-semibold">Bounding Box</h3>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                      <div>
                                        <p className="text-sm font-medium">Southwest</p>
                                        <p className="text-sm">
                                          {`${detailRecord.bounding_box.southwest.lat.toFixed(
                                            6,
                                          )}, ${detailRecord.bounding_box.southwest.lng.toFixed(6)}`}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium">Northeast</p>
                                        <p className="text-sm">
                                          {`${detailRecord.bounding_box.northeast.lat.toFixed(
                                            6,
                                          )}, ${detailRecord.bounding_box.northeast.lng.toFixed(6)}`}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {detailRecord.tiles && (
                                  <div>
                                    <h3 className="text-lg font-semibold">Tiles</h3>
                                    <div className="grid grid-cols-1 gap-2 mt-2">
                                      {Object.entries(detailRecord.tiles).map(([key, tile]) => (
                                        <div key={key} className="border p-2 rounded-md">
                                          <p className="text-sm font-medium">{key}</p>
                                          <p className="text-sm whitespace-pre-line">{tile.text_blob}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <div>
                                  <h3 className="text-lg font-semibold">Summary</h3>
                                  <p className="text-sm whitespace-pre-line mt-2">{detailRecord.text_blob_summary}</p>
                                </div>

                                {detailRecord.text_blob_interpretation_labeled && (
                                  <div>
                                    <h3 className="text-lg font-semibold">Interpretation</h3>
                                    <p className="text-sm whitespace-pre-line mt-2">
                                      {detailRecord.text_blob_interpretation_labeled}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">More options</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleView(index)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(index)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Asset
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(index)} className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Asset
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  )
}
