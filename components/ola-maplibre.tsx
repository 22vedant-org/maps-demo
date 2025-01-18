'use client';
import React, { useEffect, useRef, useCallback, useState } from 'react';
import { GeolocateControl, Map, Marker, GeoJSONSource } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import axios from 'axios';
import polyline from '@mapbox/polyline';
import { Feature, LineString } from 'geojson';

const OlaMaplibre = () => {
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

	// Initialize the map only once
	useEffect(() => {
		if (!mapRef.current || mapInstance.current) return;

		const myMap = new Map({
			style: `https://api.olamaps.io/tiles/vector/v1/styles/default-dark-standard/style.json`,
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
						'line-opacity': 0.75,
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
							'line-color': '#3887be',
							'line-width': 5,
							'line-opacity': 0.75,
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
