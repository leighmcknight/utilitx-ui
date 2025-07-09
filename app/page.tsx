import { UploadForm } from "@/components/upload-form"

export default function Home() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-primary mb-4">Spatial Intelligence Platform</h1>
        <p className="text-xl text-secondary">Upload, manage, and analyze your infrastructure asset records</p>
      </div>
      <UploadForm />
    </div>
  )
}
