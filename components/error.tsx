"use client"


import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

export function Error() {
  const storedError = sessionStorage.getItem("error");
  const error = storedError ? JSON.parse(storedError) : null;

  return (
    <div>
      <Alert variant="destructive" className="mt-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error?.detail}</AlertDescription>
      </Alert>
    </div>
  )
}
