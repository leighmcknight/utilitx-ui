import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
}

export function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-800"
    case "maintenance":
      return "bg-yellow-100 text-yellow-800"
    case "inactive":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export function getScoreColor(score: number) {
  if (score >= 90) return "bg-green-100 text-green-800"
  if (score >= 80) return "bg-lime-100 text-lime-800"
  if (score >= 70) return "bg-yellow-100 text-yellow-800"
  if (score >= 60) return "bg-orange-100 text-orange-800"
  return "bg-red-100 text-red-800"
}
