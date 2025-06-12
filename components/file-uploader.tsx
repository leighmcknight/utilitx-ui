"use client"

import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { UploadCloud, File, X, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatBytes } from "@/lib/utils"

interface FileUploaderProps {
  files: File[]
  setFiles: (files: File[]) => void
}

export function FileUploader({ files, setFiles }: FileUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setFiles([...files, ...acceptedFiles])
    },
    [files, setFiles],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/json": [".json"],
      "application/pdf": [".pdf"],
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
    maxSize: 10485760, // 10MB
  })

  const removeFile = (index: number) => {
    const newFiles = [...files]
    newFiles.splice(index, 1)
    setFiles(newFiles)
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-2">
          <UploadCloud className="h-10 w-10 text-gray-400" />
          <p className="text-sm font-medium">{isDragActive ? "Drop files here" : "Upload files or drag and drop"}</p>
          <p className="text-xs text-gray-500">CSV, Excel, JSON, or PDF up to 10MB</p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Upload Files</p>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li key={index} className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-2">
                  {file.type === "application/pdf" ? (
                    <FileText className="h-5 w-5 text-red-500" />
                  ) : file.type === "application/json" ? (
                    <File className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <File className="h-5 w-5 text-blue-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatBytes(file.size)}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeFile(index)}>
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove file</span>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
