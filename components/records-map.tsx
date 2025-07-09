"use client";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMobile } from "@/hooks/use-mobile";
import type { AssetRecord } from "@/lib/store";
import dynamic from "next/dynamic";

// Dynamically import the Google Maps component with no SSR
const GoogleMapComponent = dynamic(() => import("@/components/google-map"), {
	ssr: false,
	loading: () => (
		<div className="w-full h-full flex-1 bg-gray-100 flex items-center justify-center min-h-[1000px]">
			<p>Loading map...</p>
		</div>
	),
});

interface RecordsMapProps {
	records: AssetRecord[];
	selectedRecord: string | null;
	onSelectRecord: (id: string) => void;
	// onRecordUpdate?: (updatedRecord: AssetRecord, index: number) => void;
	getRecordId: (record: AssetRecord, index: number) => string;
}

export function RecordsMap({
	records,
	selectedRecord,
	onSelectRecord,
	// onRecordUpdate,
	getRecordId,
}: RecordsMapProps) {
	// Filter records with valid georeference data
	const validRecords = records.filter(
		(record) =>
			record?.metadata?.georeference &&
			typeof record?.metadata?.georeference.lat === "number" &&
			typeof record?.metadata?.georeference.lon === "number"
	);

	return (
		<Card className="overflow-hidden border shadow-md h-full flex flex-col">
			<div className="w-full flex-1 relative">
				<GoogleMapComponent
					records={validRecords}
					selectedRecord={selectedRecord}
					onSelectRecord={onSelectRecord}
					getRecordId={getRecordId}
					// onRecordUpdate={onRecordUpdate}
				/>
			</div>
		</Card>
	);
}
