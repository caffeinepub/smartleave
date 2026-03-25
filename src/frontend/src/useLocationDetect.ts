import { useState } from "react";

export type LocStatus = "idle" | "detecting" | "success";

async function fetchWithTimeout(
  url: string,
  timeoutMs = 5000,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetchWithTimeout(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      8000,
    );
    const data = await res.json();
    const addr = data.address || {};
    const parts = [
      addr.road,
      addr.suburb || addr.neighbourhood,
      addr.city || addr.town || addr.village,
    ].filter(Boolean);
    return parts.length > 0
      ? parts.join(", ")
      : data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  }
}

async function getLocationViaIP(): Promise<{
  lat: number;
  lon: number;
  label: string;
} | null> {
  const apis = [
    async () => {
      const r = await fetchWithTimeout("https://ipapi.co/json/");
      const d = await r.json();
      if (d.latitude && d.longitude)
        return { lat: d.latitude, lon: d.longitude };
      return null;
    },
    async () => {
      const r = await fetchWithTimeout(
        "https://ip-api.com/json/?fields=lat,lon,city,regionName",
      );
      const d = await r.json();
      if (d.lat && d.lon) return { lat: d.lat, lon: d.lon };
      return null;
    },
    async () => {
      const r = await fetchWithTimeout("https://ipwho.is/");
      const d = await r.json();
      if (d.latitude && d.longitude)
        return { lat: d.latitude, lon: d.longitude };
      return null;
    },
  ];

  for (const api of apis) {
    try {
      const coords = await api();
      if (coords) {
        const address = await reverseGeocode(coords.lat, coords.lon);
        return { lat: coords.lat, lon: coords.lon, label: address };
      }
    } catch {
      // try next
    }
  }
  return null;
}

export function useLocationDetect() {
  const [status, setStatus] = useState<LocStatus>("idle");

  function detect(
    setAddress: (addr: string) => void,
    onToast: (msg: string) => void,
  ) {
    setStatus("detecting");

    const tryIP = async () => {
      const result = await getLocationViaIP();
      if (result) {
        setAddress(result.label);
        onToast(`📍 ${result.label} · via IP`);
        setStatus("success");
        setTimeout(() => setStatus("idle"), 2000);
      } else {
        setAddress("");
        onToast("Could not detect location. Please type your address.");
        setStatus("idle");
      }
    };

    if (window.location.protocol !== "file:" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          const address = await reverseGeocode(latitude, longitude);
          setAddress(address);
          onToast(`📍 ${address} · ~${Math.round(accuracy)}m`);
          setStatus("success");
          setTimeout(() => setStatus("idle"), 2000);
        },
        () => {
          tryIP();
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    } else {
      tryIP();
    }
  }

  return { status, detect };
}
