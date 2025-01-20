'use client';
import OlaMaplibre from '@/components/ola-maplibre';
import OlaSearch from '@/components/rightSide';
import React from 'react';

function Home() {
	return (
		<div className="flex w-full sm:flex-wrap md:flex-wrap gap-2 md:h-screen">
			<div className="flex-1 justify-center flex items-center flex-col">
				<OlaSearch />
				<OlaSearch />
				<button className="border rounded-md p-3 w-auto mx-auto">
					Find Rides
				</button>
			</div>
			<div className="flex-1">
				{/* <OlaMapNew /> */}
				<OlaMaplibre />
			</div>
		</div>
	);
}

export default Home;
