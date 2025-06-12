// Global variable to track loading state
let isLoading = false
let isLoaded = false
let loadPromise: Promise<void> | null = null
let loadError: Error | null = null

// Mock Google Maps for server-side rendering
const mockGoogleMaps = {
  maps: {
    Map: class {},
    Marker: class {},
    InfoWindow: class {},
    LatLngBounds: class {},
    Geocoder: class {},
    Rectangle: class {},
  },
}

// Function to load Google Maps API
export function loadGoogleMapsApi(): Promise<void> {
  // If we're not in a browser environment, return a resolved promise
  if (typeof window === "undefined") {
    return Promise.resolve()
  }

  // If already loaded, return resolved promise
  if (isLoaded && window.google && window.google.maps) {
    return Promise.resolve()
  }

  // If there was an error loading, return rejected promise
  if (loadError) {
    return Promise.reject(loadError)
  }

  // If currently loading, return the existing promise
  if (isLoading && loadPromise) {
    return loadPromise
  }

  // Start loading
  isLoading = true

  loadPromise = new Promise<void>((resolve, reject) => {
    try {
      // Create script element
      const script = document.createElement("script")
      // Use a dummy API key for now - replace with your actual key
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBjTtkWH2LoiMVdjNZkgDPSa9gFKxpadpw&libraries=places`
      script.async = true
      script.defer = true

      // Set up callbacks
      script.onload = () => {
        isLoaded = true
        isLoading = false
        loadError = null
        resolve()
      }

      script.onerror = (e) => {
        isLoading = false
        loadError = new Error("Failed to load Google Maps API")
        reject(loadError)
      }

      // Add to document
      document.head.appendChild(script)
    } catch (error) {
      isLoading = false
      loadError = error as Error
      reject(error)
    }
  })

  return loadPromise
}

// Function to check if Google Maps is loaded
export function isGoogleMapsLoaded(): boolean {
  if (typeof window === "undefined") {
    return false
  }
  return isLoaded && !!window.google && !!window.google.maps
}

// Function to get Google Maps - returns mock for server, real for client
export function getGoogleMaps() {
  if (typeof window === "undefined") {
    return mockGoogleMaps
  }

  if (window.google && window.google.maps) {
    return window.google
  }

  return mockGoogleMaps
}
