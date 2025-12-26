import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    google: any;
    gm_authFailure: () => void;
  }
}

const TrafficMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Global handler for Google Maps Auth Failure (Invalid Key)
    window.gm_authFailure = () => {
      console.error("Google Maps API Authentication Error");
      setError("Invalid API Key. Please check your Google Maps API configuration.");
    };

    const loadMap = () => {
      if (!mapRef.current || !window.google) return;

      try {
        const center = { lat: 17.4435, lng: 78.3772 }; 
        const map = new window.google.maps.Map(mapRef.current, {
          center: center,
          zoom: 14,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          styles: [
            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
            { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
            { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
            { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
            { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
            { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
            { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
            { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
            { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
            { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
            { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
            { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
            { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
            { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
            { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
            { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] },
          ],
        });

        const trafficLayer = new window.google.maps.TrafficLayer();
        trafficLayer.setMap(map);
      } catch (err) {
        console.error("Map initialization error:", err);
        setError("Error initializing map interface.");
      }
    };

    // Check if script exists to avoid duplicates (React StrictMode double-mount issue)
    const scriptId = 'google-maps-script';
    const existingScript = document.getElementById(scriptId) as HTMLScriptElement;

    if (!window.google) {
      if (!existingScript) {
        const script = document.createElement('script');
        script.id = scriptId;
        // Ensure API KEY is treated safely
        const apiKey = process.env.API_KEY || '';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = loadMap;
        script.onerror = () => setError("Failed to load Google Maps script. Network error or blocked.");
        document.head.appendChild(script);
      } else {
        // If script exists but google object isn't ready yet, wait for load
        existingScript.addEventListener('load', loadMap);
      }
    } else {
      loadMap();
    }

    return () => {
      if (existingScript) {
        existingScript.removeEventListener('load', loadMap);
      }
      // Clean up global handler
      window.gm_authFailure = () => {};
    };
  }, []);

  if (error) {
    return (
      <div className="w-full h-full rounded-xl overflow-hidden border border-red-900/50 shadow-2xl relative bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
         <div className="bg-red-500/10 p-4 rounded-full mb-4">
             <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
             </svg>
         </div>
         <h3 className="text-red-400 font-bold text-lg mb-2">Map Load Error</h3>
         <p className="text-slate-400 text-sm max-w-xs">{error}</p>
         <p className="text-slate-500 text-xs mt-4">Verify your API Key has "Maps JavaScript API" enabled in Google Cloud Console.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-slate-700 shadow-2xl relative bg-slate-900">
       <div ref={mapRef} className="w-full h-full" />
       {/* Overlay Badge */}
       <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur border border-slate-700 px-3 py-1.5 rounded-lg shadow-lg z-10 pointer-events-none">
          <div className="flex items-center gap-2">
             <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
             </span>
             <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Live Traffic • Hitech City</span>
          </div>
       </div>
    </div>
  );
};

export default TrafficMap;