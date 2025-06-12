"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { RecordsTable } from "./records-table"
import { RecordsMap } from "./records-map"
import { JsonExport } from "./json-export"
import { Search, ListFilter, Upload } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAppStore, type AssetRecord } from "@/lib/store"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function RecordsView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRecord, setSelectedRecord] = useState<string | null>(null)
  const [sourceFilter, setSourceFilter] = useState<string[]>([])
  const [view, setView] = useState<"list" | "map">("list")
  const [workingRecords, setWorkingRecords] = useState<AssetRecord[]>([])
  const [hasModifiedRecords, setHasModifiedRecords] = useState(false)
  const { records } = useAppStore()
  const router = useRouter()

  // Initialize working records from store records
  useEffect(() => {
    setWorkingRecords(records)
    setHasModifiedRecords(false)
  }, [records])

  // Use uploaded records
  const displayRecords = workingRecords.length > 0 ? workingRecords : []
  const isEmpty = displayRecords.length === 0

  console.log("Records:", records)
  console.log("Display Records:", displayRecords)
  console.log("Working Records:", workingRecords)
  
  // Get unique sources for filters
  const sources = Array.from(new Set(displayRecords.map((record) => record.georeference?.source).filter(Boolean)))
  console.log("Sources:", sources)

  const filteredRecords = displayRecords.filter((record) => {
    console.log("Filtering Record:", record)

    record.text_blob_summary = record.text_blob_summary || "Summary of utility drawing..."
    
    console.log(record.text_blob_summary)
    console.log(record.georeference)
    
    // Ensure all properties exist before accessing them
    if (!record.text_blob_summary || !record.georeference) return false


    // Text search in summary or intersection
    const summaryMatch = record.text_blob_summary.toLowerCase().includes(searchQuery.toLowerCase())
    console.log("Summary Match:", summaryMatch)

    const intersectionMatch = record.georeference.intersection 
      // record.georeference.intersection.toLowerCase().includes(searchQuery.toLowerCase())

    const addressMatch =
      record.georeference.address && record.georeference.address.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesSearch = searchQuery === "" || summaryMatch || intersectionMatch || addressMatch

    // Source filter
    const matchesSource =
      sourceFilter.length === 0 || (record.georeference.source && sourceFilter.includes(record.georeference.source))

    return matchesSearch && matchesSource
  })
  console.log("Filtered Records:", filteredRecords)

  const handleRecordSelect = (id: string) => {
    setSelectedRecord(id === selectedRecord ? null : id)
  }

  const navigateToUpload = () => {
    router.push("/")
  }

  // Handle record updates (e.g., when a marker is dragged)
  const handleRecordUpdate = (updatedRecord: AssetRecord, index: number) => {
    const newRecords = [...workingRecords]
    newRecords[index] = updatedRecord
    setWorkingRecords(newRecords)
    setHasModifiedRecords(true)
  }

  // Function to get a unique ID for each record
  const getRecordId = (record: AssetRecord, index: number) => {
    if (!record.georeference) return `record-${index}`
    return `${record.georeference.lat}-${record.georeference.lon}-${index}`
  }

  // Calculate stats
  const totalRecords = displayRecords.length
  const lowConfidenceCount = displayRecords.filter((r) => r.georeference?.conf < 0.7).length
  const avgTrustScore =
    displayRecords.length > 0
      ? Math.round(
          (displayRecords.reduce((sum, r) => sum + (r.georeference?.trust_score || 0), 0) / displayRecords.length) *
            100,
        )
      : 0

  if (isEmpty) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertTitle>No Records Found</AlertTitle>
          <AlertDescription>
            You haven't uploaded any asset records yet. Upload JSON data to see your records here.
          </AlertDescription>
        </Alert>
        <Button onClick={navigateToUpload} className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Upload Asset Records
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search records..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <ListFilter className="h-4 w-4" />
                Source
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {sources.map((source) => (
                <DropdownMenuCheckboxItem
                  key={source}
                  checked={sourceFilter.includes(source)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSourceFilter([...sourceFilter, source])
                    } else {
                      setSourceFilter(sourceFilter.filter((s) => s !== source))
                    }
                  }}
                >
                  {source}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="ml-auto">
          <Tabs value={view} onValueChange={(v) => setView(v as "list" | "map")} className="w-[200px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list">List</TabsTrigger>
              <TabsTrigger value="map">Map</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 flex flex-col items-center">
            <div className="text-4xl font-bold">{totalRecords}</div>
            <div className="text-sm text-gray-500">Total Records</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col items-center">
            <div className="text-4xl font-bold">{lowConfidenceCount}</div>
            <div className="text-sm text-gray-500">Low Confidence</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col items-center">
            <div className="text-4xl font-bold">{avgTrustScore}%</div>
            <div className="text-sm text-gray-500">Trust Score (Avg)</div>
          </CardContent>
        </Card>
      </div>

      <div className="h-[calc(100vh-400px)] min-h-[500px]">
        {view === "list" ? (
          <RecordsTable records={filteredRecords} selectedRecord={selectedRecord} onSelectRecord={handleRecordSelect} />
        ) : (
          <RecordsMap
            records={filteredRecords}
            selectedRecord={selectedRecord}
            onSelectRecord={handleRecordSelect}
            onRecordUpdate={handleRecordUpdate}
            getRecordId={getRecordId}
          />
        )}
      </div>

      {/* JSON Export Component */}
      <JsonExport records={workingRecords} hasModifiedRecords={hasModifiedRecords} />
    </div>
  )
}
