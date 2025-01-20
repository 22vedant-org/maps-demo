'use client';
import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import axios from 'axios';
import { create } from 'zustand';

// TypeScript interfaces for the component
interface Location {
	name: string;
	address: string;
	latitude: number;
	longitude: number;
	placeId: string;
}

interface GeocodeResult {
	formatted_address: string;
	place_id: string;
	geometry: {
		location: {
			lat: number;
			lng: number;
		};
	};
	address_components: {
		long_name: string;
		short_name: string;
		types: string[];
	}[];
}

const OlaSearch = () => {
	const [query, setQuery] = useState('');
	const [geocodeResults, setGeocodeResults] = useState<GeocodeResult[]>([]);
	const [loading, setLoading] = useState(false);
	const [selected, setSelected] = useState<Location | null>(null);

	const forwardGeocoding = async (searchQuery: string) => {
		if (!searchQuery) {
			setGeocodeResults([]);
			return;
		}

		setLoading(true);
		try {
			const response = await axios.get(
				'https://api.olamaps.io/places/v1/geocode',
				{
					params: {
						api_key: process.env.NEXT_PUBLIC_OLA_API_KEY,
						address: searchQuery,
					},
				}
			);

			setGeocodeResults(response.data.geocodingResults || []);
		} catch (error) {
			console.error('Geocoding error:', error);
			setGeocodeResults([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			if (query) {
				forwardGeocoding(query);
			}
		}, 500);

		return () => clearTimeout(timeoutId);
	}, [query]);

	const handleSelectLocation = (result: GeocodeResult) => {
		const location: Location = {
			name: result.formatted_address,
			address: result.formatted_address,
			latitude: result.geometry.location.lat,
			longitude: result.geometry.location.lng,
			placeId: result.place_id,
		};

		setSelected(location);
		setQuery(location.name);
		setGeocodeResults([]);
	};

	return (
		<div className="relative w-full max-w-md">
			<div className="relative my-2">
				<input
					type="text"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="Search for a location..."
					className="w-full p-2 pl-10 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
				/>
				<Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
			</div>

			{loading && (
				<div className="absolute w-full mt-1 p-2 bg-white border rounded-md shadow-lg">
					Loading...
				</div>
			)}

			{geocodeResults.length > 0 && (
				<ul className="absolute w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto z-50">
					{geocodeResults.map((result, index) => (
						<li
							key={result.place_id || index}
							onClick={() => handleSelectLocation(result)}
							className="p-2 hover:bg-gray-100 cursor-pointer"
						>
							<div className="font-medium text-black">
								{result.formatted_address}
							</div>
							<div className="text-sm text-gray-600">
								{result.address_components
									.map((component) => component.long_name)
									.join(', ')}
							</div>
						</li>
					))}
				</ul>
			)}

			{selected && (
				<div className="mt-4">
					<h3 className="font-medium">Selected Location:</h3>
					<p className="text-sm text-gray-600">{selected.name}</p>
					<p className="text-sm text-gray-600">
						({selected.latitude}, {selected.longitude})
					</p>
				</div>
			)}
		</div>
	);
};

export default OlaSearch;
