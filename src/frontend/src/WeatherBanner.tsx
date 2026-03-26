import { CloudRain, Wind } from "lucide-react";
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
          const isStorm = code >= 95;
          setBannerMsg(
            isStorm
              ? "Thunderstorms expected — consider rescheduling or allow extra time."
              : "Rain expected — allow extra travel time and drive carefully.",
          );
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
  const isStorm = message.toLowerCase().includes("thunder");

  return (
    <div
      data-ocid="weather.toast"
      className="relative overflow-hidden flex items-start gap-4 p-4 rounded-2xl border"
      style={{
        background: isStorm
          ? "linear-gradient(135deg, oklch(0.22 0.04 290 / 0.8), oklch(0.18 0.03 280 / 0.8))"
          : "linear-gradient(135deg, oklch(0.2 0.04 235 / 0.8), oklch(0.16 0.03 225 / 0.8))",
        borderColor: isStorm
          ? "oklch(0.6 0.12 290 / 0.4)"
          : "oklch(0.62 0.14 235 / 0.4)",
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Decorative shimmer */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: isStorm
            ? "linear-gradient(90deg, transparent, oklch(0.7 0.12 290 / 0.6), transparent)"
            : "linear-gradient(90deg, transparent, oklch(0.72 0.16 200 / 0.6), transparent)",
        }}
      />

      {/* Icon */}
      <div
        className="shrink-0 flex items-center justify-center rounded-xl"
        style={{
          width: 44,
          height: 44,
          background: isStorm
            ? "oklch(0.55 0.12 290 / 0.2)"
            : "oklch(0.72 0.16 200 / 0.15)",
          border: isStorm
            ? "1px solid oklch(0.6 0.12 290 / 0.3)"
            : "1px solid oklch(0.72 0.16 200 / 0.3)",
        }}
      >
        {isStorm ? (
          <Wind
            style={{
              width: 22,
              height: 22,
              color: isStorm ? "oklch(0.75 0.12 290)" : "oklch(0.78 0.16 200)",
            }}
          />
        ) : (
          <CloudRain
            style={{ width: 22, height: 22, color: "oklch(0.76 0.16 200)" }}
          />
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p
          style={{
            fontWeight: 700,
            fontSize: 13,
            color: isStorm ? "oklch(0.88 0.06 290)" : "oklch(0.88 0.08 200)",
            marginBottom: 3,
          }}
        >
          {isStorm ? "⛈ Storm Warning" : "🌧 Rain Expected"}
        </p>
        <p
          style={{
            fontSize: 13,
            color: isStorm ? "oklch(0.72 0.05 290)" : "oklch(0.72 0.06 220)",
            lineHeight: 1.45,
          }}
        >
          {message}
        </p>
      </div>
    </div>
  );
}
