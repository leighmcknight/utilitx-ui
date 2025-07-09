export default function AllRecords() {
	return (
		<div className="container mx-auto py-8 px-4">
			<div className="mb-8">
				<h1 className="text-4xl font-bold text-primary mb-2">
					All files uploaded to the Utilitx software
				</h1>
			</div>
			<iframe
				src={`https://arcgis-map.web.app/?lat=${43.637101}&lon=${-79.39814}&zoom=${8}`}
				width="100%"
				height="1000"
				loading="lazy"
			/>
		</div>
	);
}
