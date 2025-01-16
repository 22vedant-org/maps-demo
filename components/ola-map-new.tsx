'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import polyline from '@mapbox/polyline';
export default function OlaMapNew() {
	const [markerPositions, setMarkerPositions] = useState({
		markerA: { lng: 73.847466, lat: 18.530823 },
		markerB: { lng: 73.8547, lat: 18.4655 },
	});
	``;
	const mapRef = useRef<HTMLDivElement>(null);
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
				return response.data;
			} catch (error: any) {
				console.error(error);
				throw error;
			}
		},
		[]
	);

	useEffect(() => {
		// Ensure this runs only in the browser
		if (typeof window === 'undefined' || !mapRef.current) return;

		// Dynamically import the OlaMaps SDK only on the client side
		(async () => {
			const { OlaMaps } = await import('@/OlaMapsWebSDKNew');

			const olaMaps = new OlaMaps({
				apiKey: process.env.NEXT_PUBLIC_OLA_API_KEY as string,
			});

			const myMap = olaMaps.init({
				style: 'https://api.olamaps.io/tiles/vector/v1/styles/default-dark-standard/style.json',
				container: mapRef.current!,
				center: [73.847466, 18.530823],
				zoom: 15,
				attributionControl: false,
			});

			const markerA = olaMaps
				.addMarker({
					// offset: [0, -25],
					anchor: 'bottom',
					color: 'red',
					draggable: true,
				})
				.setLngLat([
					markerPositions.markerA.lng,
					markerPositions.markerA.lat,
				])
				.addTo(myMap);

			const markerB = olaMaps
				.addMarker({
					offset: [0, -50],
					anchor: 'top',
					color: 'blue',
					draggable: true,
				})
				.setLngLat([
					markerPositions.markerB.lng,
					markerPositions.markerB.lat,
				])
				.addTo(myMap);

			const geolocate = olaMaps.addGeolocateControls({
				positionOptions: {
					enableHighAccuracy: true,
				},
				trackUserLocation: true,
			});

			myMap.addControl(geolocate);
			// myMap.addControl(new myMap

			myMap.on('load', () => {
				geolocate.trigger();
			});

			async function onDragA() {
				const lngLat = markerA.getLngLat();
				const newPositions = {
					markerA: { lng: lngLat.lng, lat: lngLat.lat },
					markerB: markerPositions.markerB,
				};
				sendParamsOla(newPositions).catch((error) => {
					console.log(
						'Error updating route after marker A drag',
						error
					);
				});
			}
			async function onDragB() {
				const lngLat = markerB.getLngLat();
				const newPositions = {
					// markerA: { lng: lngLat.lng, lat: lngLat.lat },
					markerA: markerPositions.markerB,
					markerB: { lng: lngLat.lng, lat: lngLat.lat },
				};
				sendParamsOla(newPositions).catch((error) => {
					console.log(
						'Error updating route after marker B drag',
						error
					);
				});
				// console.log(lngLat);
			}
			markerA.on('dragend', onDragA);
			markerB.on('dragend', onDragB);
			return () => {
				myMap.remove();
			};
		})();
	}, []);

	return <div ref={mapRef} className="w-full h-screen"></div>;
}
