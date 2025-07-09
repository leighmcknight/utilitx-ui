"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export function Error() {
	const [error, setError] = useState<{ detail: string } | null>(null);

	useEffect(() => {
		const storedError = sessionStorage.getItem("error");
		const parsed = storedError ? JSON.parse(storedError) : null;
		setError(parsed);
	}, []);

	return (
		<div>
			{error && (
				<Alert variant="destructive" className="mt-4">
					<AlertTriangle className="h-4 w-4" />
					<AlertTitle>Error</AlertTitle>
					{/* <AlertDescription>{error.detail}</AlertDescription> */}
				</Alert>
			)}
		</div>
	);
}
