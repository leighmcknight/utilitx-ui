"use client"

import Link from "next/link"
import Image from "next/image"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export default function Navbar() {
  return (
    <header className="border-b">
      <div className="container flex h-16 items-center px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo-dark.png" alt="UTILITX" width={40} height={40} className="dark:hidden" />
          <Image src="/logo-light.png" alt="UTILITX" width={40} height={40} className="hidden dark:block" />
          <span className="text-xl font-bold text-primary">UTILITX</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
            Upload
          </Link>
          <Link href="/records" className="text-sm font-medium transition-colors hover:text-primary">
            Records
          </Link>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  )
}

function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <Button variant="ghost" size="icon" className="ml-4" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      <SunIcon className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <MoonIcon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
