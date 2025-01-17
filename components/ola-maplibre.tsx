'use client';
import React, { useEffect, useRef, useCallback, useState } from 'react';
import { GeolocateControl, Map, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import axios from 'axios';
import polyline from '@mapbox/polyline';
import { Feature, LineString } from 'geojson';

const OlaMaplibre = () => {
	const mapRef = useRef<HTMLDivElement>(null);
	const bounds: [number, number, number, number] = [
		68.1766451354, 7.96553477623, 97.4025614766, 35.4940095078,
	];
	const [markerPositions, setMarkerPositions] = useState({
		markerA: { lng: 73.847466, lat: 18.530823 },
		markerB: { lng: 73.8547, lat: 18.4655 },
	});
	const [polyCords, setPolyCords] = useState<[number, number][]>([]);
	const convertedPolyCords: [number, number][] = polyCords.map(
		([lat, lng]) => [lng, lat]
	);
	const geoJsonLine: Feature<LineString> = {
		type: 'Feature',
		geometry: {
			type: 'LineString',
			coordinates: convertedPolyCords,
		},
		properties: {},
	};

	const sendParamsOla = useCallback(
		async (positions: typeof markerPositions) => {
			try {
				const response = await axios.post(
					'https://api.olamaps.io/routing/v1/directions',
					null,
					{
						params: {
							api_key: process.env.NEXT_PUBLIC_OLA_API_KEY,
							origin: `${positions.markerA.lat}, ${positions.markerA.lng}`,
							destination: `${positions.markerB.lat}, ${positions.markerB.lng}`,
						},
					}
				);
				if (response.data['status'] === 'SUCCESS') {
					const routes = response.data.routes;
					const polyLine = routes[0].overview_polyline;
					// console.log(polyLine);

					const decoded = polyline.decode(polyLine);
					setPolyCords(decoded);
				}
				// console.log(response);

				return response.data;
			} catch (error: any) {
				console.error(error);
				throw error;
			}
		},
		[]
	);

	useEffect(() => {
		const myMap = new Map({
			style: `https://api.olamaps.io/tiles/vector/v1/styles/default-dark-standard/style.json`,
			container: mapRef.current!,
			center: [73.847466, 18.530823],
			zoom: 15,
			maxBounds: bounds,
			transformRequest: (url, resourceType) => {
				if (url.includes('?')) {
					url =
						url + `&api_key=${process.env.NEXT_PUBLIC_OLA_API_KEY}`;
				} else {
					url =
						url + `?api_key=${process.env.NEXT_PUBLIC_OLA_API_KEY}`;
				}
				return { url, resourceType };
			},
		});

		const markerOrigin = new Marker({
			draggable: true,
			color: 'red',
		})
			.setLngLat([73.847466, 18.530823])
			.addTo(myMap);

		const geolocate = new GeolocateControl({
			positionOptions: {
				enableHighAccuracy: true,
			},
			trackUserLocation: true,
		});
		myMap.addControl(geolocate);
	}, []);
	return (
		<div ref={mapRef} className="w-full h-screen">
			OlaMaplibre
		</div>
	);
};

export default OlaMaplibre;
