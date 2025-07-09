"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { RecordsTable } from "./records-table";
import { RecordsMap } from "./records-map";
import { JsonExport } from "./json-export";
import { Search, ListFilter, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuCheckboxItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type AssetRecord } from "@/lib/store";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ArcGisMap from "./arc-gis-map";

// import {useEffect, useState} from "react";

export function RecordsView() {
	const router = useRouter();

	const [searchQuery, setSearchQuery] = useState("");
	const [selectedRecord, setSelectedRecord] = useState<string | null>(null);
	const [sourceFilter, setSourceFilter] = useState<string[]>([]);
	const [view, setView] = useState<"list" | "map">("list");
	const [workingRecords, setWorkingRecords] = useState<AssetRecord[]>([]);
	const [hasModifiedRecords, setHasModifiedRecords] = useState(false);

	// const { records } = useAppStore()

	const [ingestedData, setIngestedData] = useState<AssetRecord[]>([]);

	useEffect(() => {
		const stored = sessionStorage.getItem("records");
		let storedFiles = sessionStorage.getItem("files");
		if (stored) {
			try {
				const parsedRecords = JSON.parse(stored);
				const parsedFiles = storedFiles ? JSON.parse(storedFiles) : [];

				const normalize = (name: string) =>
					name
						?.toLowerCase()
						.replace(/-p\d+$/, "")
						.replace(/\.[^/.]+$/, ""); // no extension

				const fileOptionMap = Object.fromEntries(
					parsedFiles.map(
						({
							name,
							option,
						}: {
							name: string;
							option: string;
						}) => [normalize(name), option]
					)
				);

				const enriched = parsedRecords.map((record: any) => {
					const baseFileName = record.record_id?.replace(
						/-p\d+$/,
						""
					); // just trims the `-p00`
					const normalized = normalize(baseFileName);
					const matchedOption = fileOptionMap[normalized];

					return {
						...record,
						selected_option: matchedOption || null,
					};
				});

				setIngestedData(enriched);
				setWorkingRecords(enriched);
			} catch (e) {
				console.error("Error parsing session data:", e);
			}
		}
	}, []);

	// Use uploaded records
	const displayRecords = workingRecords.length > 0 ? workingRecords : [];
	const isEmpty = displayRecords.length === 0;

	// Get unique sources for filters
	const sources = Array.from(
		new Set(
			displayRecords
				.map((record: any) => record?.metadata?.georeference?.source)
				.filter(Boolean)
		)
	);

	const filteredRecords = displayRecords.filter((record) => {
		record.text_blob_summary =
			record.text_blob_summary || "Summary of utility drawing...";

		// Ensure all properties exist before accessing them
		if (!record.text_blob_summary || !record?.metadata?.georeference)
			return false;

		// Text search in summary or intersection
		const summaryMatch = record.text_blob_summary
			.toLowerCase()
			.includes(searchQuery.toLowerCase());

		const intersectionMatch =
			record?.metadata?.georeference.intersection &&
			record?.metadata?.georeference.intersection
				.toString()
				.toLowerCase()
				.includes(searchQuery.toLowerCase());

		const addressMatch =
			record?.metadata?.georeference.address &&
			record?.metadata?.georeference.address
				.toLowerCase()
				.includes(searchQuery.toLowerCase());

		const matchesSearch =
			searchQuery === "" ||
			summaryMatch ||
			intersectionMatch ||
			addressMatch;

		// Source filter
		const matchesSource =
			sourceFilter.length === 0 ||
			(record?.metadata?.georeference.source &&
				sourceFilter.includes(record?.metadata?.georeference.source));

		return matchesSearch && matchesSource;
	});

	const handleRecordSelect = (id: string) => {
		setSelectedRecord(id === selectedRecord ? null : id);
	};

	const navigateToUpload = () => {
		router.push("/");
	};

	// Handle record updates (e.g., when a marker is dragged)
	const handleRecordUpdate = (updatedRecord: AssetRecord, index: number) => {
		const newRecords = [...workingRecords];
		newRecords[index] = updatedRecord;
		setWorkingRecords(newRecords);
		setHasModifiedRecords(true);
	};

	// Function to get a unique ID for each record
	const getRecordId = (record: AssetRecord, index: number) => {
		if (!record?.metadata?.georeference) return `record-${index}`;
		return `${record?.metadata?.georeference.lat}-${record?.metadata?.georeference.lon}-${index}`;
	};

	// Calculate stats
	const totalRecords = displayRecords.length;
	// const lowConfidenceCount = displayRecords.filter((r) => r?.metadata?.georeference?.conf < 0.7).length

	// const avgTrustScore =
	//   displayRecords.length > 0
	//   ? Math.round(
	//     (displayRecords.reduce((sum, r) => sum + (r?.metadata?.georeference?.trust_score || 0), 0) / displayRecords.length) *
	//     100,
	//   )
	//   : 0

	if (isEmpty) {
		return (
			<div className="space-y-6">
				<Alert>
					<AlertTitle>No Records Found</AlertTitle>
					<AlertDescription>
						You haven't uploaded any asset records yet. Upload JSON
						data to see your records here.
					</AlertDescription>
				</Alert>
				<Button
					onClick={navigateToUpload}
					className="flex items-center gap-2">
					<Upload className="h-4 w-4" />
					Upload Asset Records
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row gap-4 items-center">
				<div className="relative w-full max-w-md">
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
					<Input
						type="search"
						placeholder="Search records using intersection, summary or address..."
						className="pl-8"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>

				<div className="flex items-center gap-2">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="outline"
								size="sm"
								className="flex items-center gap-1">
								<ListFilter className="h-4 w-4" />
								Source
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							{sources.map((source) => (
								<DropdownMenuCheckboxItem
									key={source}
									checked={sourceFilter.includes(source)}
									onCheckedChange={(checked) => {
										if (checked) {
											setSourceFilter([
												...sourceFilter,
												source,
											]);
										} else {
											setSourceFilter(
												sourceFilter.filter(
													(s) => s !== source
												)
											);
										}
									}}>
									{source}
								</DropdownMenuCheckboxItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				<div className="ml-auto">
					<Tabs
						value={view}
						onValueChange={(v) => setView(v as "list" | "map")}
						className="w-[200px]">
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="list">List</TabsTrigger>
							<TabsTrigger value="map">Map</TabsTrigger>
						</TabsList>
					</Tabs>
				</div>
			</div>

			<div className="h-[calc(100vh-400px)] min-h-[500px]">
				{view === "list" ? (
					<>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<Card className="record-count">
								<CardContent className="p-6 flex flex-col items-center">
									<div className="text-4xl font-bold">
										{totalRecords}
									</div>
									<div className="text-sm text-gray-500">
										Total Records
									</div>
								</CardContent>
							</Card>
							<Card>
								<CardContent className="p-6 flex flex-col items-center">
									<p className="text-xl font-bold gap-2">
										Colour coding is used to display the
										primary asset as built was submitted
										for.
									</p>
									<hr />
									<div className="md:grid-cols-3 grid content-start gap-2">
										<div className="flex items-center mb-4">
											<div className="flex items-center justify-center w-8 h-8 rounded-full red-dot mr-2"></div>
											<p className="text-sm">
												Electric Power Lines, Cables,
												Conduit and Lighting Cables
											</p>
										</div>
										<div className="flex items-center mb-4">
											<div className="flex items-center justify-center w-8 h-8 rounded-full yellow-dot mr-2"></div>
											<p className="text-sm">
												Gas, Oil, Steam, Petroleum or
												Gaseous Materials
											</p>
										</div>
										<div className="flex items-center mb-4">
											<div className="flex items-center justify-center w-8 h-8 rounded-full orange-dot mr-2"></div>
											<p className="text-sm">
												Communications, Alarm or Signal
												Lines, Cables or Conduit
											</p>
										</div>
										<div className="flex items-center mb-4">
											<div className="flex items-center justify-center w-8 h-8 rounded-full blue-dot mr-2"></div>
											<p className="text-sm">
												Potable Water
											</p>
										</div>
										<div className="flex items-center mb-4">
											<div className="flex items-center justify-center w-8 h-8 rounded-full purple-dot mr-2"></div>
											<p className="text-sm">
												Reclaimed Water, Irrigation and
												Slurry Lines
											</p>
										</div>
										<div className="flex items-center mb-4">
											<div className="flex items-center justify-center w-8 h-8 rounded-full green-dot mr-2"></div>
											<p className="text-sm">
												Sewer and Drain Lines
											</p>
										</div>
										<div className="flex items-center mb-4">
											<div className="flex items-center justify-center w-8 h-8 rounded-full pink-dot mr-2"></div>
											<p className="text-sm">
												Temporary Survey Markings
											</p>
										</div>
										<div className="flex items-center mb-4">
											<div className="flex items-center justify-center w-8 h-8 rounded-full white-dot mr-2"></div>
											<p className="text-sm">
												Proposed Excavation
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
						<RecordsTable
							records={filteredRecords}
							selectedRecord={selectedRecord}
							onSelectRecord={handleRecordSelect}
						/>
					</>
				) : (
					<>
						<div className="grid grid-cols-1 md:grid-cols-1 gap-4">
							<Card>
								<CardContent className="p-6 flex flex-col items-center">
									<p className="text-xl font-bold legend-header">
										Colour coding is used to display the
										primary asset as built was submitted
										for.
									</p>
									<hr />
									<div className="md:grid-cols-4 grid content-start gap-2">
										<div className="flex items-center mb-4">
											<div className="flex items-center justify-center w-8 h-8 rounded-full red-dot mr-2"></div>
											<p className="text-sm">
												Electric Power Lines, Cables,
												Conduit and Lighting Cables
											</p>
										</div>
										<div className="flex items-center mb-4">
											<div className="flex items-center justify-center w-8 h-8 rounded-full yellow-dot mr-2"></div>
											<p className="text-sm">
												Gas, Oil, Steam, Petroleum or
												Gaseous Materials
											</p>
										</div>
										<div className="flex items-center mb-4">
											<div className="flex items-center justify-center w-8 h-8 rounded-full orange-dot mr-2"></div>
											<p className="text-sm">
												Communications, Alarm or Signal
												Lines, Cables or Conduit
											</p>
										</div>
										<div className="flex items-center mb-4">
											<div className="flex items-center justify-center w-8 h-8 rounded-full blue-dot mr-2"></div>
											<p className="text-sm">
												Potable Water
											</p>
										</div>
										<div className="flex items-center mb-4">
											<div className="flex items-center justify-center w-8 h-8 rounded-full purple-dot mr-2"></div>
											<p className="text-sm">
												Reclaimed Water, Irrigation and
												Slurry Lines
											</p>
										</div>
										<div className="flex items-center mb-4">
											<div className="flex items-center justify-center w-8 h-8 rounded-full green-dot mr-2"></div>
											<p className="text-sm">
												Sewer and Drain Lines
											</p>
										</div>
										<div className="flex items-center mb-4">
											<div className="flex items-center justify-center w-8 h-8 rounded-full pink-dot mr-2"></div>
											<p className="text-sm">
												Temporary Survey Markings
											</p>
										</div>
										<div className="flex items-center mb-4">
											<div className="flex items-center justify-center w-8 h-8 rounded-full white-dot mr-2"></div>
											<p className="text-sm">
												Proposed Excavation
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
						<ArcGisMap gcpResponse={ingestedData} />
					</>

					// <RecordsMap
					// 	records={filteredRecords}
					// 	selectedRecord={selectedRecord}
					// 	onSelectRecord={handleRecordSelect}
					// 	onRecordUpdate={handleRecordUpdate}
					// 	getRecordId={getRecordId}
					// />
				)}
			</div>

			{/* <JsonExport records={workingRecords} hasModifiedRecords={hasModifiedRecords} /> */}
		</div>
	);
}
