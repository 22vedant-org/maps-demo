/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import React, { useEffect, useRef, useCallback, useState } from 'react';
import { GeolocateControl, Map, Marker, GeoJSONSource } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import axios from 'axios';
import polyline from '@mapbox/polyline';
import { Feature, LineString, Point } from 'geojson';

type Props = {
	className?: string;
};

const OlaMaplibre = ({ ...props }: Props) => {
	const mapRef = useRef<HTMLDivElement>(null);
	const mapInstance = useRef<Map | null>(null); // Reference to the map instance
	const [markerPositions, setMarkerPositions] = useState({
		markerOrigin: { lng: 73.847466, lat: 18.530823 },
		markerDestination: { lng: 73.8547, lat: 18.4655 },
	});
	const [polyCords, setPolyCords] = useState<[number, number][]>([]);
	const sendParamsOla = useCallback(
		async (positions: typeof markerPositions) => {
			try {
				const response = await axios.post(
					'https://api.olamaps.io/routing/v1/directions',
					null,
					{
						params: {
							api_key: process.env.NEXT_PUBLIC_OLA_API_KEY,
							origin: `${positions.markerOrigin.lat},${positions.markerOrigin.lng}`,
							destination: `${positions.markerDestination.lat},${positions.markerDestination.lng}`,
						},
					}
				);
				if (response.data['status'] === 'SUCCESS') {
					const routes = response.data.routes;
					const polyLine = routes[0].overview_polyline;
					const decoded = polyline.decode(polyLine);
					setPolyCords(decoded.map(([lat, lng]) => [lng, lat])); // Reverse coordinates for GeoJSON
				}
			} catch (error) {
				console.error(error);
				throw error;
			}
		},
		[]
	);

	const updateGeofenceLayer = useCallback(
		(map: Map, center: [number, number]) => {
			const geofencePoint: Feature<Point> = {
				type: 'Feature',
				geometry: {
					type: 'Point',
					coordinates: center,
				},
				properties: {
					radius: 200, // radius in meters
				},
			};

			if (map.getSource('geofence')) {
				(map.getSource('geofence') as GeoJSONSource).setData(
					geofencePoint
				);
			} else {
				map.addSource('geofence', {
					type: 'geojson',
					data: geofencePoint,
				});

				// Add the circle layer for the geofence
				map.addLayer({
					id: 'geofence-fill',
					type: 'circle',
					source: 'geofence',
					paint: {
						'circle-radius': ['get', 'radius'],
						'circle-color': '#2196f3',
						'circle-opacity': 0.2,
						'circle-stroke-width': 2,
						'circle-stroke-color': '#2196f3',
					},
				});

				// Add center point
				map.addLayer({
					id: 'geofence-center',
					type: 'circle',
					source: 'geofence',
					paint: {
						'circle-radius': 6,
						'circle-color': '#ffffff',
						'circle-stroke-width': 2,
						'circle-stroke-color': '#2196f3',
					},
				});
			}
		},
		[]
	);

	// const sendGeoFence = useCallback(
	// 	async (positions: typeof markerPositions) => {
	// 		try {
	// 			const response = await axios.post(
	// 				'https://api.olamaps.io/places/v1/geofence',
	// 				{
	// 					name: 'Trial Geofence',
	// 					type: 'circle',
	// 					radius: 100,
	// 					coordinates: [
	// 						[
	// 							positions.markerDestination.lat,
	// 							positions.markerDestination.lng,
	// 						],
	// 					],
	// 					status: 'active',
	// 					projectId: '123',
	// 				},
	// 				{
	// 					params: {
	// 						api_key: process.env.NEXT_PUBLIC_OLA_API_KEY,
	// 					},
	// 				}
	// 			);
	// 			if (
	// 				mapInstance.current &&
	// 				mapInstance.current.isStyleLoaded()
	// 			) {
	// 				updateGeofenceLayer(mapInstance.current, [
	// 					positions.markerDestination.lng,
	// 					positions.markerDestination.lat,
	// 				]);
	// 			}
	// 			return response;
	// 		} catch (error) {
	// 			console.error(error);
	// 		}
	// 	},
	// 	[updateGeofenceLayer]
	// );
	// async function getGeoFence() {
	// 	const response = await axios.get(
	// 		'https://api.olamaps.io/places/v1/geofences',
	// 		{
	// 			params: {
	// 				page: 1,
	// 				size: 100,
	// 				projectId: '123',
	// 				api_key: process.env.NEXT_PUBLIC_OLA_API_KEY,
	// 			},
	// 		}
	// 	);
	// 	console.log(response.data);
	// }
	// Initialize the map only once
	useEffect(() => {
		if (!mapRef.current || mapInstance.current) return;

		const myMap = new Map({
			style: `https://api.olamaps.io/styleEditor/v1/styleEdit/styles/923b4afc-f3f9-4d83-8c65-c2eb598f5834/ola-mapbox-dark`,
			container: mapRef.current,
			center: [73.847466, 18.530823],
			zoom: 15,
			maxBounds: [
				68.1766451354, 7.96553477623, 97.4025614766, 35.4940095078,
			],
			transformRequest: (url, resourceType) => {
				if (url.includes('?')) {
					url = `${url}&api_key=${process.env.NEXT_PUBLIC_OLA_API_KEY}`;
				} else {
					url = `${url}?api_key=${process.env.NEXT_PUBLIC_OLA_API_KEY}`;
				}
				return { url, resourceType };
			},
		});

		// Save the map instance
		mapInstance.current = myMap;

		// Add origin and destination markers
		new Marker({ draggable: false, color: 'red' })
			.setLngLat([73.847466, 18.530823])
			.addTo(myMap);

		const markerDestination = new Marker({ color: 'blue', draggable: true })
			.setLngLat([73.8547, 18.4655])
			.addTo(myMap);

		markerDestination.on('dragend', async () => {
			const lngLat = markerDestination.getLngLat();
			const updatedPositions = {
				...markerPositions,
				markerDestination: { lng: lngLat.lng, lat: lngLat.lat },
			};
			setMarkerPositions(updatedPositions);
			await sendParamsOla(updatedPositions); // Fetch the new route
			// await sendGeoFence(updatedPositions);
			// await getGeoFence();
		});

		myMap.addControl(
			new GeolocateControl({
				positionOptions: { enableHighAccuracy: true },
				trackUserLocation: true,
			})
		);

		// Ensure we wait for the style to load before adding layers
		myMap.on('style.load', () => {
			console.log('Style loaded successfully.');
		});
	}, [sendParamsOla]);

	// Update the polyline when `polyCords` changes
	useEffect(() => {
		if (!mapInstance.current) return;

		const myMap = mapInstance.current;
		const geoJsonLine: Feature<LineString> = {
			type: 'Feature',
			geometry: {
				type: 'LineString',
				coordinates: polyCords,
			},
			properties: {},
		};

		if (myMap.isStyleLoaded()) {
			if (myMap.getSource('route')) {
				(myMap.getSource('route') as GeoJSONSource).setData(
					geoJsonLine
				);
			} else {
				myMap.addSource('route', {
					type: 'geojson',
					data: geoJsonLine,
				});
				myMap.addLayer({
					id: 'route',
					type: 'line',
					source: 'route',
					layout: {
						'line-join': 'round',
						'line-cap': 'round',
					},
					paint: {
						'line-color': '#0f53ff',
						'line-width': 7,
						'line-opacity': 1,
					},
				});
			}
		} else {
			myMap.once('style.load', () => {
				if (!myMap.getSource('route')) {
					myMap.addSource('route', {
						type: 'geojson',
						data: geoJsonLine,
					});
					myMap.addLayer({
						id: 'route',
						type: 'line',
						source: 'route',
						layout: {
							'line-join': 'round',
							'line-cap': 'round',
						},
						paint: {
							'line-color': '#0f53ff',
							'line-width': 6,
							'line-opacity': 1,
						},
					});
				}
			});
		}
	}, [polyCords]);

	return (
		<div ref={mapRef} className="w-full h-screen">
			OlaMaplibre
		</div>
	);
};

export default OlaMaplibre;
