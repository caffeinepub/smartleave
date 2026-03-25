import { CloudRain } from "lucide-react";
import { useEffect, useState } from "react";

interface WeatherBannerProps {
  lat: number;
  lon: number;
  tripDate: string;
  message: string;
}

export function useWeather(
  coords: { lat: number; lon: number } | null,
  tripDate: string,
) {
  const [showBanner, setShowBanner] = useState(false);
  const [bannerMsg, setBannerMsg] = useState("");

  useEffect(() => {
    if (!coords) return;
    let cancelled = false;

    async function fetchWeather() {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords!.lat}&longitude=${coords!.lon}&daily=precipitation_sum,weathercode&timezone=auto&forecast_days=7`;
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        const dates: string[] = data?.daily?.time || [];
        const codes: number[] = data?.daily?.weathercode || [];
        const precip: number[] = data?.daily?.precipitation_sum || [];
        const idx = dates.indexOf(tripDate);
        if (idx === -1) return;
        const code = codes[idx] ?? 0;
        const rain = precip[idx] ?? 0;
        if (!cancelled && (code >= 51 || rain > 1)) {
          setBannerMsg("🌧 Rain expected — allow extra travel time.");
          setShowBanner(true);
        }
      } catch {
        // silent fail
      }
    }

    fetchWeather();
    return () => {
      cancelled = true;
    };
  }, [coords, tripDate]);

  return { showBanner, bannerMsg };
}

export function WeatherBanner({
  message,
}: Pick<WeatherBannerProps, "message">) {
  return (
    <div
      data-ocid="weather.toast"
      className="flex items-center gap-3 p-3 rounded-xl border border-blue-400/30 bg-blue-400/10 text-blue-300 text-sm"
    >
      <CloudRain className="w-4 h-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
