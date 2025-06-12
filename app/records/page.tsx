import { RecordsView } from "../../components/records-view";

export default function RecordsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Asset Records</h1>
        <p className="text-xl text-secondary">
          View and manage your infrastructure asset records with georeferencing capabilities
        </p>
      </div>
      <RecordsView />
    </div>
  )
}
