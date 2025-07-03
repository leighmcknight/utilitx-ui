import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import Script from "next/script";

interface ArcGisMapProps {
	gcpResponse: [
		{
			record_id: string;
			geometry: {
				type: "Point";
				coordinates: [number, number]; // [longitude, latitude]
			};
			metadata: {
				tiles: {
					[tileKey: string]: {
						text_blob: string;
					};
				};
				georeference: {
					lat: number;
					lon: number;
					conf: number;
					source: string;
					intersection: string[] | string;
					approximate_address: string;
					georeference_source: string;
					georeference_confidence: number;
					trust_score: number;
					fallback_used: boolean;
				};
				bounding_box: {
					southwest: {
						lat: number;
						lng: number;
					};
					northeast: {
						lat: number;
						lng: number;
					};
				};
			};
			error: string | null;
		}
	];
}

export default function ArcGisMap({ gcpResponse }: ArcGisMapProps) {
	console.log(gcpResponse);
	const viewDivRef = useRef<HTMLDivElement | null>(null);
	const [scriptLoaded, setScriptLoaded] = useState(false);

	useEffect(() => {
		console.log("require:", typeof window.require);
		if (!scriptLoaded) return;
		const win = window as any;
		if (!win.require) {
			console.error("ArcGIS script not loaded yet");
			return;
		}

		win.require(
			[
				"esri/Map",
				"esri/views/MapView",
				"esri/layers/FeatureLayer",
				"esri/widgets/Editor",
				"esri/widgets/Expand",
				"esri/widgets/LayerList",
				"esri/widgets/Legend",
				"esri/widgets/FeatureTable",
				"esri/core/reactiveUtils",
			],
			(
				Map: any,
				MapView: any,
				FeatureLayer: any,
				Editor: any,
				Expand: any,
				LayerList: any,
				Legend: any,
				FeatureTable: any,
				reactiveUtils: any
			) => {
				const map = new Map({
					basemap: "streets-navigation-vector",
				});

				const view = new MapView({
					container: viewDivRef.current,
					map,
					center: [
						gcpResponse[0].geometry.coordinates[0],
						gcpResponse[0].geometry.coordinates[1],
					],
					zoom: 12,
				});

				view.when(() => {
					console.log("MapView is ready");
				});

				const featureLayer = new FeatureLayer({
					portalItem: {
						id: "bd789e3a19b445f68018c946878a1dfa",
					},
					outFields: ["*"],
					popupEnabled: true,
				});

				featureLayer
					.when(() => {
						console.log("Portal item loaded successfully");
						console.log("Layer title:", featureLayer.title);
						console.log(
							"Layer fields:",
							featureLayer.fields.map((f: any) => f.name)
						);
						console.log("Renderer:", featureLayer.renderer);

						if (featureLayer.title) {
							document.title = `ArcGIS Feature Editor - ${featureLayer.title}`;
						}
					})
					.catch((error: any) => {
						console.error("Error loading portal item:", error);
						console.log("Falling back to direct service URL...");
						featureLayer.url =
							"https://services7.arcgis.com/85E8yrjEGbCKVQjw/ArcGIS/rest/services/Oshawa_points/FeatureServer/0";
					});

				const editor = new Editor({
					view: view,
					layerInfos: [
						{
							layer: featureLayer,
							formTemplate: {
								elements: [],
							},
							enabled: true,
							addEnabled: true,
							updateEnabled: true,
							deleteEnabled: true,
						},
					],
				});

				const editorExpand = new Expand({
					view: view,
					content: editor,
					expanded: false,
					expandIconClass: "esri-icon-edit",
				});

				const layerList = new LayerList({
					view: view,
				});

				const legend = new Legend({
					view: view,
				});

				const legendExpand = new Expand({
					view: view,
					content: legend,
					expanded: false,
					expandIconClass: "esri-icon-legend",
				});

				const layerListExpand = new Expand({
					view: view,
					content: layerList,
					expanded: false,
					expandIconClass: "esri-icon-layers",
				});

				interface FeatureTableType {
					destroy: () => void;
					on: (
						eventName: string,
						handler: (event: any) => void
					) => void;
				}

				let featureTable: FeatureTableType | null = null;

				const createFeatureTable = () => {
					if (featureTable) {
						featureTable.destroy();
					}

					featureTable = new FeatureTable({
						view: view,
						layer: featureLayer,
						container: "attributeTableContent",
						editingEnabled: true,
						menuConfig: {
							items: [
								{
									label: "Zoom to feature",
									iconClass: "esri-icon-zoom-to-object",
									clickFunction: function (event: any) {
										view.goTo(event.feature.geometry);
									},
								},
								{
									label: "Edit feature",
									iconClass: "esri-icon-edit",
									clickFunction: function (event: any) {
										editor.startUpdateWorkflow(
											event.feature
										);
										const attributeTableElem =
											document.getElementById(
												"attributeTable"
											);
										if (attributeTableElem) {
											attributeTableElem.style.display =
												"none";
										}
										editorExpand.expanded = true;
									},
								},
							],
						},
					});

					if (featureTable) {
						featureTable.on("selection-change", (event) => {
							if (event.added.length > 0) {
								view.goTo(event.added[0].geometry);
							}
						});
					}
				};

				view.ui.add(editorExpand, "top-left");
				view.ui.add(layerListExpand, "top-left");
				view.ui.add(legendExpand, "top-left");

				view.when(() => {
					featureLayer.when(() => {
						view.goTo(featureLayer.fullExtent);
						if (featureLayer.title) {
							document.title = `ArcGIS Feature Editor – ${featureLayer.title}`;
						}
					});

					reactiveUtils.watch(
						() => editor.viewModel.state,
						(state: any) => console.log("Editor state:", state)
					);
				});

				let activeWidget = null;

				// Get toolbar buttons
				const addBtn = document.getElementById("addBtn");
				const editBtn = document.getElementById("editBtn");
				const deleteBtn = document.getElementById("deleteBtn");
				const clearBtn = document.getElementById("clearBtn");

				// Add feature functionality
				if (addBtn) {
					addBtn.addEventListener("click", () => {
						setActiveWidget("add");
						editor.startCreateFeaturesWorkflow();
						editorExpand.expanded = true;
					});
				}

				if (editBtn) {
					editBtn.addEventListener("click", () => {
						setActiveWidget("edit");
						view.popup.close();

						const clickHandler = view.on("click", (event: any) => {
							view.hitTest(event).then((response: any) => {
								const results = response.results.filter(
									(result: any) => {
										return (
											result.graphic.layer ===
											featureLayer
										);
									}
								);

								if (results.length > 0) {
									const graphic = results[0].graphic;
									editor.startUpdateWorkflow(graphic);
									editorExpand.expanded = true;
									clickHandler.remove();
									setActiveWidget(null);
								}
							});
						});
					});
				}

				if (deleteBtn) {
					deleteBtn.addEventListener("click", () => {
						setActiveWidget("delete");
						view.popup.close();

						const clickHandler = view.on("click", (event: any) => {
							view.hitTest(event).then((response: any) => {
								const results = response.results.filter(
									(result: any) => {
										return (
											result.graphic.layer ===
											featureLayer
										);
									}
								);

								if (results.length > 0) {
									const graphic = results[0].graphic;
									if (
										confirm(
											"Are you sure you want to delete this feature?"
										)
									) {
										featureLayer
											.applyEdits({
												deleteFeatures: [graphic],
											})
											.then((result: any) => {
												if (
													result
														.deleteFeatureResults[0]
														.success
												) {
													console.log(
														"Feature deleted successfully"
													);
												} else {
													console.error(
														"Failed to delete feature"
													);
												}
											});
									}
									clickHandler.remove();
									setActiveWidget(null);
								}
							});
						});
					});
				}

				if (clearBtn) {
					clearBtn.addEventListener("click", () => {
						view.popup.close();
						featureLayer.definitionExpression = null;
						setActiveWidget(null);
						editorExpand.expanded = false;
					});
				}

				const attributeTableBtn =
					document.getElementById("attributeTableBtn");
				const attributeTable =
					document.getElementById("attributeTable");
				const closeTableBtn = document.getElementById("closeTableBtn");

				if (attributeTableBtn && attributeTable && closeTableBtn) {
					attributeTableBtn.addEventListener("click", () => {
						if (
							attributeTable.style.display === "none" ||
							!attributeTable.style.display
						) {
							attributeTable.style.display = "block";
							attributeTableBtn.classList.add("active");

							featureLayer.when(() => {
								createFeatureTable();
							});
						} else {
							attributeTable.style.display = "none";
							attributeTableBtn.classList.remove("active");
						}
					});

					closeTableBtn.addEventListener("click", () => {
						attributeTable.style.display = "none";
						attributeTableBtn.classList.remove("active");
					});
				}

				function setActiveWidget(type: any) {
					document
						.querySelectorAll(".toolbar-button")
						.forEach((btn) => {
							if (btn.id !== "attributeTableBtn") {
								btn.classList.remove("active");
							}
						});

					if (type === "add") {
						if (addBtn) addBtn.classList.add("active");
					} else if (type === "edit") {
						if (editBtn) editBtn.classList.add("active");
					} else if (type === "delete") {
						if (deleteBtn) deleteBtn.classList.add("active");
					}

					activeWidget = type;
				}

				reactiveUtils.on(
					() => editor.viewModel.state,
					(state: any) => {
						if (state === "ready") {
							setActiveWidget(null);
						}
					}
				);

				featureLayer.on("edits", (event: any) => {
					console.log("Edit operation completed:", event);
				});
			}
		);
	}, [scriptLoaded]);

	return (
		<>
			<Head>
				<title>ArcGIS Map Viewer</title>
				<link
					rel="stylesheet"
					href="https://js.arcgis.com/4.29/esri/themes/light/main.css"
				/>
			</Head>
			<Script
				src="https://js.arcgis.com/4.29/"
				strategy="afterInteractive"
				onLoad={() => {
					setScriptLoaded(true);
				}}
			/>

			<div
				ref={viewDivRef}
				style={{ height: "60vh", width: "75w", margin: 0, padding: 0 }}
			/>
		</>
	);
}
