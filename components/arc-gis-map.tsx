import { useEffect, useState } from "react";
import { type AssetRecord } from "@/lib/store";

interface ArcGisMapProps {
	gcpResponse: AssetRecord[];
}

export default function ArcGisMap({ gcpResponse }: ArcGisMapProps) {
	const [iframeSrc, setIframeSrc] = useState("");

	useEffect(() => {
		if (gcpResponse.length > 0) {
			const lon = gcpResponse[0].geometry.coordinates[0] || 43.4710569;
			const lat = gcpResponse[0].geometry.coordinates[1] || -79.6175911;
			const zoom = 12;
			const url = `https://arcgis-map.web.app/?lat=${lat}&lon=${lon}&zoom=${zoom}`;
			setIframeSrc(url);
		}
	}, [gcpResponse]);

	return <iframe src={iframeSrc} width="100%" height="1000" loading="lazy" />;
}
