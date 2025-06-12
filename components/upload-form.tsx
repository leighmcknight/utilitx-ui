"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GeographicRegion } from "@/components/geographic-region"
import { ResultsView } from "@/components/results-view"

import { FileUploader } from "./file-uploader"
import { JsonEditor } from "./json-editor"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Loader2, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAppStore, type AssetRecord } from "@/lib/store"

export function UploadForm() {
  const [files, setFiles] = useState<File[]>([])
  const [jsonData, setJsonData] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [activeTab, setActiveTab] = useState("file")
  const [validationError, setValidationError] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const { addRecords, setRecords } = useAppStore()
  const { records } = useAppStore()

  const [results, setResults] = useState([])
  const [regionName, setRegionName] = useState("")
  const [boundingBox, setBoundingBox] = useState("")

  const [activeMarkers, setActiveMarkers] = useState([])
  const mapRef = useRef(null)


  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responseData, setResponseData] = useState<any>(null);
  // const [bbox, setBbox] = useState<number[] | null>(null);

  const validateRecord = (record: any): record is AssetRecord => {
    // Check if record is an object
    if (!record || typeof record !== "object") {
      return false
    }

    // Check for tiles
    if (!record.tiles || typeof record.tiles !== "object") {
      return false
    }

    // Check for georeference
    if (!record.georeference || typeof record.georeference !== "object") {
      return false
    }

    // Check required georeference fields
    const geo = record.georeference
    if (
      typeof geo.lat !== "number" ||
      typeof geo.lon !== "number" ||
      typeof geo.conf !== "number" ||
      typeof geo.source !== "string" ||
      typeof geo.trust_score !== "number" ||
      typeof geo.fallback_used !== "boolean"
    ) {
      return false
    }

    // Check for bounding_box
    if (!record.bounding_box || typeof record.bounding_box !== "object") {
      return false
    }

    // Check bounding_box structure
    const bbox = record.bounding_box
    if (
      !bbox.southwest ||
      !bbox.northeast ||
      typeof bbox.southwest !== "object" ||
      typeof bbox.northeast !== "object"
    ) {
      return false
    }

    // Check bounding_box coordinates
    if (
      typeof bbox.southwest.lat !== "number" ||
      typeof bbox.southwest.lng !== "number" ||
      typeof bbox.northeast.lat !== "number" ||
      typeof bbox.northeast.lng !== "number"
    ) {
      return false
    }

    // Check for text_blob_summary
    if (typeof record.text_blob_summary !== "string") {
      return false
    }

    return true
  }

  const processJsonData = (jsonString: string): AssetRecord[] | null => {
    try {
      const parsed = JSON.parse(jsonString)
      let records: any[]

      console.log("PARSED IN JSON: ", parsed)

      // Handle both array and object formats
      if (Array.isArray(parsed)) {
        records = parsed
      } else if (parsed.records && Array.isArray(parsed.records)) {
        records = parsed.records
      } else if (typeof parsed === "object") {
        records = [parsed] // Single record
      } else {
        setValidationError("Invalid JSON format. Expected an array of records or an object with a 'records' array.")
        return null
      }

      // Validate each record
      for (let i = 0; i < records.length; i++) {
        if (!validateRecord(records[i])) {
          setValidationError(`Record at index ${i} is missing required fields or has invalid data types.`)
          return null
        }
      }

      setValidationError(null)
      return records as AssetRecord[]
    } catch (error) {
      setValidationError("Invalid JSON: " + (error instanceof Error ? error.message : String(error)))
      return null
    }
  }

  const processFileData = async (file: File): Promise<AssetRecord[] | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        const records = processJsonData(content)
        resolve(records)
      }
      reader.onerror = () => {
        setValidationError("Error reading file")
        resolve(null)
      }
      reader.readAsText(file)
    })
  }

  const handleSubmit = async () => {
    setIsUploading(true)
    setValidationError(null)

    try {
      let recordsToAdd: AssetRecord[] = []

      // Process JSON data
      if (activeTab === "json" && jsonData) {
        const records = processJsonData(jsonData)
        if (!records) {
          setIsUploading(false)
          return
        }
        recordsToAdd = records
      }

      // Process file uploads
      if (activeTab === "file" && files.length > 0) {
        for (const file of files) {
          if (file.type === "application/json" || file.name.endsWith(".json")) {
            const records = await processFileData(file)
            if (records) {
              recordsToAdd = [...recordsToAdd, ...records]
            } else {
              setIsUploading(false)
              return
            }
          }
        }
      }

      if (recordsToAdd.length === 0) {
        setValidationError("No valid records found to upload")
        setIsUploading(false)
        return
      }

      // Add records to store
      setRecords(recordsToAdd)

      toast({
        title: "Upload successful",
        description: `${recordsToAdd.length} asset records have been uploaded.`,
      })

      // Navigate to records page
      router.push("/records")
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your data. Please try again.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsUploading(false)
    }
  }

  const isSubmitDisabled = () => {
    if (isUploading) return true
    if (activeTab === "file" && files.length === 0) return true
    if (activeTab === "json" && !jsonData.trim()) return true
    return false
  }

  const handleRegionSelected = (name: string, bbox: any) => {
    setRegionName(name)
    setBoundingBox(bbox)
    console.log("Selected region:", regionName, "Bounding box:", boundingBox)

    console.log("regionName: ", regionName);
    console.log("boundingBox: ", boundingBox);
  }

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles)
  }

  const handleProcessComplete = (processResults: any[]) => {
    setResults(processResults)

    // Create markers from results
    const markers = processResults.map((result) => ({
      id: result.id,
      lat: result.coordinates?.lat || 0,
      lng: result.coordinates?.lng || 0,
      title: result.metadata?.title || "Unknown",
    }))

    setActiveMarkers(markers)
  }

  const handleViewOnMap = (resultId: string) => {
    // Find the result and scroll to the map
    const result = results.find((r) => r.id === resultId)
    if (result && mapRef.current) {
      // Scroll to the map
      mapRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleSubmitReal = async () => {
    setIsUploading(true)
    setValidationError(null)
    setLoading(true);
    setError(null);
    setResponseData(null);

    try {
      let recordsToAdd: AssetRecord[] = [];
      // Process JSON data
      // if (activeTab === "json" && jsonData) {
      //   console.log("Processing JSON data:", jsonData)
      //   const records = processJsonData(jsonData)
      //   if (!records) {
      //     setIsUploading(false)
      //     return
      //   }
      //   recordsToAdd = records
      // }

      // Process file uploads
      // if (activeTab === "file" && files.length > 0) {
      //   console.log("Processing file uploads:", files);
      //   if (records) {
      //     recordsToAdd = [...recordsToAdd, ...records]
      //   } else {
      //     setIsUploading(false)
      //     return
      //   }
        // for (const file of files) {
          // if (file.type === "application/json" || file.name.endsWith(".json")) {
          //   // const records = await processFileData(file)
          // }
        // }
      // }
      // // Add records to store
      
      
      // const firstData = {
      //   "region": regionName,
      //   "bbox": boundingBox,
      //   "files": files[0]
      // }
      
      // console.log("First data to be sent:", firstData);
      
      
      const form = new FormData();
      form.append("region", regionName);
      form.append("bbox", JSON.stringify(boundingBox));
      // form.append("files", JSON.stringify(boundingBox));
      Array.from(files).forEach((file) => form.append("files", file));
  
        
        toast({
          title: "Upload successful",
          description: `${files.length} asset records have been uploaded.`,
        })
        
        try {
          const response = await fetch("https://infra-mvp-api-195923635623.northamerica-northeast2.run.app/process", {
            method: "POST",
            body: form,
          });
          
          
          console.log("Response:", response);
          const contentType = response.headers.get("content-type");
          
          if (contentType?.includes("application/json")) {
            const data = await response.json();
            console.log("✅ JSON Response:", data);
            console.log(data);
            recordsToAdd = [data[0].metadata];
            setResponseData(recordsToAdd);

          } else {
            const text = await response.text();
            console.warn("📄 Text Response:", text);
            setError("Received non-JSON response from server");
          }
        } catch (err: any) {
          console.error("🚨 Fetch error:", err);
          setError(err.message || "Unknown error");
        } finally {
        setRecords(recordsToAdd)
        console.log("Records to add:", records)
        setLoading(false);
      }
      // Navigate to records page
      // router.push("/records")
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your data. Please try again.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsUploading(false)
    }

    // const form = new FormData();
    // form.append("region", "Durham Region, ON");
    // bbox.forEach((val) => "[-79.327997, 43.520000, -78.327997, 44.510000]");
    // Array.from(files).forEach((file) => form.append("files", file));

  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <div ref={mapRef}>
          <GeographicRegion onRegionSelected={handleRegionSelected} markers={activeMarkers} />
        </div>

        <ResultsView results={results} onViewOnMap={handleViewOnMap} />
      </CardHeader>
      <CardHeader>
        <CardTitle>Batch Upload Records</CardTitle>
        <CardDescription>Upload your infrastructure asset records in bulk using a file or JSON data</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="file" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="file">File Upload</TabsTrigger>
            <TabsTrigger value="json">JSON Data</TabsTrigger>
          </TabsList>
          <TabsContent value="file">
            <FileUploader files={files} setFiles={setFiles} />
          </TabsContent>
          <TabsContent value="json">
            <JsonEditor value={jsonData} onChange={setJsonData} />
          </TabsContent>
        </Tabs>

        {validationError && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{validationError}</AlertDescription>
          </Alert>
        )}

        <Alert className="mt-4">
          <AlertDescription>
            JSON data should follow this format:
            <pre className="mt-2 p-2 bg-muted rounded-md text-xs overflow-auto">
              {`[
  {
    "tiles": {
      "tile_0_0": { "text_blob": "..." },
      "tile_0_1": { "text_blob": "..." }
    },
    "georeference": {
      "lat": 43.896933,
      "lon": -78.843889,
      "conf": 0.9,
      "source": "google_intersection",
      "trust_score": 0.9,
      "fallback_used": false
    },
    "bounding_box": {
      "southwest": { "lat": 43.52, "lng": -79.32 },
      "northeast": { "lat": 44.51, "lng": -78.32 }
    },
    "text_blob_summary": "Summary of utility drawing..."
  }
]`}
            </pre>
          </AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleSubmitReal} disabled={isSubmitDisabled()}>
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            "Upload Records"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
