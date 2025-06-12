// Define types for our data based on the API response
export interface GeoreferenceResult {
  record_id: string
  geometry: {
    type?: string
    geometry?: any
    properties?: {
      georeference_confidence?: number
      georeference_source?: string
      plan_number?: string
      intersection?: string | Array<{ street_1: string; street_2: string }>
      city_hint?: string
      [key: string]: any
    }
  }
  metadata: {
    tiles?: {
      [key: string]: {
        text_blob: string
      }
    }
    georeference?: {
      plan_number?: string
      intersection?: string | Array<{ street_1: string; street_2: string }>
      UTM_coordinates?: Array<{ side: string; coordinates: number[] }>
      stationing?: {
        start: string
        end: string
      }
      city_hint?: string
      fallback_used?: boolean
      georeference_confidence?: number
      georeference_source?: string
      trust_score?: number
      [key: string]: any
    }
    bounding_box?: {
      southwest: {
        lat: number
        lng: number
      }
      northeast: {
        lat: number
        lng: number
      }
    }
    [key: string]: any
  }
  error: string | null
}

// Keys for localStorage
const RESULTS_STORAGE_KEY = "utilitx-processed-results"
const REGION_STORAGE_KEY = "utilitx-region-data"

// Save processed results to localStorage
export function saveProcessedResults(results: GeoreferenceResult[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify(results))
  }
}

// Get processed results from localStorage
export function getProcessedResults(): GeoreferenceResult[] {
  if (typeof window !== "undefined") {
    const storedResults = localStorage.getItem(RESULTS_STORAGE_KEY)
    if (storedResults) {
      return JSON.parse(storedResults)
    }
  }
  return []
}

// Save region data to localStorage
export function saveRegionData(regionName: string, boundingBox: any): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(REGION_STORAGE_KEY, JSON.stringify({ regionName, boundingBox }))
  }
}

// Get region data from localStorage
export function getRegionData(): { regionName: string; boundingBox: any } | null {
  if (typeof window !== "undefined") {
    const storedRegion = localStorage.getItem(REGION_STORAGE_KEY)
    if (storedRegion) {
      return JSON.parse(storedRegion)
    }
  }
  return null
}

// Clear all stored data
export function clearStoredData(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(RESULTS_STORAGE_KEY)
    localStorage.removeItem(REGION_STORAGE_KEY)
  }
}

// Helper function to format intersection data
export function formatIntersection(
  intersection: string | Array<{ street_1: string; street_2: string }> | undefined,
): string {
  if (!intersection) return "N/A"

  if (typeof intersection === "string") {
    return intersection
  }

  if (Array.isArray(intersection)) {
    return intersection.map((i) => `${i.street_1} & ${i.street_2}`).join(", ")
  }

  return "N/A"
}

// Helper function to get confidence level text
export function getConfidenceLevel(score: number | undefined): string {
  if (score === undefined) return "Unknown"

  if (score >= 0.8) return "High"
  if (score >= 0.5) return "Medium"
  if (score >= 0.1) return "Low"
  return "Very Low"
}

// Helper function to get confidence level color
export function getConfidenceColor(score: number | undefined): string {
  if (score === undefined) return "gray"

  if (score >= 0.8) return "green"
  if (score >= 0.5) return "yellow"
  if (score >= 0.1) return "orange"
  return "red"
}
