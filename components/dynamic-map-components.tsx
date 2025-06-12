import dynamic from "next/dynamic"

// Dynamically import map components with SSR disabled
export const DynamicBoundingBoxMap = dynamic(() => import("./bounding-box-map").then((mod) => mod.BoundingBoxMap), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-100 flex items-center justify-center">Loading map...</div>,
})

export const DynamicMapView = dynamic(() => import("./map-view").then((mod) => mod.MapView), {
  ssr: false,
  loading: () => <div className="h-[500px] w-full bg-gray-100 flex items-center justify-center">Loading map...</div>,
})

export const DynamicRecordsMap = dynamic(() => import("./records-map").then((mod) => mod.RecordsMap), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-100 flex items-center justify-center">Loading map...</div>,
})

// Dynamically import the record details dialog
export const DynamicRecordDetailsDialog = dynamic(
  () => import("./record-details-dialog").then((mod) => mod.RecordDetailsDialog),
  {
    ssr: false,
  },
)
