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

  const stubbedData = [
    {
        "record_id": "OSH-1781.pdf-p00",
        "geometry": {
            "type": "Point",
            "coordinates": [
                -78.8959082,
                43.896971
            ]
        },
        "metadata": {
            "tiles": {
                "tile_0_0": {
                    "text_blob": "BHB No. 416\n12\"\n44+58"
                },
                "tile_0_1": {
                    "text_blob": "PRESSURE ZONES\nI - HGL 500'        II - HGL 610'\nOF 8\" D.I.\n46+68.80\n47+57.71\nTEMPORARY THRUST BLOCK\n8\" M.J. PLUG\n8\" M.J. GATE VALVE\nWM UNDER PROPOSED ST. SEWER\n6\" 45° BEND\n6\"x6\" TEE\n45+00\n30\""
                },
                "tile_0_2": {
                    "text_blob": "50+00\n49+66\n27”\nCH.\n11"
                },
                "tile_0_3": {
                    "text_blob": "51+66\n3/4\" TYPE 'K' SERV. CONNECTION STA. 52+39\n3/4\" TYPE 'K' SERV. CONNECTION STA. 53+07\n53+76\n24\"\n12\"\nOHLS TRANS"
                },
                "tile_1_0": {
                    "text_blob": "REMOVE EXIST. BLOWOFF & CONNECT WITH SOLIDSLEEVE\nPROPOSED HYDRANT & VALVE\nBHB No. 423\nFHB No. 443"
                },
                "tile_1_1": {
                    "text_blob": "6\"x6\"Ø TEE & THRUST BLOCK\n6\" PLUG\n6\"Ø G.V.\n8\"x6\" MJ PLUG\n8\"x12\"Ø REDUCER\n8\"Ø MJ GATE VALVE\nTHORNTON"
                },
                "tile_1_2": {
                    "text_blob": "T2\n1/2HIE\nNo. 449\nPROPOSED STANDARD HYDRANT ASSEMBLY\nROAD\nNOR"
                },
                "tile_1_3": {
                    "text_blob": "PROPOSED 12\" WM\nEXIST. GROUND ABOVE WM\n+2.513%"
                },
                "tile_2_0": {
                    "text_blob": "410\n400\n+3.7 VPI. 397.2\nEXIST. GROUND\nVC-800\nLVC-264"
                },
                "tile_2_1": {
                    "text_blob": "EXIST.\n6\" x 6\" M.J. TEE\n45º HORIZ. BEND\n45º HORIZ. BEND\nCONNECT INTO EXIST. 6\"\n6\" GATE VALVE\n8\" x 6\" REDUCER\n8\" x 8\" x 8\" M.J. CROSS\n8\" GATE VALVE\n12\" x 8\" REDUCER\nADJUST WATERMAIN TO MAINTAIN\n18\" SEPARATION FROM STM. SEWER\nSUITABLE ALIGNMENT WITH EXISTING\nVC-500\nLVC-176\n0.994%\n392.00"
                },
                "tile_2_2": {
                    "text_blob": "ANCHOR +3.79% 12'-6\" 8' 6\" G.V. \n #8 6 WM "
                },
                "tile_2_3": {
                    "text_blob": "VC-600\nVC-128\nVERT. DEF. THROUGH TWO JOINTS\n420\n410"
                },
                "tile_3_0": {
                    "text_blob": "CONTRACTOR TO BE RESPONSIBLE FOR LOCATION OF ALL EXISTING U/G & OVERHEAD UTILITIES. VARIOUS UTILITIES CONCERNED TO BE GIVEN REQUIRED ADVANCE NOTICE PRIOR TO ANY DIGGING, FOR STAKE OUT. THE REGION ASSUMES NO RESPONSIBILITY FOR THE ACCURACY OF THE LOCATION OF EXISTING UTILITIES AS INDICATED ON THIS DRAWING."
                },
                "tile_3_1": {
                    "text_blob": "PR. ST.S\n96.00\n45 + 00\n46 + 58\n46 + 98\n47 + 06\n47 + 22\n396.00\n396.20\n336.00\n336.80\n78 VPI. 404.00\n100' OF 6\" D.I. CL.2\n30' OF 8\" D.I.\n1 JULY/77 B.K.\n2 MAR/79 B.J.K.\nNO. DATE NAME"
                },
                "tile_3_2": {
                    "text_blob": "80 OF 12\" DUCTILE IRON, TYTON JOINT, CEMENT MORTAR LINED\nFROM STA. 42+58 TO STA. 45+98\nDRAWN S.T.P. DATE MAY 1976\nDESIGN B. KITZOV DATE JAN. 1977\nSCALE HORT: 1\"=40' VERT: 1\"=4'\nREVISIONS"
                },
                "tile_3_3": {
                    "text_blob": "THE REGIONAL MUNICIPALITY OF DURHAM\nDEPARTMENT OF WORKS\nWHITBY ONTARIO\nREGIONAL ROAD 52 THORNTON ROAD\nFROM ADELAIDE AVE. TO ROSSLAND RD.\nCONTRACT NO.\nD77-22\nDRAWING NO.\n0-77-W-127\nR.O.W. PLAN\nSHEET 25 OF 29\nSTD. NO. 52 LOT NO. 16 & 17 CON. 2 AREA MUN. OSHAWA\nTOP WM ELEV.\nWM DATA\nCLASS 2, BEDDING 'D'"
                }
            },
            "georeference": {
                "lat": 43.896971,
                "lon": -78.8959082,
                "conf": 0.9,
                "source": "google_intersection",
                "intersection": "Thornton Road North / Adelaide Ave",
                "approximate_address": "Thornton Rd N & Adelaide Ave W, Oshawa, ON L1J 6T3, Canada",
                "georeference_source": "google_intersection",
                "georeference_confidence": 0.9,
                "trust_score": 0.9,
                "fallback_used": false
            },
            "bounding_box": {
                "southwest": {
                    "lat": 43.520641,
                    "lng": -79.327997
                },
                "northeast": {
                    "lat": 44.5167599,
                    "lng": -78.324079
                }
            }
        },
        "error": null
    },
    {
        "record_id": "OSH-2052.pdf-p00",
        "geometry": {
            "type": "Point",
            "coordinates": [
                -78.8937555,
                43.8920241
            ]
        },
        "metadata": {
            "tiles": {
                "tile_0_0": {
                    "text_blob": "REFER TO DWG No. O-94-W-663\nEXIST. 75 m TO BE MAIN\nSTA. 9+150\nNO. 820\n1900 mm W. HEG. (LE) \n300 mm STM.\nCONC. S.W.\nH.W.\n15\n13.107\n9.605\nCNF. BOX\nT.S.\nC.T.V.\nPED. TRANS./U.G.\nTV\nH.L.P.\nW.S."
                },
                "tile_0_1": {
                    "text_blob": "LOT 17 CON. 2\nNO. 410\nNO. 416\nTRAFFIC CONDUIT 350 mm\n300 mm\n350 mm\n500 mm W.\n150 mm\n800 mm\n3x100 mm\n300 mm STM.\nPROP. 1200 mm WATERMAIN\nB. H.L.P. W. U.G.\nGR. DR.\nSLB. HEG.\nD.I.C.B.\nM.H.C.B. 37-4\nTV\nCONC. S.W."
                },
                "tile_0_2": {
                    "text_blob": "PROP.\nSTA. 9+400\nPROP.\nSTA. 9+377\nSTA. 9+400\n300\nSJB.\n375 mm STM.\n150 mm WM. P.V.C.\n100 mm TV\n3 x 50 mm\nTV\n100 mm TV\nCONC. S.W.\n100 mm TV\n2x50 mm TV\n2x100 mm\nSTA. 9+375\n75\nB.H.L.P.\nPROP. STM. MH.\nM.H.C.B. 37-5\nM.H.C.B.\nC.T.V.\nPED.\nU.G. 750 mm STM.\n750\nW.Y."
                },
                "tile_0_3": {
                    "text_blob": "2°35' COMB\n2°30' HOR. BEND\n9+372.573\n2°30'\n2°4'40\" HOR. BEND\n9+388.333\nREFER TO DWG No. O-94-W-665\nEX. WEST INV. ELEV. 120.578\nEX. NORTH INV. ELEV. 120.661"
                },
                "tile_1_0": {
                    "text_blob": "MATCH LINE\nCONTRACTOR TO BE RESPONSIBLE FOR LOCATION OF ALL EXISTING U/G & OVERHEAD UTILITIES. VARIOUS UTILITIES CONCERNED TO BE GIVEN REQUIRED ADVANCE NOTICE PRIOR TO ANY DIGGING, FOR STAKE OUT. THE REGION ASSUMES NO RESPONSIBILITY FOR THE ACCURACY OF THE LOCATION OF EXISTING UTILITIES AS INDICATED ON THIS DRAWING.\nNO. 399\nREGION A\n"
                },
                "tile_1_1": {
                    "text_blob": "300 \n180°09'00\"\n150 mm WM .C.I.\nC.B. 3/2 \n150 mm\nT.P.S. \n4 ST. G.M. \nCONC. S.W. \n+ STUMP\nW.V. \nBUR. CA. \n50 mm \nGR. \nDR. \n50 mm\n50 mm \nS.I.B. \nFd \nW.M. D.I.\nBH. 4 \nw. PIEZOMETER \nO 50 mm \nO 50 mm \nO 50 mm \nO 50 mm \nHORIZ. DEFL. 0°09' LEFT \nAT STA. 9+247.742 \nLOT 16 CON. 2 \nNO. 423 \nAL ROAD 52–THORNT"
                },
                "tile_1_2": {
                    "text_blob": "W.V. 150 mm WM C.I. 300  PROP. STM. MH. \nB  . PROP. STM. MH. No. 37-1A\nC.B.I.37-2  200 mm WM. D.I. \nw.v.\n⌀ 50 mm TV B. B.B. PED. \nBUR. C.A. C CONC. SW. \n⌀ 50 mm ⌀ 50 mm N.P. S ST. G.M. \nHYD. \n1200 mm W. B. PED. SLIB. B. \nCEDAR HEG. V. \nN.P.S. 4 ST. GM. 2PVCD2 ADVERT. \nSIGN\n200 mm SAN- ⌀ SAN. M.H.\n37-118 \nN.TRV BUR. CAPE-\nR.N.S. 2 PE. GM. STO \n6.50 m OF PROP. 750 mm CONC. CL. 65-D STM. SEWER AT 1.854%, REFER TO DETAIL 1\nAPPLE VALLEY LANE \nSTM.H. 37-2 ELEVATION \nON ROAD \nPROP. 750 mm STM. SEWER \n⌀ 200 mm STM. w.v. \nNo. 37-76 STA 10.578 MATCH LINE"
                },
                "tile_1_3": {
                    "text_blob": "PROP. EAST INV. ELEV. 120.360\n120.218\nPROP. 1200 mm WM.\nPROP. WEST INV. ELEV. 120.229\n120.125\nPROP. EAST INV. ELEV. 119.173 (EXISTING)\n119.471\nEX. 750 mm STM.\nEX. M.H.C.B. 37-1\nEX. EAST INV. ELEV. 119.594\nPROP. 750 mm STM. SEWER\nPROP. STM. MH. No. 37-1A\nDETAIL N.T.S.\nPROP. STORM SEWER REPLACEMENT STA. 9+366.00\nDIMENSIONS ARE BASED ON 1978 SOUTHERN ONTARIO ADJUSTMENTS\nMETRIC CONVERSION USED ON THIS DWG."
                },
                "tile_2_0": {
                    "text_blob": "REG. OF DURHAM BM 52 - ELEV 126.285\nRAILROAD SPIKE IN THE EAST FACE OF B.H.I.L.P. ON THE NORTH LIMIT OF APPLE VALLEY LANE, OPPOSITE.\nOSHAWA BM 8 - ELEV 122.965\nPLAQUE ON EAST FOUNDATION WALL AT THE NORTH LIMIT OF GARAGE DOOR HOUSE, NO. 44 TARN COURT, APPROXIMATELY 105 FT. NORTH OF TARN COURT/ROUNDLEA DRIVE\nEXIST. G ROAD PROFILE\n1.80 m MIN.\nBACK 300 mm STM.\n120.000\n117.500\n115.000"
                },
                "tile_2_1": {
                    "text_blob": "EXIST. C/L ROAD PROFILE\nEXIST. 300 mm STM.\nEXIST. 300 mm STM.\n120.000\n122.500\n117.500\n117.500\n115.000\n120.000\nHORIZ. DEFL. 009\nVERTICAL TRENCH CONSTRUC\nEXIST. 300 mm STM.\n(ST. 300 mm STM.)\n(ST. 300 mm STM.)\nCROSSING\nELEV. 118.057"
                },
                "tile_2_2": {
                    "text_blob": "REFER TO DETAIL 1\nEXIST. 300 mm STM.\nINV. ELEV. 120.345 AT CROSSING\n1.80 m MIN.\nPROP. HOR. BEND 22.5°\nVERT. DEF. 5.5°\nPROP. HOR. BEND 22.5°\nEXIST. 200 mm WM. C.V.C.\nTOP WM. ELEV. 120.77±\nEXIST. 750 mm STM.\nEAST. 200 mm WM. C.V.C.\nINV. ELEV. 119.958\nAT CROSSING\nPROP.\nVERT DEL 5.4°\n27.427 AT 3.5%\n34.8\nRESTRAINED PIPE JOINTS"
                },
                "tile_2_3": {
                    "text_blob": "PROP. 750 mm STM W. INV. EL. 120.229 120.125 EX. 750 mm STM SEWER AT 120.718 PROP. E. INV. EL. 119.475 (EXIST.) 119.471 EX. 750 mm STM TO BE REMOVED (SEE NOTES BELOW) EX. 375 mm STM INV. EL. 120.578 PROVIDE MINIMUM 300 mm CLEARANCE ABOVE PROP. 1200 mm WATERMAIN PROP. 750 mm STM INV. EL 120.359 120.218"
                },
                "tile_3_0": {
                    "text_blob": "116.00\n116.700\n119.480\n59.791\n59.000 m AT 3.06%\n9+130.412\n9+150\nSimcoe\nSIMCOE ENGINEERING GROUP LIMITED\nConsulting Engineers & Architect"
                },
                "tile_3_1": {
                    "text_blob": "UTILITIES VERIFIED\nCABLE T.V. 1993 09 03\nBELL CANADA 1993 05 25\nCONSUMERS GAS 1993 07 27\nOSHAWA P.U.C. 1993 05 19\nONTARIO HYDRO 1993 05 25\nSTORM SEWER 1991 03-11\nOSHAWA PUBLIC WORKS\n\nORIGINAL DRAWING\nSealed by:\nJ. A. MILLS, P. Eng.\nOn:\nAUGUST 11th, 1994\n\n1 951113 J.P. AS CONSTRUCTION\nNO. DATE NAME\n\n251.393 m (ACTUAL) OF PROP. 1200 mm CONCRETE PRESSURE PIPE, C-301 CLASS...\n9+203.792 9+240.000 9+250 9+300\n119.887 118.200 120.672 121.052 121.378 121.635"
                },
                "tile_3_2": {
                    "text_blob": "76.000 m AT 0.14%\nCLASS 12, WATERMAIN, CLASS 'B' BEDDING\n122.817\n122.041\n122.238\n122.407\n120.456\n119.100\n122.613\n122.897\n120.000\n9+306.328\n9+350\n9+368.00\n9+372.573\n9+390.173\nDRAWN P. IMESON / B. LISCUMB DATE 1994.04.18\nDESIGN B. KRAMER DATE 1994.04.18\nCHECKED B. KRAMER DATE 1994.06.09\nAPPROVED J.A. MILLS DATE 1994.06.24\nSURVEY DATA DATE 91-03 TO 91-11"
                },
                "tile_3_3": {
                    "text_blob": "PROP. STORM SEWER REPLACEMENT\nSECTION PROFILE A-A\nN.T.S.\nEXIST: 6.50 m LENGTH OF 750 mm STM. SEWER TO BE REMOVED WITH EXCAVATED MATERIAL TO BE REMOVED FROM SITE.\nEXCAVATED TRENCH DEPTH BELOW PROP. 750 mm STM. SEWER AND FULL DEPTH ABOVE SHALL BE BACKFILLED WITH NON SHRINK BACKFILL.\nTOP OF WATERMAIN ELEVATION\nGROUND ELEVATION ABOVE WATERMAIN\nC.L. R.O.W.\nCHAINAGE\nNOTE: ALL DIMENSIONS ARE IN METRES UNLESS OTHERWISE NOTED.\nAUGUST 10, 1994 41618013\nREGIONAL MUNICIPALITY OF DURHAM\nWORKS DEPARTMENT\nONTARIO\nCONTRACT NO. D94-20\nREGIONAL ROAD 52 - THORNTON RD. N.\n25 m N. OF TARN CT. TO 25 m N. OF APPLE VALLEY LN.\nLOT NO. 16/17 CON. 2 TWP. AREA OSHAWA MUN.\nDRAWING NO. O-94-W-664 2052\nSHEET 6 OF 19\nFILE NO. 416.18-A1-4247"
                }
            },
            "georeference": {
                "lat": 43.8920241,
                "lon": -78.8937555,
                "conf": 0.9,
                "source": "google_intersection",
                "intersection": [
                    {
                        "name": "Regional Road 52 (Thornton Road) and Apple Valley Lane",
                        "location_details": "from 350 m N of Taunton Rd. to 270 m N of Apple Valley Lane"
                    }
                ],
                "approximate_address": "52 Thornton Rd N, Oshawa, ON L1J 2L5, Canada",
                "georeference_source": "google_intersection",
                "georeference_confidence": 0.9,
                "trust_score": 0.9,
                "fallback_used": false
            },
            "bounding_box": {
                "southwest": {
                    "lat": 43.520641,
                    "lng": -79.327997
                },
                "northeast": {
                    "lat": 44.5167599,
                    "lng": -78.324079
                }
            }
        },
        "error": null
    }
];

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
      const form = new FormData();
      form.append("region", regionName);
      form.append("bbox", JSON.stringify(boundingBox));
      Array.from(files).forEach((file) => form.append("files", file));
  
      console.log("form: ", form)
        
        toast({
          title: "Upload successful",
          description: `${files.length} asset records have been uploaded.`,
        })
        
        try {
          // TODO: BRING BACK WHEN API IS WORKING AGAIN
          // const response = await fetch("https://infra-mvp-api-195923635623.northamerica-northeast2.run.app/process", {
          //   method: "POST",
          //   body: form,
          // });
                    
          // console.log("Response:", response);
          // TODO: BRING BACK WHEN API IS WORKING AGAIN
          // const contentType = response.headers.get("content-type");
          
          // TODO: BRING BACK WHEN API IS WORKING AGAIN
          // console.log("response: ", response.body);

          // TODO: BRING BACK WHEN API IS WORKING AGAIN
          // if (contentType?.includes("application/json")) {
          // TODO: BRING BACK WHEN API IS WORKING AGAIN
            // const data = await response.json();


            const data = stubbedData;
            console.log("✅ JSON Response:", data);
            console.log(data);
            recordsToAdd = data;






            // TODO: BRING BACK WHEN API IS WORKING AGAIN
            // recordsToAdd = [data[0].metadata];
            

            // setResponseData(recordsToAdd);
            // data.map((record: any) => {
              //   recordsToAdd = [...recordsToAdd, ...record];
              //   setResponseData(recordsToAdd);
              //   console.log("Record IN UPLOAD FORM:", record);
              // })
              // setRecords((prev: any) => [...prev, ...record])
              // setResponseData((prev: any) => [...prev, ...record]);
              // for (const record of data) {
                // if (!validateRecord(record.metadata)) {
                  //   console.warn("Invalid record:", record);
                  //   continue; // Skip invalid records
                  // }
                  // }
                  // for (const record of)
                  
          // TODO: BRING BACK WHEN API IS WORKING AGAIN
          //       } else {
          //         const text = await response.text();
          //         console.warn("📄 Text Response:", text);
          //         setError("Received non-JSON response from server");
          // }
        } catch (err: any) {
          console.error("🚨 Fetch error:", err);
          setError(err.message || "Unknown error");
        } finally {
          setRecords(recordsToAdd)
          console.log("Records to add:", records)
          setLoading(false);
        }
        setResponseData(recordsToAdd);
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
