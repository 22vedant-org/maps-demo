// import { useState, useRef, useEffect } from "react";
// import dynamic from "next/dynamic";
// import "maplibre-gl/dist/maplibre-gl.css";

// // Dynamically import MapLibre components to ensure they run on the client side
// const MapLibreMap = dynamic(() => import("maplibre-gl").then(mod => mod.Map), {
//   ssr: false,
// });
// const NavigationControl = dynamic(
//   () => import("maplibre-gl").then(mod => mod.NavigationControl),
//   { ssr: false }
// );
// const Marker = dynamic(() => import("maplibre-gl").then(mod => mod.Marker), {
//   ssr: false,
// });

// const MapComponent = () => {
//   const [mapReady, setMapReady] = useState(false);
//   const markerRef = useRef(null);

//   useEffect(() => {
//     if (!mapReady || typeof window === "undefined") return;

//     const map = new MapLibreMap({
//       container: "central-map",
//       center: [0, 0],
//       zoom: 0,
//       style:
//         "https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json",
//       transformRequest: (url, resourceType) => {
//         url = url.replace("app.olamaps.io", "api.olamaps.io");

//         if (url.includes("?")) {
//           url = url + "&api_key=EkrQrT7mWoLXhadkgbeBxdgQjCdRoDcmTAqDY3em";
//         } else {
//           url = url + "?api_key=EkrQrT7mWoLXhadkgbeBxdgQjCdRoDcmTAqDY3em";
//         }
//         return { url, resourceType };
//       },
//     });

//     const nav = new NavigationControl({
//       visualizePitch: false,
//       showCompass: true,
//     });

//     map.addControl(nav, "top-left");

//     markerRef.current = new Marker()
//       .setLngLat([88.363895, 22.572646])
//       .addTo(map);

//     map.on("click", (e) => {
//       const { lng, lat } = e.lngLat;
//       markerRef.current.setLngLat([lng, lat]);
//     });

//     return () => {
//       map.remove(); // Cleanup the map on component unmount
//     };
//   }, [mapReady]);

//   return (
//     <div
//       style={{ width: "100vw", height: "100vh", overflow: "hidden" }}
//       id="central-map"
//       ref={() => setMapReady(true)}
//     />
//   );
// };

// export default MapComponent;
