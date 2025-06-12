"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Check, AlertCircle, Upload, FileJson, Download } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface JsonEditorProps {
  value: string
  onChange: (value: string) => void
}

export function JsonEditor({ value, onChange }: JsonEditorProps) {
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const validateJson = () => {
    if (!value.trim()) {
      setIsValid(null)
      return
    }

    try {
      JSON.parse(value)
      setIsValid(true)
      toast({
        title: "Valid JSON",
        description: "Your JSON data is valid.",
      })
    } catch (error) {
      setIsValid(false)
      toast({
        title: "Invalid JSON",
        description: error instanceof Error ? error.message : "Please check your JSON syntax.",
        variant: "destructive",
      })
    }
  }

  const handleFileUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        // Try to parse to validate
        JSON.parse(content)
        onChange(content)
        setIsValid(true)
        toast({
          title: "JSON file loaded",
          description: `Successfully loaded ${file.name}`,
        })
      } catch (error) {
        setIsValid(false)
        toast({
          title: "Invalid JSON file",
          description: "The file does not contain valid JSON data.",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type === "application/json" || file.name.endsWith(".json")) {
        handleFileUpload(file)
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a JSON file.",
          variant: "destructive",
        })
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      if (file.type === "application/json" || file.name.endsWith(".json")) {
        handleFileUpload(file)
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a JSON file.",
          variant: "destructive",
        })
      }
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const formatJson = () => {
    if (!value.trim()) return

    try {
      const parsed = JSON.parse(value)
      const formatted = JSON.stringify(parsed, null, 2)
      onChange(formatted)
      setIsValid(true)
      toast({
        title: "JSON formatted",
        description: "Your JSON data has been formatted.",
      })
    } catch (error) {
      setIsValid(false)
      toast({
        title: "Invalid JSON",
        description: "Cannot format invalid JSON data.",
        variant: "destructive",
      })
    }
  }

  const downloadSample = async () => {
    try {
      const response = await fetch("/sample-assets.json")
      const data = await response.text()
      onChange(data)
      setIsValid(true)
      toast({
        title: "Sample loaded",
        description: "Sample asset data has been loaded into the editor.",
      })
    } catch (error) {
      toast({
        title: "Error loading sample",
        description: "Could not load the sample data.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 rounded-lg transition-colors ${
          isDragging
            ? "border-primary border-dashed bg-primary/5"
            : isValid === true
              ? "border-green-500"
              : isValid === false
                ? "border-red-500"
                : "border-gray-200"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Textarea
          placeholder="Paste your JSON data here..."
          className="min-h-[300px] font-mono text-sm border-0 resize-none focus-visible:ring-0"
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setIsValid(null)
          }}
        />
        {isValid !== null && (
          <div className="absolute top-3 right-3">
            {isValid ? (
              <div className="bg-green-100 text-green-800 p-1 rounded-full">
                <Check className="h-4 w-4" />
              </div>
            ) : (
              <div className="bg-red-100 text-red-800 p-1 rounded-full">
                <AlertCircle className="h-4 w-4" />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={validateJson}>
          Validate JSON
        </Button>
        <Button variant="outline" onClick={formatJson}>
          Format JSON
        </Button>
        <Button variant="outline" onClick={handleUploadClick} className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Upload JSON File
        </Button>
        <Button variant="outline" onClick={downloadSample} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Load Sample Data
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          accept=".json,application/json"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {!value && (
        <Card className="bg-muted/50">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <FileJson className="h-12 w-12 text-muted-foreground mb-2" />
            <h3 className="text-sm font-medium">Upload or paste JSON data</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Drag and drop a JSON file here, use the upload button, or paste JSON directly in the text area
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
