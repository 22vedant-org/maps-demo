'use client';
import OlaMap from '@/components/ola-map';
import React from 'react';
import dynamic from 'next/dynamic';
import OlaMapNew from '@/components/ola-map-new';
import OlaSearch from '@/components/rightSide';

// const MapComponent = dynamic(() => import('@/components/ola-map'), {
// 	ssr: false,
// });

function Home() {
	// return <MapComponent />;
	return (
		<div className="flex flex-1 md:flex-wrap gap-2 md:h-screen">
			<div className="w-[50%]">
				<OlaMapNew />
			</div>
			<div>Hello</div>
			{/* <OlaSearch /> */}
		</div>
	);
}

export default Home;
