// Update the processBatch function to handle the API response format

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "/api"

export async function processBatch(region: string, files: File[]): Promise<any[]> {
  // For demo purposes, return mock data instead of making an actual API call
  return Array(files.length)
    .fill(0)
    .map((_, index) => ({
      id: `record-${index + 1}`,
      record_id: `drawing-${index + 1}`,
      metadata: {
        tiles: {
          tile_0_0: {
            text_blob:
              index % 3 === 0
                ? "STORM SEWER PLAN SIMCOE ST / BEATRICE ST INTERSECTION"
                : index % 3 === 1
                  ? "WATER MAIN INSTALLATION ROSSLAND RD / SIMCOE ST"
                  : "PAVEMENT WIDENING GARDEN ST / MANNING RD",
          },
        },
        georeference: {
          lat: 43.9261343 + index * 0.01,
          lon: -78.8759465 - index * 0.01,
          intersection:
            index % 3 === 0
              ? "Simcoe St / Beatrice St"
              : index % 3 === 1
                ? "Rossland Rd / Simcoe St"
                : "Garden St / Manning Rd",
          address:
            index % 3 === 0
              ? "Simcoe St N & Beatrice St W, Oshawa, ON L1G 4X1, Canada"
              : index % 3 === 1
                ? "Rossland Rd E & Simcoe St N, Oshawa, ON L1G 4V5, Canada"
                : "Garden St & Manning Rd, Whitby, ON L1N 6V7, Canada",
          trust_score: 0.7 + (index % 3) * 0.1,
          georeference_source: "google_intersection",
          georeference_confidence: 0.7 + (index % 3) * 0.1,
        },
        bounding_box: {
          southwest: {
            lat: 43.520641 + index * 0.01,
            lng: -79.327997 - index * 0.01,
          },
          northeast: {
            lat: 44.5167599 + index * 0.01,
            lng: -78.324079 - index * 0.01,
          },
        },
      },
      error: null,
    }))
}

export async function downloadBatch(region: string, files: File[]): Promise<Blob> {
  // For demo purposes, create a mock JSON blob
  const mockData = await processBatch(region, files)
  return new Blob([JSON.stringify(mockData, null, 2)], { type: "application/json" })
}
