'use client';

import { useEffect, useState, useRef } from 'react';
import { OlaMaps } from '@/OlaMapsWebSDKNew';

export default function OlaMap() {
	const mapRef = useRef(null);
	const [mapReady, setMapReady] = useState(false);
	const [mapInstance, setMapInstance] = useState(null);

	useEffect(() => {
		if (!mapRef.current) return;
		setMapReady(true);
	}, []);

	useEffect(() => {
		if (!mapReady) return;

		const olaMaps = new OlaMaps({
			apiKey: process.env.NEXT_PUBLIC_OLA_API_KEY as string,
		});

		const myMap = olaMaps.init({
			style: 'https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json',
			container: mapRef.current!,
			center: [77.61648476788898, 12.931423492103944],
			zoom: 15,
		});

		// setMapInstance(myMap);

		return () => {
			if (myMap) {
				myMap.remove();
			}
		};
	}, [mapReady]);
	return <div ref={mapRef} className="w-full h-full overflow-hidden"></div>;
}
