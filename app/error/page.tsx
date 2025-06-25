import { Error } from "../../components/error";

export default function ErrorPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Error Occurred</h1>
      </div>
      <Error />
    </div>
  )
}
