// components/ProgressBar.tsx
"use client"

import { useEffect, useState } from "react"

export default function ProgressBar({ loading }: { loading: boolean }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (loading) {
        // document.body.style.overflow = "hidden"
        setProgress(5)
        interval = setInterval(() => {
            setProgress((prev) => (prev < 90 ? prev + Math.random() * 10 : prev))
        }, 30000)
    } else {
        setProgress(100)
      const timeout = setTimeout(() => {
            setProgress(0)
        }, 300)
        return () => clearTimeout(timeout)
    }

    return () => clearInterval(interval)
  }, [loading])

  return (
    <div
        className={`fixed top-0 left-0 w-full h-full z-[9999] transition-opacity duration-300 pointer-events-none ${
        progress > 0 && progress < 100 ? "opacity-100" : "opacity-0"
        }`}
        style={{
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        }}
    >
        <div className="w-3/4 max-w-xl h-4 bg-gray-200 rounded-full overflow-hidden relative">
        <div
            className="h-full bg-blue-600 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
        />
        <div
            className="absolute top-0 left-0 h-full w-full animate-shimmer"
            style={{
            background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
            backgroundSize: "200% 100%",
            }}
        />
        </div>

        <style jsx>{`
        @keyframes shimmer {
            0% {
            background-position: -200% 0;
            }
            100% {
            background-position: 200% 0;
            }
        }
        .animate-shimmer {
            animation: shimmer 5s infinite linear;
        }
        `}</style>
    </div>
  )
}
