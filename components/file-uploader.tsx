"use client"

import { useCallback, useState} from "react"
import { useDropzone } from "react-dropzone"
import { UploadCloud, File, X, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatBytes } from "@/lib/utils"
import { UploadedWithOption } from "@/lib/store"

interface FileUploaderProps {
  files: UploadedWithOption[]
  setFiles: (files: UploadedWithOption[]) => void
}


export function FileUploader({ files, setFiles }: FileUploaderProps) {
  const [selectedOption, setSelectedOption] = useState<Record<number, string>>({})
  const [openDropDown, setOpenDropdown] = useState<number | null>(null)


  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const wrapped = acceptedFiles.map(file => ({ file }))
      setFiles([...files, ...wrapped])
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
                  {file.file.type === "application/pdf" ? (
                    <FileText className="h-5 w-5 text-red-500" />
                  ) : file.file.type === "application/json" ? (
                    <File className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <File className="h-5 w-5 text-blue-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{file.file.name}</p>
                    <p className="text-xs text-gray-500">{formatBytes(file.file.size)}</p>
                  </div>
                </div>
                <div>
                  {/* DROPDOWN */}
                  <div className="relative inline-block text-left">
                    <div>
                      <button
                        type="button"
                        className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
                        aria-haspopup="true"
                        onClick={() => setOpenDropdown(openDropDown === index ? null : index)}
                        id={`menu-button-${index}`}
                        aria-expanded={openDropDown === index}
                      >
                        {selectedOption[index] || "Select File Type"}
                        <svg
                          className="size-5 text-gray-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>

                    {openDropDown === index && (
                    <div
                      className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="menu-button"
                      tabIndex={-1}
                    >
                      <div className="py-1" role="none">
                        <a
                          href="#"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex"
                          role="menuitem"
                          tabIndex={-1}
                          id="menu-item-0"
                          onClick={(e) => {
                            e.preventDefault()
                            const updatedFiles = [...files]
                            updatedFiles[index] = { ...updatedFiles[index], option: "Electric Power Lines, Cables, Conduit and Lighting Cables" }
                            setFiles(updatedFiles)
                            setSelectedOption((prev) => ({ ...prev, [index]: "Electric Power Lines..." }))
                            setOpenDropdown(null)
                          }}
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-full small-red-dot mr-2">
                          </div>
                          <p className="text-sm">Electric Power Lines, Cables, Conduit and Lighting Cables</p>
                        </a>
                        <a
                          href="#"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex"
                          role="menuitem"
                          tabIndex={-1}
                          id="menu-item-1"
                          onClick={(e) => {
                            e.preventDefault()
                            const updatedFiles = [...files]
                            updatedFiles[index] = { ...updatedFiles[index], option: "Gas, Oil, Steam, Petroleum or Gaseous Materials" }
                            setFiles(updatedFiles)
                            setSelectedOption((prev) => ({ ...prev, [index]: "Gas, Oil, Steam..." }))
                            setOpenDropdown(null)
                          }}
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-full small-yellow-dot mr-2">
                          </div>
                          <p className="text-sm">Gas, Oil, Steam, Petroleum or Gaseous Materials</p>
                        </a>
                        <a
                          href="#"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex"
                          role="menuitem"
                          tabIndex={-1}
                          id="menu-item-2"
                          onClick={(e) => {
                            e.preventDefault()
                            const updatedFiles = [...files]
                            updatedFiles[index] = { ...updatedFiles[index], option: "Communications, Alarm or Signal Lines, Cables or Conduit" }
                            setFiles(updatedFiles)
                            setSelectedOption((prev) => ({ ...prev, [index]: "Communications, Alarm..." }))
                            setOpenDropdown(null)
                          }}
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-full small-orange-dot mr-2">
                          </div>
                          <p className="text-sm">Communications, Alarm or Signal Lines, Cables or Conduit</p>
                        </a>
                        <a
                          href="#"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex"
                          role="menuitem"
                          tabIndex={-1}
                          id="menu-item-3"
                          onClick={(e) => {
                            e.preventDefault()
                            const updatedFiles = [...files]
                            updatedFiles[index] = { ...updatedFiles[index], option: "Potable Water" }
                            setFiles(updatedFiles)
                            setSelectedOption((prev) => ({ ...prev, [index]: "Potable Water" }))
                            setOpenDropdown(null)
                          }}
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-full small-blue-dot mr-2">
                          </div>
                          <p className="text-sm">Potable Water</p>
                        </a>
                        <a
                          href="#"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex"
                          role="menuitem"
                          tabIndex={-1}
                          id="menu-item-4"
                          onClick={(e) => {
                            e.preventDefault()
                            const updatedFiles = [...files]
                            updatedFiles[index] = { ...updatedFiles[index], option: "Reclaimed Water, Irrigation and Slurry Lines" }
                            setFiles(updatedFiles)
                            setSelectedOption((prev) => ({ ...prev, [index]: "Reclaimed Water..." }))
                            setOpenDropdown(null)
                          }}
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-full small-purple-dot mr-2">
                          </div>
                          <p className="text-sm">Reclaimed Water, Irrigation and Slurry Lines</p>
                        </a>
                        <a
                          href="#"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex"
                          role="menuitem"
                          tabIndex={-1}
                          id="menu-item-5"
                          onClick={(e) => {
                            e.preventDefault()
                            const updatedFiles = [...files]
                            updatedFiles[index] = { ...updatedFiles[index], option: "Sewer and Drain Lines" }
                            setFiles(updatedFiles)
                            setSelectedOption((prev) => ({ ...prev, [index]: "Sewer and Drain Lines" }))
                            setOpenDropdown(null)
                          }}
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-full small-green-dot mr-2">
                          </div>
                          <p className="text-sm">Sewer and Drain Lines</p>
                        </a>
                        <a
                          href="#"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex"
                          role="menuitem"
                          tabIndex={-1}
                          id="menu-item-6"
                          onClick={(e) => {
                            e.preventDefault()
                            const updatedFiles = [...files]
                            updatedFiles[index] = { ...updatedFiles[index], option: "Temporary Survey Markings" }
                            setFiles(updatedFiles)
                            setSelectedOption((prev) => ({ ...prev, [index]: "Temporary Survey Markings" }))
                            setOpenDropdown(null)
                          }}
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-full small-pink-dot mr-2">
                          </div>
                          <p className="text-sm">Temporary Survey Markings</p>
                        </a>
                        <a
                          href="#"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex"
                          role="menuitem"
                          tabIndex={-1}
                          id="menu-item-7"
                          onClick={(e) => {
                            e.preventDefault()
                            const updatedFiles = [...files]
                            updatedFiles[index] = { ...updatedFiles[index], option: "Proposed Excavation" }
                            setFiles(updatedFiles)
                            setSelectedOption((prev) => ({ ...prev, [index]: "Proposed Excavation" }))
                            setOpenDropdown(null)
                          }}
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-full small-white-dot mr-2">
                          </div>
                          <p className="text-sm">Proposed Excavation</p>
                        </a>
                      </div>
                    </div>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeFile(index)}>
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove file</span>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
