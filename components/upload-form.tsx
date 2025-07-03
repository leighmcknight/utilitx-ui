"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeographicRegion } from "@/components/geographic-region";
import { ResultsView } from "@/components/results-view";
import ProgressBar from "@/components/progress-bar";

import { FileUploader } from "./file-uploader";
import { JsonEditor } from "./json-editor";
// import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation";
import { Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UploadedWithOption, useAppStore, type AssetRecord } from "@/lib/store";

let stubbedResponseBody = [
	{
		record_id: "06-W-40_1R 1.pdf-p00",
		geometry: {
			type: "Point",
			coordinates: [-79.976567, 43.2087019],
		},
		metadata: {
			tiles: {
				tile_0_0: {
					text_blob:
						"WOODWORTH DRIVE\n\nBRASS SERVICE TEE SUCCESSOR\nEMCO / CAMBRIDGE BRASS\nOR MUELLER H12941 110\nCOMPRESSION ALL AROUND\nDETAIL 'A'\n\n150mm W/M\n150\n50mm Ø MAIN STOP, CAMBRIDGE\nSERIES 100 (OR APPROVED)\nINLET: AWWA (TAPER)\nOUTLET: I.P. MALE\nUSE WITH\nTHRU\nGROU\nDETAIL 'B'",
				},
				tile_0_1: {
					text_blob:
						"TAPPING PLUG\nTAPPING SADDLE\nDOUBLE STRAP SADDLE\nSTAINLESS STEEL BALES\nPER OPSD 1104.020\nWOODWORK",
				},
				tile_0_2: {
					text_blob:
						"FOR PROPOSED WORKS ON CALVIN STREET SEE DRAWING NO. 08-W-41\nCALVIN STREET\n20.11m\n6.76m\n30D FORCEMAIN\n250 SEWER\nIWM (to be Abandoned)\n200 W/M\n175 SAA\n100\n159\n200 W/M\n100",
				},
				tile_0_3: {
					text_blob:
						"FILE No.\nCONTRACT No. PW-06-39 (W)\nDRAWING No. 06-W-40\nSHEET No.\n1 OF 1\nDIMENSIONS SHOWN ON THIS PLAN ARE IN MILLIMETRES UNLESS OTHERWISE NOTED\nAMBERLY BLVD\nDR\nCALVIN ST\nRD\nDR\nMAPLE-DENE\nENMORE AVE\nROBINA\nWOODWORTH\nHATTON DR\nWOODWORTH\nWOODWORTH\nFIDDLER'S GREEN RD\nBLOOMSBURY CT\nHIGHWAY NO. 403\n20.05m\nROAD ALLOWANCE\n5.58m\n7.43m\n7.05m",
				},
				tile_1_0: {
					text_blob:
						"EX 150 WM\nPROP 45° BEND & AB, RWS-409\nMIN 300\nMIN 300\nMIN 150\nWM 1.0 m\nPROP 45° BEND & AB, RWS-400\nNO INTERMEDIATE JOINTS\nWATERMAIN LOWERING DETAIL\nSCALE NTS\nNOTE:\nCONTRACTOR TO CONTACT CITY OF HAMILTON FORESTRY DEPARTMENT TO AVOID TREE DAMAGE DURING WATER SERVICE CONSTRUCTION\n245",
				},
				tile_1_1: {
					text_blob:
						'COPPER TYPE "K" SOFT WATERMAIN\nREMOVE & SALVAGE EX HYD AND REMOVE SECV\nREFER TO DETAIL "A" (TYPICAL) WATER SERVICE CONNECTIONS TO 50mm WATERMAIN\nREFER TO CONNECTION DETAIL "B"\n150 GV & VB RWS-308\n373 WS OFF WOODWORTH DRIVE\n381\n387\n379\n350\n300 CSP\n375 CSP\n500\nSEWER\nGASMAIN\nFENCE',
				},
				tile_1_2: {
					text_blob:
						"FOR PROPOSED WORKS ON CALVIN STREET SEE DRAWING NO. 06-W-41\nRWS-RWS-400\nPLUG\n200 TO 150 REDUCER\n200x200x200 TEE & AB, RWS-400 WITH SLEEVES\n50 COPPER WATER SERVICE TAPPED IN PROPOSED 150 W/M\n112.5° BEND & AB. RWS-400 WITH SHORT PIECE OF PIPE & SLEEVE\n20.11m\n6.10m\nSMH '121'\n150\n3600 FORCEMAIN\n25 SEWER (To Be Abandoned)\n50 PVC\nGAS MAIN\n200 SEWER\nRWS\nVC\n150 W/M\n150 W/M (Abandoned)\n20.00m\n6.55m\n50 COPPER TYPE 'K' SOFT WATERMAIN\nG\n650\n25\n200\n359\nNOTE : EX\n355",
				},
				tile_1_3: {
					text_blob:
						"80mm HL-8\n150mm GRAN. 'A'\nNATIVE BACKFILL\n1.6m MIN.\nEX 150 WATERMAIN\n(To Be Abandoned)\nPROP 150 WATERMAIN\nEX PAVEMENT\nEX 25 IP GASMAIN\nEX 200 SEWER\n7.97m (VARIES)\nEAST PROPERTY LINE\nROADWAY CROSS-SECTION\nSECTION 'A-A'\nSCALE 1:100\nSEWER REPAIRS and OVERFLOWS\nEXISTING SEWER MANHOLES\nTYP. TRENCH RESTORATION",
				},
				tile_2_0: {
					text_blob: "240\n235\nPROPOSED SANITARY SEWER",
				},
				tile_2_1: {
					text_blob:
						"750mm Asphalt or 100mm Granular\nSandy Silt, organic inclusions, brownish-gray to gray, moist\nBorehole Terminated at 3.2m and dry\n250 CSP (SE)\n250 CSP (SM)\nSMH 100\n200 SEWER @ -0.49%\nC ROAD PROFILE\nC OF DITCH (East Side of Road)\nC OF DITCH (West Side of Road)\n500 CSP (E)\n500 CSP (W)\n500 CSP (E)",
				},
				tile_2_2: {
					text_blob:
						"500 CSP(PW)\n450 CSP ROAD CROSSING\n100 SMH\nC. OF CALVIN STREET\n300 CSP ROAD CROSSING\n240\n235\n200 SEWER\n",
				},
				tile_2_3: {
					text_blob:
						"SMH '13'\nN-INV=235.776\n'AL12A013'\nCHAINAGE=0+005.224\nTOP OF GRATE=239.54\n\nSMH '12'\nN-INV=235.578\nS-INV=235.337\nW-INV=235.997\nE-INV=235.145\n'AL12A013'\nCHAINAGE=0+097.172\nTOP OF GRATE=239.00\n\nC.B. REMOVALS/REPLACEMENTS\n\nPROPOSED SANITARY SEWER",
				},
				tile_3_0: {
					text_blob:
						"PROPOSED STORM SEWER\nEXISTING C OF ROAD PROFILE ELEVATIONS\nEXISTING C OF ROAD ALLOWANCE CHAINAGE\nNo. REVISIONS INITIAL DATE DRAWN BY: \n1 WATERMAIN CONNECTION DETAILS C.J.C 10/07/06 REFERENCE\nSurveyed By:\nSewer Plans:\nWater Plans:\nGeodetic Ben\nBorehole Rep\n...\\06-W-40_1.dgn 11/07/2006 02:35:46 PM",
				},
				tile_3_1: {
					text_blob:
						"DATE: JUNE 12, 2006\nMATERIAL:\nJ. HOUGH\n75-s-592, 617, 96-W-7_3\nANC M-14\nBench Mark Index No. 7720020079\nElevation=249.749m\nSCALES\n0 5m 10m 20m\nHORIZONTAL 1:500\n0 1m 2m 4m\nVERTICAL 1:100\nURBEX ENGINEERING LIMITED\n161 Rebecca Street\nHamilton, Ontario, L8R 1B9\nPhone - 905-522-3328\nFax - 905-522-0452\nE-Mail - info@urbex.biz",
				},
				tile_3_2: {
					text_blob:
						"238.99\n239.12\n239.34\n239.49\n0+090.0\n0+105.0\n0+120.0\n0+128.5\nREGISTERED PROFESSIONAL ENGINEER\nCORY GIACINTI\nPROVINCE OF ONTARIO\nManager of Construction\nJerry Parisotto, P. Eng.\nManager of Design\nGary Moore, P. Eng.\nCITY OF HAMILTON\nPublic Works Department",
				},
				tile_3_3: {
					text_blob:
						"PROPOSED STORM SEWER\nEXISTING C/L OF ROAD\nPROFILE ELEVATIONS\nEXISTING C/L OF ROAD\nALLOWANCE CHAINAGE\nWOODWORTH DRIVE\n150mm Replacement Watermain\nFrom : Calvin St\nTo : end",
				},
			},
			georeference: {
				lat: 43.2087019,
				lon: -79.976567,
				conf: 0.9,
				source: "google_intersection",
				intersection: "Woodworth Drive / Calvin Street",
				approximate_address:
					"Woodworth Dr & Calvin St, Hamilton, ON L9G 2G8, Canada",
				georeference_source: "google_intersection",
				georeference_confidence: 0.9,
				trust_score: 0.9,
				fallback_used: false,
			},
			bounding_box: {
				southwest: {
					lat: 43.0505639,
					lng: -80.24870709999999,
				},
				northeast: {
					lat: 43.4710569,
					lng: -79.6175911,
				},
			},
		},
		error: null,
	},
	{
		record_id: "14-H-09_05.pdf-p00",
		geometry: {
			type: "Point",
			coordinates: [-79.8839344, 43.2358944],
		},
		metadata: {
			tiles: {
				tile_0_0: {
					text_blob:
						"WEST 5TH STREET\n\nWEST SIDE\nCONC CURB AND GUTTER (OPSD 600.040)\n\nEAST SIDE\nCONC CURB AND GUTTER (OPSD 600.080)\n1.8m IND WALK (RD-103)",
				},
				tile_0_1: {
					text_blob:
						"WEST 5TH\n0.5m ROUNDING\n2.0m IND WALK (RD-\n0.3m OFFSET FROM GUI\nVARIABLE WIDTH CON\nADJACENT TO GUID\nTOE OF SLOPE\n550\n30 POST\nTOE OF SLOPE",
				},
				tile_0_2: {
					text_blob:
						"STREET\nRAILING\n(FDOT INDEX 103)\nAND GUIDERAIL\nPACIFIC BLVD\nAND GUIDERAIL",
				},
				tile_0_3: {
					text_blob:
						"FILE No.\nCONTRACT No. C15-31-14 (HW)\nSHEET No.\n5 OF 8\nDRAWING No. 14-H-09\nDIMENSIONS SHOWN ON THIS PLAN ARE IN MILLIMETRES UNLESS OTHERWISE NOTED\nBEMAX CT\nGO\nATWATER CR\nALGOMA CR\nNEEFI ST\nMOHAWK ED E\nATHENS ST\nLAURIER AV\nDELAMORDR\nCOLLEER\nWEST 5TH ST\nWEST 3RD ST\nWEST 2nd ST\nWEST 1ST ST\nALGONQUIN AV\nMOHAWK RD\nFENNELL AV\nWEST 4TH ST\nBRIENSONS RD\nWEST 5TH ST\nINGIBISS AV\nBENRIDIC AVE\nBRENTWOOD AVE\nBARKER AV\nTANNER ST\nDUFF ST\n",
				},
				tile_1_0: {
					text_blob:
						"140.mR OF\n300 STN V OF\nSMH '020'\n300 WM TO E\n9.0mR E/P\nMHIP\nSYB\nMATCH LINE\n(WEST SIDE)\n27.0m\n3.3m",
				},
				tile_1_1: {
					text_blob:
						"50 STM\nWEST SIDE\nON-RAMP\nSEWER\nABANDONED)\nTSP\n15m LANDING\nPAD 2.3m WIDE\n300 STM SEWER\n300 STM \n50 \n70\nCB\n(n) TSP\n5.\n9.14m\n50\n50\n50\nIP\nGASMAIN\n(SMH)\nSP\n130\n=BL\n137\nWB\n300 \nFENCE\n8.3mR E/P\nIND WALK (RD-103)\nGASMAIN\nFENCE\nCB\nIP\nSB\n\n15m LANDING\nPAD 2.3m WIDE\nSTM SEWER\nCB\nCB\nCB\n15m LANDING\nPAD 2.3m WIDE\nSTM SEWER\nCB\nCB\nCHP\n8.3mR E/P\nSTMSMHB\nGATEVIEW DRIVE\n9.14m\nGASMAIN\n50\n50\nVB\n8.3mR E/P\n\nVB\nGASMAIN\nFENCE\n8.3mR E/P\n50 IND WALK (RD-103)\n8.3mR E/P\n9.14m\nGATEVIEW DRIVE\n50 300\nFENCE\n15m LANDING\nPAD 2.3m WIDE\nSTMSMHB\n8.3mR E/P\nABANDONED)\n50\n8.3mR E/P\n\n137\n\n137\n\n130\n137\n50\n8.3mR E/P\n1.8m IND WALK (RD-103)\n\n\n37",
				},
				tile_1_2: {
					text_blob: "375 STM SEWER\nSTM SEWER\nOHP\nSILT\nOCHP",
				},
				tile_1_3: {
					text_blob:
						"SEE 14-W-11\nFOR WATERMAIN CONSTRUCTION\n\nSEE 14-H-09 SHEETS 3\nFOR TYPICAL SECTIONS AND DETAILS\n\nSEE 14-H-09 SHEETS E1 TO E5\nFOR ELECTRICAL",
				},
				tile_2_0: {
					text_blob: "205\n200\n195\nSM-202",
				},
				tile_2_1: {
					text_blob: "Q OF GATEVIEW DRIVE\nSMI-0227",
				},
				tile_2_2: {
					text_blob: "205\n200\n195",
				},
				tile_2_3: {
					text_blob:
						"C.B. REMOVALS/REPLACEMENTS\n\n8+33.0 east,\nREMOVE & REPLACE CATCH BASIN\n(OPSD 705.010) & 250 CB LEAD,\nFRAME & COVER OPSD 400.082\n\n8+43.5 east, 8+51.8 east, 8+59.3 west,\nREMOVE & REPLACE CATCH BASIN\n(OPSD 705.010) & 250 CB LEAD,\nFRAME & COVER OPSD 400.100\n\nEXISTING SEWER MANHOLES\n\nSMH '020'\nHG12E020\nCHAINAGE=8+36.2\nN-INV=190.683\nTOP OF GRATE=193.574\n\nSMH'027'\nHG12E027\nW-INV=189.920\nCHAINAGE=8+46.7\nE-INV=189.920\nTOP OF GRATE=193.511",
				},
				tile_3_0: {
					text_blob:
						"14-H-09 (5)\n\nEXISTING C OF ROAD\nPROFILE ELEVATIONS\n\nEXISTING C OF ROAD\nALLOWANCE CHAINAGE\n\nNo. REVISIONS INITIAL DATE DRAWN BY: MM\n\nREFERENCE MATERIAL\nSurveyed By :\nSewer Plans :\n68-S-58, LSP.\nWater Plans :\nRoad Plan :\n\nGeodetic Bench\nBorehole Report\n\n8+30 193.64\n8+45 193.57\n\n750 SEL @ 4.89",
				},
				tile_3_1: {
					text_blob:
						"DATE: APRIL 24, 2014\nB. Martin\nW-295_S, W-338_S1, W-220-S1AB, W-348_S, W-198,\n2847\n2-H-14_2&3, 83-H-20_2, 89-H-63\nElevation=195.213m\nMark Index No. 11-03 - GTR-1610\nSCALES\n0 5m 10m 20m\nHORIZONTAL 1:500\n0 1m 2m 4m\nVERTICAL 1:100\n",
				},
				tile_3_2: {
					text_blob:
						"Senior Project Manager (Design) \nChris McCafferty \nManager of Design \nSusan Jacob, P. Eng. \nCITY OF HAMILTON \nPublic Works Department",
				},
				tile_3_3: {
					text_blob:
						"EXISTING C OF ROAD PROFILE ELEVATIONS\nEXISTING C OF ROAD ALLOWANCE CHAINAGE\nWEST 5TH STREET\nRoad and Sidewalk Reconstruction\nFrom: Wembley Road\nTo: Gateview Drive",
				},
			},
			georeference: {
				lat: 43.2358944,
				lon: -79.8839344,
				conf: 0.9,
				source: "google_intersection",
				intersection: "West 5th Street and Wembley Road",
				approximate_address:
					"Wembley Rd & West 5th Street, Hamilton, ON L9C 3P3, Canada",
				georeference_source: "google_intersection",
				georeference_confidence: 0.9,
				trust_score: 0.9,
				fallback_used: false,
			},
			bounding_box: {
				southwest: {
					lat: 43.0505639,
					lng: -80.24870709999999,
				},
				northeast: {
					lat: 43.4710569,
					lng: -79.6175911,
				},
			},
		},
		error: null,
	},
];

export function UploadForm() {
	const [files, setFiles] = useState<UploadedWithOption[]>([]);
	const [jsonData, setJsonData] = useState("");
	const [isUploading, setIsUploading] = useState(false);
	const [activeTab, setActiveTab] = useState("file");
	const [validationError, setValidationError] = useState<string | null>(null);
	const router = useRouter();
	// const { toast } = useToast()
	const { addRecords, setRecords } = useAppStore();
	// const { records } = useAppStore()

	const [results, setResults] = useState<any[]>([]);
	const [regionName, setRegionName] = useState("");
	const [boundingBox, setBoundingBox] = useState("");
	const [selectedOption, setSelectedOption] = useState<
		Record<number, string>
	>({});

	const [bboxTouched, setBboxTouched] = useState(false);

	const [activeMarkers, setActiveMarkers] = useState<any[]>([]);
	const mapRef = useRef<HTMLDivElement | null>(null);

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [responseData, setResponseData] = useState<any>(null);

	const isSubmitDisabled = () => {
		if (isUploading) return true;
		if (!regionName.trim()) return true;
		if (
			!boundingBox ||
			typeof boundingBox !== "object" ||
			Object.keys(boundingBox).length === 0
		)
			return true;
		if (activeTab === "file" && files.length === 0) return true;
		if (activeTab === "json" && !jsonData.trim()) return true;
		return false;
	};

	const handleRegionSelected = (name: string, bbox: any) => {
		setRegionName(name);
		setBoundingBox(bbox);
		setBboxTouched(true);
		setValidationError(null);
	};

	const handleGCPResponseToArcGIS = async (response: any) => {
		const gisJSON = response.map((data: any) => {
			const tiles = data.metadata?.tiles || "";
			const allTextBlobs = Object.values(tiles)
				.map((tile: any) => tile.text_blob)
				.join(",");

			return {
				geometry: {
					spatialReference: {
						wkid: "1234",
					},
					x: data.metadata.georeference.lon,
					y: data.metadata.georeference.lat,
				},
				attributes: {
					Latitude: data.metadata.georeference.lat,
					Longitude: data.metadata.georeference.lon,
					Confidence:
						data.metadata.georeference.georeference_confidence,
					Source: data.metadata.georeference.source,
					Intersection: Array.isArray(
						data.metadata.georeference.intersection
					)
						? data.metadata.georeference.intersection.join(" and ")
						: data.metadata.georeference.intersection,
					TrustScore: data.metadata.georeference.trust_score,
					FallBackUsed: data.metadata.georeference.fallback_used,
					ApproximateAddress:
						data.metadata.georeference.approximate_address,
					GeorefSource:
						data.metadata.georeference.georeference_source,
					TextBlob: allTextBlobs,
					DrawingURL: "test",
					Category: "test",
				},
			};
		});

		console.log("gisJSON: ", gisJSON);
		console.log("gisJSON: ", JSON.stringify(gisJSON));

		const GISCall = await fetch(
			"https://services7.arcgis.com/85E8yrjEGbCKVQjw/ArcGIS/rest/services/utilitx_test/FeatureServer/0/applyEdits",
			{
				method: "POST",
				body: gisJSON,
			}
		);

		console.log("GISCall: ", GISCall);
	};

	const handleFilesSelected = (selectedFiles: UploadedWithOption[]) => {
		setFiles(selectedFiles);
	};

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
		const result = results.find((r) => r.id === resultId);
		if (result && mapRef.current) {
			// Scroll to the map
			mapRef.current.scrollIntoView({ behavior: "smooth" });
		}
	};

	const getFilePreviewData = (file: File): Promise<string> => {
		return new Promise((resolve) => {
			const reader = new FileReader();
			reader.onload = (e) => {
				resolve(e.target?.result as string);
			};
			reader.readAsDataURL(file); // for base64 image/pdf
		});
	};

	const handleSubmitReal = async () => {
		sessionStorage.clear();
		// setIsUploading(true);
		setValidationError(null);
		// setLoading(true);
		setError(null);
		setResponseData(null);
		document.body.style.overflow = "hidden";

		if (!regionName.trim()) {
			setValidationError("Region name is required.");
			return;
		}
		if (
			!boundingBox ||
			typeof boundingBox !== "object" ||
			Object.keys(boundingBox).length === 0
		) {
			setValidationError("Bounding box is required.");
			return;
		}
		if (activeTab === "file" && files.length === 0) {
			setValidationError("Please upload at least one file.");
			return;
		}
		if (activeTab === "json" && !jsonData.trim()) {
			setValidationError("Please provide JSON data.");
			return;
		}

		let recordsToAdd: AssetRecord[] = [];

		const form = new FormData();
		form.append("region", regionName);
		form.append("bbox", JSON.stringify(boundingBox));
		Array.from(files).forEach((file) => form.append("files", file.file));

		// When storing files
		const filesWithPreview = await Promise.all(
			files.map(async (f) => ({
				name: f.file.name,
				previewUrl: await getFilePreviewData(f.file),
				option: f.option,
			}))
		);

		sessionStorage.setItem("files", JSON.stringify(filesWithPreview));

		// handleGCPResponseToArcGIS(stubbedResponseBody);
		try {
			setLoading(true);
			const response = await fetch(
				"https://infra-mvp-api-195923635623.northamerica-northeast2.run.app/process",
				{
					method: "POST",
					body: form,
				}
			);

			const contentType = response.headers.get("content-type");

			if (
				response.status === 200 &&
				contentType?.includes("application/json")
			) {
				const data = await response.json();
				handleGCPResponseToArcGIS(data);
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
					<GeographicRegion
						onRegionSelected={handleRegionSelected}
						markers={activeMarkers}
						onRegionNameChange={(name) => setRegionName(name)}
					/>

					<ResultsView
						results={results}
						onViewOnMap={handleViewOnMap}
					/>
				</CardHeader>
				<CardHeader>
					<div className="flex items-center mb-4">
						<div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-200 text-white mr-2">
							<span className="text-sm font-bold">2</span>
						</div>
						<CardTitle>Batch Upload Records</CardTitle>
					</div>
					<CardDescription>
						Upload your infrastructure asset records in bulk using a
						file or JSON data
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div
						onMouseEnter={() => {
							if (regionName && !bboxTouched) {
								setValidationError(
									"You must click 'Get Bounding Box' after entering your region"
								);
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
							<AlertDescription>
								{validationError}
							</AlertDescription>
						</Alert>
					)}
				</CardContent>
				<div
					onMouseEnter={() => {
						const hasMissingOption = files.some(
							(file) => !file.option
						);
						if (hasMissingOption) {
							setValidationError(
								"You must select the file type from the dropdown before uploading files."
							);
						} else {
							setValidationError(null);
						}
					}}>
					<CardFooter>
						<Button
							className="w-full"
							onClick={handleSubmitReal}
							disabled={isSubmitDisabled()}>
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
	);
}
