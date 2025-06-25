"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GeographicRegion } from "@/components/geographic-region"
import { ResultsView } from "@/components/results-view"
import  ProgressBar  from "@/components/progress-bar"

import { FileUploader } from "./file-uploader"
import { JsonEditor } from "./json-editor"
// import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Loader2, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { UploadedWithOption, useAppStore, type AssetRecord } from "@/lib/store"


export function UploadForm() {
  const [files, setFiles] = useState<UploadedWithOption[]>([])
  const [jsonData, setJsonData] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [activeTab, setActiveTab] = useState("file")
  const [validationError, setValidationError] = useState<string | null>(null)
  const router = useRouter()
  // const { toast } = useToast()
  const { addRecords, setRecords } = useAppStore()
  const { records } = useAppStore()

  const [results, setResults] = useState<any[]>([]);
  const [regionName, setRegionName] = useState("");
  const [boundingBox, setBoundingBox] = useState("");
  const [selectedOption, setSelectedOption] = useState<Record<number, string>>({});

  const [bboxTouched, setBboxTouched] = useState(false);

  const [activeMarkers, setActiveMarkers]  = useState<any[]>([]);
  const mapRef = useRef<HTMLDivElement | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responseData, setResponseData] = useState<any>(null);

  const isSubmitDisabled = () => {
    if (isUploading) return true
    if(!regionName.trim()) return true
    if (!boundingBox || typeof boundingBox !== "object" || Object.keys(boundingBox).length === 0) return true
    if (activeTab === "file" && files.length === 0) return true
    if (activeTab === "json" && !jsonData.trim()) return true
    return false
  }

  const handleRegionSelected = (name: string, bbox: any) => {
    setRegionName(name)
    setBoundingBox(bbox)
    setBboxTouched(true);
    setValidationError(null)
  }

  // const handleFilesSelected = (selectedFiles: UploadedWithOption[]) => {
  //   setFiles(selectedFiles)
  // }

  // const handleProcessComplete = (processResults: any[]) => {
  //   setResults(processResults)

  //   // Create markers from results
  //   const markers = processResults.map((result) => ({
  //     id: result.id,
  //     lat: result.coordinates?.lat || 0,
  //     lng: result.coordinates?.lng || 0,
  //     title: result.metadata?.title || "Unknown",
  //   }))

  //   setActiveMarkers(markers)
  // }

  const handleViewOnMap = (resultId: string) => {
    // Find the result and scroll to the map
    const result = results.find((r) => r.id === resultId)
    if (result && mapRef.current) {
      // Scroll to the map
      mapRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleSubmitReal = async () => {
    sessionStorage.clear();
    setIsUploading(true);
    setValidationError(null);
    setLoading(true);
    setError(null);
    setResponseData(null);

    if (!regionName.trim()) {
      setValidationError("Region name is required.")
      return
    }
    if (!boundingBox || typeof boundingBox !== "object" || Object.keys(boundingBox).length === 0) {
      setValidationError("Bounding box is required.")
      return
    }
    if (activeTab === "file" && files.length === 0) {
      setValidationError("Please upload at least one file.")
      return
    }
    if (activeTab === "json" && !jsonData.trim()) {
      setValidationError("Please provide JSON data.")
      return
    }
  
    let recordsToAdd: AssetRecord[] = [];
  
    const form = new FormData();
    form.append("region", regionName);
    form.append("bbox", JSON.stringify(boundingBox));
    Array.from(files).forEach((file) => form.append("files", file.file));

    const getFilePreviewData = (file: File): Promise<string> => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target?.result as string);
        };
        reader.readAsDataURL(file); // for base64 image/pdf
      });
    };
    
    // When storing files
    const filesWithPreview = await Promise.all(
      files.map(async (f) => ({
        name: f.file.name,
        previewUrl: await getFilePreviewData(f.file),
        option: f.option,
      }))
    );
    
    sessionStorage.setItem("files", JSON.stringify(filesWithPreview));
  
    try {
      setLoading(true)
      const response = await fetch("https://infra-mvp-api-195923635623.northamerica-northeast2.run.app/process", {
        method: "POST",
        body: form,
      });
      const contentType = response.headers.get("content-type");

      if ( response.status === 200 && contentType?.includes("application/json")) {
        const data = await response.json();
        console.log("✅ JSON Response:", data);
        recordsToAdd = data;
      } else {
        const responseData = await response.json();
        sessionStorage.setItem("error", JSON.stringify(responseData));
        router.push("/error");
        return;
      }
  
      sessionStorage.setItem("records", JSON.stringify(recordsToAdd));
      router.push("/records");
    } catch (err: any) {
      console.error("🚨 Fetch error:", err);
      setError(err.message || "Unknown error");
      router.push("/error");
    } finally {
      setRecords(recordsToAdd);
      setLoading(false);
      setIsUploading(false);
    }
  };

  return (
    <div>
      <ProgressBar loading={loading} />
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <GeographicRegion onRegionSelected={handleRegionSelected} markers={activeMarkers} onRegionNameChange={(name) => setRegionName(name)} />

          <ResultsView results={results} onViewOnMap={handleViewOnMap} />
        </CardHeader>
        <CardHeader>
          <div className="flex items-center mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-200 text-white mr-2">
              <span className="text-sm font-bold">2</span>
            </div>
            <CardTitle>Batch Upload Records</CardTitle>
          </div>
          <CardDescription>Upload your infrastructure asset records in bulk using a file or JSON data</CardDescription>
        </CardHeader>
        <CardContent>
        <div onMouseEnter={() => {
          if (regionName && !bboxTouched) {
            setValidationError("You must click 'Get Bounding Box' after entering your region");
          }
        }}>
            <FileUploader files={files} setFiles={setFiles} />
        </div>
          {/* <Tabs defaultValue="file" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="file">File Upload</TabsTrigger>
              <TabsTrigger value="json">JSON Data</TabsTrigger>
            </TabsList>
            <TabsContent value="file">
            </TabsContent>
            <TabsContent value="json">
              <JsonEditor value={jsonData} onChange={setJsonData} />
            </TabsContent>
          </Tabs> */}

          {validationError && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <div onMouseEnter={()=>{
          const hasMissingOption = files.some(file => !file.option)
          if (hasMissingOption) {
            setValidationError("You must select the file type from the dropdown before uploading files.");
          }
          else {
            setValidationError(null);
          }
        }}>
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
        </div>
      </Card>
    </div>
  )
}
