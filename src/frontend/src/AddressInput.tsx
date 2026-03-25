import { useEffect, useRef, useState } from "react";

interface Suggestion {
  displayName: string;
  subtitle: string;
  lat: number;
  lon: number;
}

interface AddressInputProps {
  value: string;
  onChange: (value: string) => void;
  onCoordinatesSelected?: (lat: number, lon: number) => void;
  placeholder?: string;
  error?: string;
  "data-ocid"?: string;
  rightElement?: React.ReactNode;
}

async function fetchSuggestions(query: string): Promise<Suggestion[]> {
  const encoded = encodeURIComponent(query);
  try {
    const res = await fetch(
      `https://photon.komoot.io/api/?q=${encoded}&limit=5`,
    );
    if (!res.ok) throw new Error("photon failed");
    const data = await res.json();
    return (data.features || []).map((f: any) => {
      const p = f.properties || {};
      const main = p.name || p.street || query;
      // Show area-level: neighbourhood / district / suburb + city
      const area = p.neighbourhood || p.district || p.suburb || p.county || "";
      const city = p.city || p.town || p.village || "";
      const sub = [area, city].filter(Boolean).join(", ");
      const [lon, lat] = f.geometry?.coordinates || [0, 0];
      return { displayName: main, subtitle: sub, lat, lon };
    });
  } catch {
    // fallback to nominatim
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=5&addressdetails=1`,
      );
      const data = await res.json();
      return (data || []).map((item: any) => {
        const addr = item.address || {};
        const main =
          addr.road || addr.suburb || item.display_name.split(",")[0];
        // Show area-level: neighbourhood / suburb / district + city
        const area =
          addr.neighbourhood ||
          addr.suburb ||
          addr.quarter ||
          addr.district ||
          addr.county ||
          "";
        const city = addr.city || addr.town || addr.village || "";
        const sub = [area, city].filter(Boolean).join(", ");
        return {
          displayName: main,
          subtitle: sub,
          lat: Number.parseFloat(item.lat),
          lon: Number.parseFloat(item.lon),
        };
      });
    } catch {
      return [];
    }
  }
}

export function AddressInput({
  value,
  onChange,
  onCoordinatesSelected,
  placeholder,
  error,
  "data-ocid": dataOcid,
  rightElement,
}: AddressInputProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const justSelectedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }
    if (value.length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const results = await fetchSuggestions(value);
      setSuggestions(results);
      setShowDropdown(results.length > 0);
      setHighlightIdx(-1);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  function selectSuggestion(s: Suggestion) {
    justSelectedRef.current = true;
    onChange(s.displayName + (s.subtitle ? `, ${s.subtitle}` : ""));
    onCoordinatesSelected?.(s.lat, s.lon);
    setShowDropdown(false);
    setSuggestions([]);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showDropdown) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && highlightIdx >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[highlightIdx]);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          data-ocid={dataOcid}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`flex h-10 w-full rounded-md border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
            rightElement ? "pr-10" : ""
          } ${error ? "border-destructive" : "border-border"}`}
        />
        {rightElement && (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
          {suggestions.map((s, i) => (
            <div
              key={`${s.lat}-${s.lon}-${i}`}
              className={`px-4 py-3 cursor-pointer transition-colors ${
                i === highlightIdx ? "bg-secondary" : "hover:bg-secondary"
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                selectSuggestion(s);
              }}
            >
              <div className="text-sm font-medium text-foreground">
                {s.displayName}
              </div>
              {s.subtitle && (
                <div className="text-xs text-muted-foreground mt-0.5">
                  {s.subtitle}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
