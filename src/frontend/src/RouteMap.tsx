import { useEffect, useRef } from "react";

interface RouteMapProps {
  routeCoords: [number, number][]; // [lat, lon] pairs
  originLabel: string;
  destLabel: string;
  darkMode: boolean;
}

declare global {
  interface Window {
    L: any;
    _leafletLoaded: boolean;
    _leafletLoading: Promise<void> | null;
  }
}

function loadLeaflet(): Promise<void> {
  if (window._leafletLoaded) return Promise.resolve();
  if (window._leafletLoading) return window._leafletLoading;

  window._leafletLoading = new Promise<void>((resolve) => {
    // Load CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    // Load JS
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => {
      window._leafletLoaded = true;
      resolve();
    };
    document.head.appendChild(script);
  });

  return window._leafletLoading;
}

export function RouteMap({
  routeCoords,
  originLabel,
  destLabel,
  darkMode,
}: RouteMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current || routeCoords.length < 2) return;

    loadLeaflet().then(() => {
      const L = window.L;
      if (!L || !mapContainerRef.current) return;

      // Remove any existing map instance
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: false,
      });
      mapRef.current = map;

      // Use dark or light tile layer
      const tileUrl = darkMode
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

      L.tileLayer(tileUrl, {
        attribution: "© OpenStreetMap contributors © CARTO",
        subdomains: "abcd",
        maxZoom: 20,
      }).addTo(map);

      // Draw the polyline in teal
      const polyline = L.polyline(routeCoords, {
        color: "#06b6d4",
        weight: 4,
        opacity: 0.9,
        lineJoin: "round",
      }).addTo(map);

      // Origin marker (green)
      const originIcon = L.divIcon({
        className: "",
        html: `<div style="
          width: 28px; height: 28px;
          background: linear-gradient(135deg, #10b981, #059669);
          border: 2.5px solid #fff;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 3px 10px rgba(0,0,0,0.35);
          display: flex; align-items: center; justify-content: center;
        "><div style="
          width: 8px; height: 8px;
          background: #fff;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -30],
      });

      // Destination marker (teal/orange)
      const destIcon = L.divIcon({
        className: "",
        html: `<div style="
          width: 28px; height: 28px;
          background: linear-gradient(135deg, #f97316, #ea580c);
          border: 2.5px solid #fff;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 3px 10px rgba(0,0,0,0.35);
          display: flex; align-items: center; justify-content: center;
        "><div style="
          width: 8px; height: 8px;
          background: #fff;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -30],
      });

      const originLatLng = routeCoords[0];
      const destLatLng = routeCoords[routeCoords.length - 1];

      L.marker(originLatLng, { icon: originIcon })
        .addTo(map)
        .bindPopup(`<b>🟢 Departure</b><br>${originLabel}`, { maxWidth: 200 });

      L.marker(destLatLng, { icon: destIcon })
        .addTo(map)
        .bindPopup(`<b>🎯 Destination</b><br>${destLabel}`, { maxWidth: 200 });

      // Fit map to route bounds with padding
      map.fitBounds(polyline.getBounds(), { padding: [24, 24] });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [routeCoords, originLabel, destLabel, darkMode]);

  return (
    <section data-ocid="route_map.section">
      {/* Badge header */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
          style={{
            background: "oklch(var(--brand) / 0.15)",
            border: "1px solid oklch(var(--brand) / 0.35)",
            color: "oklch(var(--brand))",
          }}
        >
          <span>🗺️</span> Best Route
        </span>
        <span className="text-xs text-muted-foreground">
          Tap to explore the route
        </span>
      </div>

      {/* Map card */}
      <div
        data-ocid="route_map.card"
        className="relative overflow-hidden rounded-2xl"
        style={{
          height: "260px",
          border: darkMode
            ? "1px solid rgba(6, 182, 212, 0.25)"
            : "1px solid rgba(6, 182, 212, 0.5)",
          boxShadow: darkMode
            ? "0 4px 24px rgba(6, 182, 212, 0.1), 0 1px 4px rgba(0,0,0,0.3)"
            : "0 4px 24px rgba(6, 182, 212, 0.15), 0 1px 4px rgba(0,0,0,0.08)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />

        {/* Corner attribution overlay */}
        <div
          className="absolute bottom-2 right-2 text-[10px] rounded-md px-1.5 py-0.5 pointer-events-none z-[1000]"
          style={{
            background: darkMode
              ? "rgba(10,14,26,0.75)"
              : "rgba(255,255,255,0.8)",
            color: darkMode ? "#94a3b8" : "#64748b",
          }}
        >
          © OpenStreetMap
        </div>
      </div>
    </section>
  );
}
