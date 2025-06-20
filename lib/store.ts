import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useDataStore = create((set) => ({
	responseData: null,
	setResponseData: (data: any) => set({ responseData: data }),
}));

export interface UploadedWithOption {
	file: File;
	option?: string;
}

// Define the new data structure based on the provided JSON
export interface Tile {
	text_blob: string;
}

export interface Georeference {
	lat: number;
	lon: number;
	conf: number;
	source: string;
	intersection?: string;
	address?: string;
	georeference_source?: string;
	georeference_confidence?: number;
	trust_score: number;
	fallback_used: boolean;
}

export interface Coordinates {
	lat: number;
	lng: number;
}

export interface BoundingBox {
	southwest: Coordinates;
	northeast: Coordinates;
}

export interface AssetRecord {
	record_id: string;
	geometry: { type: string; coordinates: number[] };
	tiles: { [key: string]: { text_blob: string } };
	georeference: Georeference;
	bounding_box: BoundingBox;
	bbox_for_prompt?: string;
	metadata: {
		tiles: { [key: string]: { text_blob: string } };
		georeference: Georeference;
		bounding_box: BoundingBox;
		bbox_for_prompt?: string;
		text_blob_summary?: string;
	};
	text_blob_interpretation_labeled?: string;
	text_blob_summary?: string;
	error: null | string;
	selected_option: string;
}

interface AppState {
	records: AssetRecord[];
	setRecords: (records: AssetRecord[]) => void;
	addRecords: (records: AssetRecord[]) => void;
	clearRecords: () => void;
}

export const useAppStore = create<AppState>()(
	persist(
		(set) => ({
			records: [],
			setRecords: (records) => set({ records }),
			addRecords: (newRecords) =>
				set((state) => ({
					records: [...state.records, ...newRecords],
				})),
			clearRecords: () => set({ records: [] }),
		}),
		{
			name: "utilitx-storage",
		}
	)
);

// Sample data for demonstration when no data is uploaded
export const sampleRecords: AssetRecord[] = [];
