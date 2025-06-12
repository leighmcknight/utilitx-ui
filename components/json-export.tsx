"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Download, Copy, Check, Code } from "lucide-react"
import type { AssetRecord } from "@/lib/store"

interface JsonExportProps {
  records: AssetRecord[]
  hasModifiedRecords: boolean
}

export function JsonExport({ records, hasModifiedRecords }: JsonExportProps) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const { toast } = useToast()

  // Format the records as JSON
  const jsonData = JSON.stringify(records, null, 2)

  // Handle copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonData)
      setCopied(true)
      toast({
        title: "Copied to clipboard",
        description: "The JSON data has been copied to your clipboard.",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle download
  const handleDownload = () => {
    const blob = new Blob([jsonData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "asset-records.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Download started",
      description: "Your JSON file is being downloaded.",
    })
  }

  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Code className="h-5 w-5" />
            Export Records
            {hasModifiedRecords && (
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">Modified</span>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
              {expanded ? "Collapse" : "Expand"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Textarea
          value={jsonData}
          readOnly
          className={`font-mono text-xs ${expanded ? "min-h-[400px]" : "max-h-[200px]"} overflow-auto`}
        />
      </CardContent>
    </Card>
  )
}
