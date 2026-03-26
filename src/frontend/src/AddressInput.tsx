import { Bookmark, BookmarkCheck, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Suggestion {
  displayName: string;
  subtitle: string;
  lat: number;
  lon: number;
}

export interface SavedAddress {
  id: string;
  label: string;
  address: string;
  lat?: number;
  lon?: number;
  fieldType?: "from" | "to";
}

export interface AddressInputProps {
  value: string;
  onChange: (value: string) => void;
  onCoordinatesSelected?: (lat: number, lon: number) => void;
  placeholder?: string;
  error?: string;
  "data-ocid"?: string;
  rightElement?: React.ReactNode;
  savedAddresses?: SavedAddress[];
  onSaveAddress?: (
    address: string,
    label: string,
    lat?: number,
    lon?: number,
  ) => void;
  onSelectSaved?: (saved: SavedAddress) => void;
  onDeleteSaved?: (id: string) => void;
  currentCoords?: { lat: number; lon: number };
  structured?: boolean;
}

async function fetchSuggestions(query: string): Promise<Suggestion[]> {
  const encoded = encodeURIComponent(query);

  // Run Nominatim (India-biased) and Photon in parallel for best coverage
  const nominatimPromise = fetch(
    `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=8&addressdetails=1&namedetails=1&countrycodes=in&accept-language=en`,
    { headers: { "Accept-Language": "en" } },
  )
    .then((res) => {
      if (!res.ok) throw new Error("nominatim failed");
      return res.json();
    })
    .then((data: any[]) =>
      (data || []).map((item: any) => {
        const addr = item.address || {};
        const namedetails = item.namedetails || {};
        // Prefer the most specific name: amenity > building > railway > road
        const main =
          addr.amenity ||
          addr.building ||
          addr.railway ||
          addr.aeroway ||
          addr.hospital ||
          addr.school ||
          addr.college ||
          addr.university ||
          namedetails["name:en"] ||
          namedetails.name ||
          addr.road ||
          addr.suburb ||
          item.display_name.split(",")[0].trim();
        const area =
          addr.neighbourhood ||
          addr.suburb ||
          addr.quarter ||
          addr.district ||
          addr.county ||
          "";
        const city =
          addr.city || addr.town || addr.village || addr.state_district || "";
        const sub = [area, city].filter(Boolean).join(", ");
        return {
          displayName: main,
          subtitle: sub,
          lat: Number.parseFloat(item.lat),
          lon: Number.parseFloat(item.lon),
        };
      }),
    )
    .catch(() => [] as Suggestion[]);

  const photonPromise = fetch(
    `https://photon.komoot.io/api/?q=${encoded}&limit=5&lang=en`,
  )
    .then((res) => {
      if (!res.ok) throw new Error("photon failed");
      return res.json();
    })
    .then((data: any) =>
      (data.features || []).map((f: any) => {
        const p = f.properties || {};
        const main = p.name || p.street || query;
        const area =
          p.neighbourhood || p.district || p.suburb || p.county || "";
        const city = p.city || p.town || p.village || "";
        const sub = [area, city].filter(Boolean).join(", ");
        const [lon, lat] = f.geometry?.coordinates || [0, 0];
        return { displayName: main, subtitle: sub, lat, lon };
      }),
    )
    .catch(() => [] as Suggestion[]);

  const [nominatimResults, photonResults] = await Promise.all([
    nominatimPromise,
    photonPromise,
  ]);

  // Merge: Nominatim first (India-biased), then Photon extras
  // Deduplicate by proximity (~100m = ~0.001 degrees)
  const all = [...nominatimResults, ...photonResults];
  const deduped: Suggestion[] = [];
  for (const item of all) {
    const isDuplicate = deduped.some(
      (d) =>
        Math.abs(d.lat - item.lat) < 0.001 &&
        Math.abs(d.lon - item.lon) < 0.001,
    );
    if (!isDuplicate) deduped.push(item);
  }
  return deduped.slice(0, 7);
}

const LABEL_PRESETS = [
  { key: "home", label: "Home", emoji: "🏠" },
  { key: "work", label: "Work", emoji: "💼" },
  { key: "other", label: "Other", emoji: "📍" },
];

function SavePopover({
  onSave,
  onClose,
  limitReached,
}: {
  onSave: (label: string) => void;
  onClose: () => void;
  limitReached: boolean;
}) {
  const [selected, setSelected] = useState<string>("home");
  const [customLabel, setCustomLabel] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  function handleSave() {
    const label =
      selected === "other"
        ? customLabel.trim() || "Other"
        : (LABEL_PRESETS.find((p) => p.key === selected)?.label ?? "Home");
    onSave(label);
  }

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 z-50 bg-card border border-border rounded-xl shadow-2xl p-4 w-64"
      data-ocid="address.save_popover"
    >
      {limitReached ? (
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground mb-1">
            Limit Reached
          </p>
          <p className="text-xs text-muted-foreground">
            You can save up to 5 addresses. Remove one to add more.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-3 text-xs font-medium text-brand hover:underline"
          >
            Close
          </button>
        </div>
      ) : (
        <>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Save as
          </p>
          <div className="flex gap-2 mb-3">
            {LABEL_PRESETS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setSelected(p.key)}
                className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-lg border text-xs font-medium transition-all ${
                  selected === p.key
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-border bg-secondary/30 text-muted-foreground hover:border-brand/50"
                }`}
                data-ocid={`address.save_label_${p.key}.button`}
              >
                <span className="text-base">{p.emoji}</span>
                {p.label}
              </button>
            ))}
          </div>
          {selected === "other" && (
            <input
              type="text"
              placeholder="Custom label..."
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              className="w-full h-8 rounded-md border border-border bg-input px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring mb-3"
              data-ocid="address.save_custom_label.input"
              // biome-ignore lint/a11y/noAutofocus: intentional for popover UX
              autoFocus
            />
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-8 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:bg-secondary/50 transition-colors"
              data-ocid="address.save_cancel.button"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 h-8 rounded-lg bg-brand text-primary-foreground text-xs font-semibold hover:bg-brand/90 transition-colors"
              data-ocid="address.save_confirm.button"
            >
              Save
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function getLabelEmoji(label: string): string {
  const lower = label.toLowerCase();
  if (lower === "home") return "🏠";
  if (lower === "work") return "💼";
  return "📍";
}

type SharedProps = Omit<AddressInputProps, "structured" | "placeholder">;

function SavedChips({
  savedAddresses,
  onSelectSaved,
  onDeleteSaved,
}: {
  savedAddresses: SavedAddress[];
  onSelectSaved?: (saved: SavedAddress) => void;
  onDeleteSaved?: (id: string) => void;
}) {
  if (savedAddresses.length === 0) return null;
  return (
    <div
      className="flex gap-1.5 overflow-x-auto pb-1.5 mb-2 scrollbar-hide"
      data-ocid="address.saved_chips.list"
    >
      {savedAddresses.map((saved, idx) => (
        <button
          key={saved.id}
          type="button"
          data-ocid={`address.saved_chip.${idx + 1}`}
          className="flex items-center gap-1 shrink-0 pl-2.5 pr-1 py-1 rounded-full border border-border bg-secondary/40 hover:border-brand/50 hover:bg-brand/5 transition-all cursor-pointer"
          onClick={() => onSelectSaved?.(saved)}
        >
          <span className="text-xs">{getLabelEmoji(saved.label)}</span>
          <span className="text-xs font-medium text-foreground max-w-[80px] truncate">
            {saved.label}
          </span>
          <button
            type="button"
            data-ocid={`address.saved_delete.${idx + 1}`}
            onClick={(e) => {
              e.stopPropagation();
              onDeleteSaved?.(saved.id);
            }}
            className="w-4 h-4 flex items-center justify-center rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors ml-0.5"
            title={`Remove ${saved.label}`}
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </button>
      ))}
    </div>
  );
}

// Parse combined address string into 4 parts
function parseParts(value: string): [string, string, string, string] {
  const parts = value.split(", ");
  return [parts[0] ?? "", parts[1] ?? "", parts[2] ?? "", parts[3] ?? ""];
}

function combineParts(b: string, s: string, a: string, c: string): string {
  return [b, s, a, c].filter(Boolean).join(", ");
}

// Structured 4-field address input
function StructuredAddressInput({
  value,
  onChange,
  onCoordinatesSelected,
  error,
  "data-ocid": dataOcid,
  rightElement,
  savedAddresses = [],
  onSaveAddress,
  onSelectSaved,
  onDeleteSaved,
  currentCoords,
}: SharedProps) {
  const [building, setBuilding] = useState(() => parseParts(value)[0]);
  const [street, setStreet] = useState(() => parseParts(value)[1]);
  const [area, setArea] = useState(() => parseParts(value)[2]);
  const [city, setCity] = useState(() => parseParts(value)[3]);

  const [areaSuggestions, setAreaSuggestions] = useState<Suggestion[]>([]);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const [areaHighlightIdx, setAreaHighlightIdx] = useState(-1);
  const [showSavePopover, setShowSavePopover] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const justSelectedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastCoordsRef = useRef<{ lat: number; lon: number } | undefined>(
    currentCoords,
  );
  const prevValueRef = useRef(value);

  useEffect(() => {
    lastCoordsRef.current = currentCoords;
  }, [currentCoords]);

  // Sync external value changes (e.g. saved address chip tapped)
  useEffect(() => {
    if (value !== prevValueRef.current) {
      prevValueRef.current = value;
      const [b, s, a, c] = parseParts(value);
      setBuilding(b);
      setStreet(s);
      setArea(a);
      setCity(c);
    }
  }, [value]);

  function emit(b: string, s: string, a: string, c: string) {
    const combined = combineParts(b, s, a, c);
    prevValueRef.current = combined;
    onChange(combined);
  }

  // Area autocomplete
  useEffect(() => {
    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }
    if (area.length < 3) {
      setAreaSuggestions([]);
      setShowAreaDropdown(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const results = await fetchSuggestions(area);
      setAreaSuggestions(results);
      setShowAreaDropdown(results.length > 0);
      setAreaHighlightIdx(-1);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [area]);

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowAreaDropdown(false);
        setShowSavePopover(false);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  function selectAreaSuggestion(s: Suggestion) {
    justSelectedRef.current = true;
    const subtitleParts = s.subtitle.split(", ");
    const newArea = subtitleParts[0] || s.displayName;
    const newCity = subtitleParts[1] || subtitleParts[0] || "";
    setArea(newArea);
    setCity(newCity);
    setShowAreaDropdown(false);
    setAreaSuggestions([]);
    onCoordinatesSelected?.(s.lat, s.lon);
    lastCoordsRef.current = { lat: s.lat, lon: s.lon };
    emit(building, street, newArea, newCity);
  }

  function handleAreaKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showAreaDropdown) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setAreaHighlightIdx((i) => Math.min(i + 1, areaSuggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setAreaHighlightIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && areaHighlightIdx >= 0) {
      e.preventDefault();
      selectAreaSuggestion(areaSuggestions[areaHighlightIdx]);
    } else if (e.key === "Escape") {
      setShowAreaDropdown(false);
    }
  }

  const combinedValue = combineParts(building, street, area, city);
  const isSaved = savedAddresses.some(
    (s) => s.address === combinedValue.trim(),
  );
  const limitReached = savedAddresses.length >= 5;

  const inputCls =
    "flex h-9 w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1";

  return (
    <div ref={containerRef} className="relative">
      <SavedChips
        savedAddresses={savedAddresses}
        onSelectSaved={onSelectSaved}
        onDeleteSaved={onDeleteSaved}
      />

      <div className="grid grid-cols-2 gap-2">
        {/* Building */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Building
          </span>
          <input
            type="text"
            value={building}
            onChange={(e) => {
              setBuilding(e.target.value);
              emit(e.target.value, street, area, city);
            }}
            placeholder="Building / Block no."
            className={inputCls}
            data-ocid={dataOcid ? `${dataOcid}_building` : undefined}
          />
        </div>

        {/* Street */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Street
          </span>
          <input
            type="text"
            value={street}
            onChange={(e) => {
              setStreet(e.target.value);
              emit(building, e.target.value, area, city);
            }}
            placeholder="Street name"
            className={inputCls}
            data-ocid={dataOcid ? `${dataOcid}_street` : undefined}
          />
        </div>

        {/* Area with autocomplete */}
        <div className="flex flex-col gap-1 relative">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Area
          </span>
          <input
            type="text"
            value={area}
            onChange={(e) => {
              setArea(e.target.value);
              emit(building, street, e.target.value, city);
            }}
            onKeyDown={handleAreaKeyDown}
            placeholder="Area / Neighbourhood"
            className={inputCls}
            data-ocid={dataOcid ? `${dataOcid}_area` : undefined}
          />
          {showAreaDropdown && areaSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
              {areaSuggestions.map((s, i) => (
                <div
                  key={`area-${s.lat}-${s.lon}-${i}`}
                  className={`px-3 py-2.5 cursor-pointer transition-colors ${
                    i === areaHighlightIdx
                      ? "bg-secondary"
                      : "hover:bg-secondary"
                  }`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectAreaSuggestion(s);
                  }}
                >
                  <div className="text-xs font-medium text-foreground">
                    {s.subtitle || s.displayName}
                  </div>
                  {s.subtitle && (
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {s.displayName}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* City + bookmark/right element */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              City
            </span>
            <div className="flex items-center gap-1">
              {combinedValue.trim() && onSaveAddress && (
                <button
                  type="button"
                  data-ocid="address.save_bookmark.button"
                  onClick={() => setShowSavePopover((v) => !v)}
                  className={`transition-colors ${
                    showSavePopover || isSaved
                      ? "text-brand"
                      : "text-muted-foreground hover:text-brand"
                  }`}
                  title={isSaved ? "Already saved" : "Save this address"}
                >
                  {isSaved ? (
                    <BookmarkCheck className="w-3.5 h-3.5 text-brand" />
                  ) : (
                    <Bookmark className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
              {rightElement && <div>{rightElement}</div>}
            </div>
          </div>
          <input
            type="text"
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              emit(building, street, area, e.target.value);
            }}
            placeholder="City"
            className={inputCls}
            data-ocid={dataOcid ? `${dataOcid}_city` : undefined}
          />
        </div>
      </div>

      {error && <p className="text-xs text-destructive mt-1">{error}</p>}

      {showSavePopover && (
        <SavePopover
          limitReached={limitReached}
          onSave={(label) => {
            onSaveAddress?.(
              combinedValue.trim(),
              label,
              lastCoordsRef.current?.lat,
              lastCoordsRef.current?.lon,
            );
            setShowSavePopover(false);
          }}
          onClose={() => setShowSavePopover(false)}
        />
      )}
    </div>
  );
}

// Single-field address input (original mode)
function SingleAddressInput({
  value,
  onChange,
  onCoordinatesSelected,
  placeholder,
  error,
  "data-ocid": dataOcid,
  rightElement,
  savedAddresses = [],
  onSaveAddress,
  onSelectSaved,
  onDeleteSaved,
  currentCoords,
}: AddressInputProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const [showSavePopover, setShowSavePopover] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const justSelectedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastCoordsRef = useRef<{ lat: number; lon: number } | undefined>(
    currentCoords,
  );

  useEffect(() => {
    lastCoordsRef.current = currentCoords;
  }, [currentCoords]);

  useEffect(() => {
    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }
    if (value.length < 2) {
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
        setShowSavePopover(false);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  function selectSuggestion(s: Suggestion) {
    justSelectedRef.current = true;
    onChange(s.displayName + (s.subtitle ? `, ${s.subtitle}` : ""));
    onCoordinatesSelected?.(s.lat, s.lon);
    lastCoordsRef.current = { lat: s.lat, lon: s.lon };
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

  const isSaved = savedAddresses.some((s) => s.address === value.trim());
  const limitReached = savedAddresses.length >= 5;

  return (
    <div ref={containerRef} className="relative">
      <SavedChips
        savedAddresses={savedAddresses}
        onSelectSaved={onSelectSaved}
        onDeleteSaved={onDeleteSaved}
      />

      <div className="relative">
        <input
          data-ocid={dataOcid}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`flex h-10 w-full rounded-md border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
            rightElement || (value && onSaveAddress) ? "pr-16" : ""
          } ${error ? "border-destructive" : "border-border"}`}
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {value.trim() && onSaveAddress && (
            <button
              type="button"
              data-ocid="address.save_bookmark.button"
              onClick={() => setShowSavePopover((v) => !v)}
              className={`transition-colors ${
                showSavePopover || isSaved
                  ? "text-brand"
                  : "text-muted-foreground hover:text-brand"
              }`}
              title={isSaved ? "Already saved" : "Save this address"}
            >
              {isSaved ? (
                <BookmarkCheck className="w-4 h-4 text-brand" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>
          )}
          {rightElement && <div>{rightElement}</div>}
        </div>
      </div>

      {error && <p className="text-xs text-destructive mt-1">{error}</p>}

      {showSavePopover && (
        <SavePopover
          limitReached={limitReached}
          onSave={(label) => {
            onSaveAddress?.(
              value.trim(),
              label,
              lastCoordsRef.current?.lat,
              lastCoordsRef.current?.lon,
            );
            setShowSavePopover(false);
          }}
          onClose={() => setShowSavePopover(false)}
        />
      )}

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

export function AddressInput({
  structured = false,
  ...props
}: AddressInputProps) {
  if (structured) {
    return <StructuredAddressInput {...props} />;
  }
  return <SingleAddressInput {...props} />;
}
