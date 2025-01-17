'use client';
import OlaMaplibre from '@/components/ola-maplibre';
import React from 'react';

function Home() {
	return (
		<div className="flex flex-1 md:flex-wrap gap-2 md:h-screen">
			<div className="w-[50%]">
				{/* <OlaMapNew /> */}
				<OlaMaplibre />
			</div>
			<div>Hello</div>
		</div>
	);
}

export default Home;
