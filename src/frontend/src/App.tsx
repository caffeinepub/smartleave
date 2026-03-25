import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import {
  ArrowRight,
  Bell,
  Bike,
  Briefcase,
  Calendar,
  Car,
  Clock,
  Flag,
  Footprints,
  Locate,
  MapPin,
  Moon,
  Navigation,
  RotateCcw,
  Sun,
  X,
} from "lucide-react";
import { Globe, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AddressInput, type SavedAddress } from "./AddressInput";
import { I18nProvider } from "./I18nProvider";
import { OfficeHoursGrid } from "./OfficeHoursGrid";
import { OnboardingScreen } from "./OnboardingScreen";
import ProfileModal from "./ProfileModal";
import { SplashScreen } from "./SplashScreen";
import { saveTripToHistory } from "./TripHistory";
import { WeatherBanner, useWeather } from "./WeatherBanner";
import { I18nContext, useI18n } from "./i18n";
import {
  type DepartureWindow,
  type OfficeHoursSlot,
  type TimelineSlot,
  type TransportMode,
  computeTravelMinutes,
  formatTime,
  generateDepartureWindows,
  generateLongDistanceWindows,
  generateOfficeHoursSlots,
  getTimelineData,
  getTrafficLevel,
} from "./trafficEngine";
import { useDarkMode } from "./useDarkMode";
import { useLocationDetect } from "./useLocationDetect";

// ─── Types ───────────────────────────────────────────────────────────────────

interface PlanResult {
  departureWindows: DepartureWindow[];
  returnWindows: DepartureWindow[] | null;
  timeline: TimelineSlot[];
  distanceKm: number;
  mode: TransportMode;
  isRoundTrip: boolean;
  isLongDistance: boolean;
}

interface CustomTimeResult {
  time: string;
  trafficLevel: "low" | "moderate" | "heavy";
  travelMinutes: number;
  verdict: "good" | "fair" | "bad";
  reason: string;
}

interface ReminderState {
  windowLabel: string;
  departureTime: Date;
  type: "going" | "return";
}

interface ActiveAlert {
  reminderLabel: string;
  message: string;
}

// ─── Helper components ────────────────────────────────────────────────────────

function TrafficBadge({ level }: { level: "low" | "moderate" | "heavy" }) {
  const config = {
    low: {
      label: "Low Traffic",
      className: "bg-traffic-low/20 text-traffic-low border-traffic-low/30",
    },
    moderate: {
      label: "Moderate Traffic",
      className:
        "bg-traffic-moderate/20 text-traffic-moderate border-traffic-moderate/30",
    },
    heavy: {
      label: "High Traffic",
      className:
        "bg-traffic-heavy/20 text-traffic-heavy border-traffic-heavy/30",
    },
  };
  const c = config[level];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.className}`}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          level === "low"
            ? "bg-traffic-low"
            : level === "moderate"
              ? "bg-traffic-moderate"
              : "bg-traffic-heavy"
        }`}
      />
      {c.label}
    </span>
  );
}

function DelayBadge({ risk }: { risk: "low" | "medium" | "high" }) {
  const config = {
    low: { label: "Low Risk", className: "text-traffic-low" },
    medium: { label: "Medium Risk", className: "text-traffic-moderate" },
    high: { label: "High Risk", className: "text-traffic-heavy" },
  };
  const c = config[risk];
  return (
    <span className={`text-xs font-medium ${c.className}`}>{c.label}</span>
  );
}

function DepartureCard({
  window: w,
  onSetReminder,
  isReminded,
  showReminder = true,
}: {
  window: DepartureWindow;
  onSetReminder: () => void;
  isReminded: boolean;
  showReminder?: boolean;
}) {
  const isRec = w.label === "Recommended" || w.isBest === true;
  return (
    <div
      data-ocid={`departure.${w.label.toLowerCase()}.card`}
      className={`relative flex flex-col gap-3 p-5 rounded-xl border card-hover ${
        isRec ? "border-brand bg-card brand-glow" : "border-border bg-card"
      }`}
    >
      {isRec && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-brand text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
            ★ Best Option
          </span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span
          className={`text-sm font-semibold ${
            isRec ? "text-brand" : "text-muted-foreground"
          }`}
        >
          {w.label}
        </span>
        <TrafficBadge level={w.trafficLevel} />
      </div>

      <div>
        <p className="text-3xl font-bold text-foreground">
          {formatTime(w.departureTime)}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 bg-secondary/50 rounded-lg px-2.5 py-1.5">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            {w.travelMinutes} min
          </span>
        </div>
        <DelayBadge risk={w.delayRisk} />
      </div>

      {isRec && (
        <p className="text-xs italic text-muted-foreground border-t border-border pt-3">
          {w.reason}
        </p>
      )}

      {showReminder && (
        <Button
          data-ocid={`departure.${w.label.toLowerCase()}.set_reminder`}
          variant={isReminded ? "secondary" : "outline"}
          size="sm"
          className={`mt-auto gap-2 ${
            isReminded
              ? "text-brand border-brand/40 bg-brand/10"
              : "hover:border-brand hover:text-brand"
          }`}
          onClick={onSetReminder}
          disabled={isReminded}
        >
          <Bell className="w-3.5 h-3.5" />
          {isReminded ? "Reminder Set" : "Set Reminder"}
        </Button>
      )}
    </div>
  );
}

// ─── Reminder Alert Banner ────────────────────────────────────────────────────

function ReminderBanner({
  alert,
  onSnooze,
  onDismiss,
}: {
  alert: ActiveAlert;
  onSnooze: (minutes: number) => void;
  onDismiss: () => void;
}) {
  const [showCustom, setShowCustom] = useState(false);
  const [customMins, setCustomMins] = useState("15");

  function handleCustomConfirm() {
    const mins = Number.parseInt(customMins, 10);
    if (!Number.isNaN(mins) && mins > 0) {
      onSnooze(mins);
    }
  }

  return (
    <div
      data-ocid="reminder.toast"
      className="fixed top-0 left-0 right-0 z-50 bg-brand text-primary-foreground shadow-xl"
    >
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Bell className="w-5 h-5 shrink-0 animate-pulse" />
          <span className="text-sm font-semibold leading-snug">
            {alert.message}
          </span>
        </div>
        <button
          type="button"
          data-ocid="reminder.dismiss_button"
          onClick={onDismiss}
          title="Dismiss"
          className="shrink-0 hover:opacity-70 transition-opacity"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="px-4 pb-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium opacity-80 mr-1">Snooze:</span>
        <button
          type="button"
          data-ocid="reminder.snooze_5.button"
          onClick={() => onSnooze(5)}
          className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-xs font-semibold transition-colors"
        >
          5 min
        </button>
        <button
          type="button"
          data-ocid="reminder.snooze_10.button"
          onClick={() => onSnooze(10)}
          className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-xs font-semibold transition-colors"
        >
          10 min
        </button>
        <button
          type="button"
          data-ocid="reminder.snooze_custom.button"
          onClick={() => setShowCustom((v) => !v)}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
            showCustom ? "bg-white/40" : "bg-white/20 hover:bg-white/30"
          }`}
        >
          Custom
        </button>
        {showCustom && (
          <div className="flex items-center gap-1.5">
            <input
              data-ocid="reminder.custom_mins.input"
              type="number"
              min="1"
              max="120"
              value={customMins}
              onChange={(e) => setCustomMins(e.target.value)}
              className="w-16 h-7 rounded-md bg-white/20 border border-white/30 text-primary-foreground text-xs text-center px-2 focus:outline-none focus:border-white/60 placeholder:text-white/50"
              placeholder="min"
            />
            <button
              type="button"
              data-ocid="reminder.custom_confirm.button"
              onClick={handleCustomConfirm}
              className="px-3 py-1 rounded-full bg-white/30 hover:bg-white/40 text-xs font-bold transition-colors"
            >
              Remind me
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Route distance fetch ─────────────────────────────────────────────────────

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1.35;
}

async function fetchWithTimeout(url: string, ms = 8000): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    return r;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchRouteDistance(
  originCoords: { lat: number; lon: number },
  destCoords: { lat: number; lon: number },
  _mode: TransportMode,
): Promise<{ distanceKm: number; isApproximate: boolean }> {
  const { lat: oLat, lon: oLon } = originCoords;
  const { lat: dLat, lon: dLon } = destCoords;

  const osrmUrls = [
    `https://router.project-osrm.org/route/v1/driving/${oLon},${oLat};${dLon},${dLat}?overview=false`,
    `https://routing.openstreetmap.de/routed-car/route/v1/driving/${oLon},${oLat};${dLon},${dLat}?overview=false`,
  ];

  for (const url of osrmUrls) {
    try {
      const res = await fetchWithTimeout(url);
      if (!res.ok) continue;
      const data = await res.json();
      const meters = data?.routes?.[0]?.distance;
      if (meters) {
        return {
          distanceKm: Math.round((meters / 1000) * 10) / 10,
          isApproximate: false,
        };
      }
    } catch {
      // try next
    }
  }

  // Haversine fallback
  return {
    distanceKm: Math.round(haversineKm(oLat, oLon, dLat, dLon) * 10) / 10,
    isApproximate: true,
  };
}

// ─── Main App ─────────────────────────────────────────────────────────────────

function AppInner() {
  // Dark mode & i18n
  const [isDark, toggleDark] = useDarkMode();
  const { t, locale, setLocale } = useI18n();

  // Splash screen
  const [showSplash, setShowSplash] = useState(
    () => !sessionStorage.getItem("splashShown"),
  );
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem("quikliv_user"),
  );
  const [showProfile, setShowProfile] = useState(false);
  const [displayUsername, setDisplayUsername] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("quikliv_user") || "{}").username || ""
      );
    } catch {
      return "";
    }
  });

  // Form state
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [mode, setMode] = useState<TransportMode>("car");
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [isOfficeHours, setIsOfficeHours] = useState(false);
  const [tripDate, setTripDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [timeAtDest] = useState("2");
  const [isWeekend, setIsWeekend] = useState(() => {
    const day = new Date().getDay();
    return day === 0 || day === 6;
  });

  // Coords + routing
  const [originCoords, setOriginCoords] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [destCoords, setDestCoords] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [usingApproximate, setUsingApproximate] = useState(false);

  // Office hours reminders
  const [remindedGoingHour, setRemindedGoingHour] = useState<number | null>(
    null,
  );
  const [remindedReturnHour, setRemindedReturnHour] = useState<number | null>(
    null,
  );

  // Location detect
  const { status: locStatus, detect: detectLocation } = useLocationDetect();

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Results
  const [result, setResult] = useState<PlanResult | null>(null);

  // Custom time evaluator
  const [customDepTime, setCustomDepTime] = useState("");
  const [customDepResult, setCustomDepResult] =
    useState<CustomTimeResult | null>(null);
  const [customRetTime, setCustomRetTime] = useState("");
  const [customRetResult, setCustomRetResult] =
    useState<CustomTimeResult | null>(null);

  // Reminders
  const [reminders, setReminders] = useState<ReminderState[]>([]);
  const [activeAlert, setActiveAlert] = useState<ActiveAlert | null>(null);
  const firedReminders = useRef<Set<string>>(new Set());
  const reminderInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const [timelineKey, setTimelineKey] = useState(0);

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>(() => {
    try {
      return JSON.parse(
        localStorage.getItem("quikliv_saved_addresses") || "[]",
      );
    } catch {
      return [];
    }
  });

  // Weather
  const [weatherCoords, setWeatherCoords] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [weatherTripDate, setWeatherTripDate] = useState("");
  const { showBanner: showWeatherBanner, bannerMsg: weatherBannerMsg } =
    useWeather(weatherCoords, weatherTripDate);

  function persistSaved(updated: SavedAddress[]) {
    setSavedAddresses(updated);
    localStorage.setItem("quikliv_saved_addresses", JSON.stringify(updated));
  }

  function handleSaveAddress(
    address: string,
    label: string,
    lat?: number,
    lon?: number,
  ) {
    if (savedAddresses.length >= 5) return;
    if (savedAddresses.some((s) => s.address === address)) return;
    const newEntry: SavedAddress = {
      id: Date.now().toString(),
      label,
      address,
      lat,
      lon,
    };
    persistSaved([...savedAddresses, newEntry]);
  }

  function handleDeleteSaved(id: string) {
    persistSaved(savedAddresses.filter((s) => s.id !== id));
  }

  function handleSelectSavedOrigin(saved: SavedAddress) {
    setOrigin(saved.address);
    if (saved.lat !== undefined && saved.lon !== undefined) {
      setOriginCoords({ lat: saved.lat, lon: saved.lon });
    }
  }

  function handleSelectSavedDest(saved: SavedAddress) {
    setDestination(saved.address);
    if (saved.lat !== undefined && saved.lon !== undefined) {
      setDestCoords({ lat: saved.lat, lon: saved.lon });
    }
  }

  useEffect(() => {
    if (reminders.length === 0) return;
    if (reminderInterval.current) clearInterval(reminderInterval.current);

    reminderInterval.current = setInterval(() => {
      const now = new Date();
      for (const r of reminders) {
        const key = `${r.type}::${r.windowLabel}::${r.departureTime.getTime()}`;
        if (firedReminders.current.has(key)) continue;

        const diffMs = r.departureTime.getTime() - now.getTime();
        const diffMins = diffMs / 60000;

        if (diffMins <= 15 && diffMins > 14) {
          firedReminders.current.add(key);
          const minsLeft = Math.max(0, Math.ceil(diffMins));
          setActiveAlert({
            reminderLabel: key,
            message: `Time to leave! Your ${
              r.type === "return" ? "return " : ""
            }departure (${r.windowLabel}) is in ${minsLeft} minute${
              minsLeft !== 1 ? "s" : ""
            }.`,
          });
          return;
        }
      }
    }, 30000);

    return () => {
      if (reminderInterval.current) clearInterval(reminderInterval.current);
    };
  }, [reminders]);

  function handleSnooze(minutes: number) {
    if (!activeAlert) return;
    const key = activeAlert.reminderLabel;
    setReminders((prev) =>
      prev.map((r) => {
        const rKey = `${r.type}::${r.windowLabel}::${r.departureTime.getTime()}`;
        if (rKey !== key) return r;
        return {
          ...r,
          departureTime: new Date(r.departureTime.getTime() + minutes * 60000),
        };
      }),
    );
    firedReminders.current.delete(key);
    setActiveAlert(null);
    toast.success(`Reminder snoozed for ${minutes} minutes`, {
      icon: <Bell className="w-4 h-4" />,
    });
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!origin.trim()) errs.origin = "Origin is required";
    if (!destination.trim()) errs.destination = "Destination is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handlePlan() {
    if (!validate()) return;

    let distKm = 20;
    let approx = false;

    // Always try OSRM if coords available
    if (originCoords && destCoords) {
      try {
        const { distanceKm, isApproximate } = await fetchRouteDistance(
          originCoords,
          destCoords,
          mode,
        );
        distKm = distanceKm;
        approx = isApproximate;
      } catch {
        // keep default 20km fallback
      }
    }
    setUsingApproximate(approx);

    const base = new Date(`${tripDate}T00:00:00`);
    const now = new Date();
    const isToday = base.toDateString() === now.toDateString();
    const arrivalDate = isToday
      ? new Date(now.getTime() + 2 * 3600 * 1000)
      : new Date(base.getTime() + 12 * 3600 * 1000);

    const LONG_DISTANCE_KM = 20;
    const isLongDistance = distKm >= LONG_DISTANCE_KM;

    const departureWindows = isLongDistance
      ? generateLongDistanceWindows({
          targetArrivalTime: arrivalDate,
          distanceKm: distKm,
          mode,
          isWeekend,
        })
      : generateDepartureWindows({
          targetArrivalTime: arrivalDate,
          distanceKm: distKm,
          mode,
          isWeekend,
        });

    let returnWindows: DepartureWindow[] | null = null;
    if (isRoundTrip) {
      let returnDeparture: Date;
      if (isOfficeHours) {
        returnDeparture = new Date(`${tripDate}T18:00:00`);
      } else {
        const hoursAtDest = Number.parseFloat(timeAtDest) || 2;
        const recWindow = isLongDistance
          ? (departureWindows.find((w) => w.isBest) ?? departureWindows[0])
          : departureWindows[1];
        returnDeparture = new Date(
          recWindow.arrivalTime.getTime() + hoursAtDest * 3600 * 1000,
        );
      }
      returnWindows = isLongDistance
        ? generateLongDistanceWindows({
            targetArrivalTime: new Date(
              returnDeparture.getTime() + 60 * 60 * 1000,
            ),
            distanceKm: distKm,
            mode,
            isWeekend,
          })
        : generateDepartureWindows({
            targetArrivalTime: new Date(
              returnDeparture.getTime() + 60 * 60 * 1000,
            ),
            distanceKm: distKm,
            mode,
            isWeekend,
          });
    }

    const timeline = getTimelineData(now.getHours(), isWeekend);
    setTimelineKey((k) => k + 1);
    setReminders([]);
    setActiveAlert(null);
    firedReminders.current.clear();
    setRemindedGoingHour(null);
    setRemindedReturnHour(null);
    const newResult = {
      departureWindows,
      returnWindows,
      timeline,
      distanceKm: distKm,
      mode,
      isRoundTrip,
      isLongDistance,
    };
    setResult(newResult);

    // Save trip to history
    const bestWindow =
      departureWindows.find((w) => w.isBest) ?? departureWindows[0];
    if (bestWindow) {
      saveTripToHistory({
        origin,
        destination,
        mode,
        date: tripDate,
        departureTime: formatTime(bestWindow.departureTime),
        travelEstimate: bestWindow.travelMinutes,
      });
    }

    // Trigger weather fetch
    if (originCoords) {
      setWeatherCoords(originCoords);
      setWeatherTripDate(tripDate);
    }

    setTimeout(() => {
      document
        .getElementById("results-section")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  function handleSetReminder(w: DepartureWindow, type: "going" | "return") {
    setReminders((prev) => [
      ...prev,
      { windowLabel: w.label, departureTime: w.departureTime, type },
    ]);
    toast.success(`Reminder set for ${formatTime(w.departureTime)}`, {
      description: "We'll alert you 15 minutes before your departure.",
      icon: <Bell className="w-4 h-4" />,
    });
  }

  function handleSetReminderForSlot(
    slot: OfficeHoursSlot,
    type: "going" | "return",
  ) {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          const tripDateObj = new Date(
            `${tripDate}T${String(slot.hour).padStart(2, "0")}:00:00`,
          );
          const reminderTime = new Date(tripDateObj.getTime() - 15 * 60 * 1000);
          const msUntil = reminderTime.getTime() - Date.now();
          if (msUntil > 0) {
            setTimeout(() => {
              new Notification("🚗 Time to Leave!", {
                body: `Departure: ${slot.label}`,
                icon: "/favicon.ico",
              });
            }, msUntil);
          }
        }
      });
    }
    if (type === "going") setRemindedGoingHour(slot.hour);
    else setRemindedReturnHour(slot.hour);
    const reminderTime = new Date(
      `${tripDate}T${String(slot.hour).padStart(2, "0")}:00:00`,
    );
    reminderTime.setMinutes(reminderTime.getMinutes() - 15);
    const timeStr = reminderTime.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    toast.success(`🔔 Reminder set for ${timeStr}`);
  }

  function isReminded(w: DepartureWindow, type: "going" | "return") {
    return reminders.some((r) => r.windowLabel === w.label && r.type === type);
  }

  const transportModes: Array<{
    id: TransportMode;
    label: string;
    icon: React.ReactNode;
  }> = [
    { id: "car", label: "Car", icon: <Car className="w-4 h-4" /> },
    { id: "bike", label: "Bike", icon: <Bike className="w-4 h-4" /> },
    { id: "walk", label: "Walk", icon: <Footprints className="w-4 h-4" /> },
  ];

  const modeLabels: Record<TransportMode, string> = {
    car: "Car",
    bike: "Bike",
    walk: "Walk",
  };

  const timelineColor = (level: "low" | "moderate" | "heavy") => {
    if (level === "heavy") return "bg-traffic-heavy";
    if (level === "moderate") return "bg-traffic-moderate";
    return "bg-traffic-low";
  };

  const hasNightTravel = result?.departureWindows.some((w) => w.isNightTravel);

  const bestDuration = result
    ? Math.min(...result.departureWindows.map((w) => w.travelMinutes))
    : 0;
  const worstDuration = result
    ? Math.max(...result.departureWindows.map((w) => w.travelMinutes))
    : 0;

  function isOfficeHourSlot(slot: TimelineSlot): boolean {
    const h = slot.time.getHours();
    return h >= 8 && h < 18;
  }

  const displayedDepartureWindows = result
    ? isOfficeHours
      ? result.departureWindows.filter((w) => {
          const h = w.departureTime.getHours();
          return h >= 8 && h < 18;
        })
      : result.departureWindows
    : [];

  const displayedReturnWindows = result?.returnWindows
    ? isOfficeHours
      ? result.returnWindows.filter((w) => {
          const h = w.departureTime.getHours();
          return h >= 8 && h < 18;
        })
      : result.returnWindows
    : null;

  function evaluateCustomTime(
    timeStr: string,
    _section: "dep" | "ret",
  ): CustomTimeResult | null {
    if (!result || !timeStr) return null;
    const [hStr, mStr] = timeStr.split(":");
    const hour = Number.parseInt(hStr, 10);
    const minute = Number.parseInt(mStr, 10);
    const dt = new Date(`${tripDate}T00:00:00`);
    dt.setHours(hour, minute, 0, 0);
    const trafficLevel = getTrafficLevel(hour, isWeekend);
    const travelMinutes = computeTravelMinutes(
      dt,
      result.distanceKm,
      result.mode,
      isWeekend,
    );
    const verdict =
      trafficLevel === "low"
        ? "good"
        : trafficLevel === "moderate"
          ? "fair"
          : "bad";
    const reasons: Record<string, string> = {
      low: "Light traffic — smooth journey expected.",
      moderate: "Moderate traffic — some delays possible.",
      heavy: "Rush hour — expect significant delays.",
    };
    // Hour-specific context
    let reason = reasons[trafficLevel];
    if (hour >= 7 && hour <= 9)
      reason = "Morning rush hour — heavy congestion on most routes.";
    else if (hour >= 17 && hour <= 19)
      reason = "Evening rush hour — expect significant delays.";
    else if (hour >= 22 || hour < 5)
      reason = "Late night — minimal traffic, smooth roads.";
    else if (trafficLevel === "low")
      reason = "Light traffic — great time to travel.";

    return { time: timeStr, trafficLevel, travelMinutes, verdict, reason };
  }

  return (
    <>
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
      {!showSplash && showOnboarding && (
        <OnboardingScreen
          onDone={() => {
            setShowOnboarding(false);
            // Request push notification permission
            if (
              "Notification" in window &&
              Notification.permission === "default"
            ) {
              Notification.requestPermission().catch(() => {});
            }
            // Register service worker
            if ("serviceWorker" in navigator) {
              navigator.serviceWorker.register("/sw.js").catch(() => {});
            }
          }}
        />
      )}
      <div
        className={`min-h-screen bg-background font-sans${isDark ? " dark" : ""}`}
        dir={locale === "ar" ? "rtl" : "ltr"}
      >
        <Toaster position="top-center" theme="dark" />
        <ProfileModal
          open={showProfile}
          onClose={() => setShowProfile(false)}
          onSaved={(u) => setDisplayUsername(u)}
          onAddressesChanged={() => {
            try {
              const arr = JSON.parse(
                localStorage.getItem("quikliv_saved_addresses") || "[]",
              );
              setSavedAddresses(arr);
            } catch {
              /* ignore */
            }
          }}
        />

        {/* Reminder Alert Banner */}
        {activeAlert && (
          <ReminderBanner
            alert={activeAlert}
            onSnooze={handleSnooze}
            onDismiss={() => setActiveAlert(null)}
          />
        )}

        {/* Nav */}
        <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
                <Navigation className="w-4.5 h-4.5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground">
                QuikLiv
              </span>
            </div>
            <p className="text-sm text-muted-foreground hidden sm:block">
              Know Before You Go
            </p>
            <div className="flex items-center gap-2">
              {displayUsername ? (
                <button
                  type="button"
                  data-ocid="profile.open_modal_button"
                  onClick={() => setShowProfile(true)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hidden sm:flex mr-1 hover:text-foreground transition-colors cursor-pointer"
                >
                  Hi,{" "}
                  <span className="text-brand font-medium">
                    {displayUsername}
                  </span>
                </button>
              ) : null}
              {/* Language Picker */}
              <div className="relative group">
                <button
                  type="button"
                  data-ocid="lang.toggle"
                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium border border-border bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  title="Language"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">
                    {locale.toUpperCase()}
                  </span>
                </button>
                <div className="absolute right-0 top-full mt-1 z-50 bg-card border border-border rounded-xl shadow-xl overflow-hidden hidden group-focus-within:block group-hover:block w-28">
                  {(["en", "es", "fr", "hi", "ar"] as const).map((l) => (
                    <button
                      key={l}
                      type="button"
                      data-ocid={`lang.${l}.button`}
                      onClick={() => setLocale(l)}
                      className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors ${locale === l ? "bg-brand/20 text-brand" : "hover:bg-secondary text-muted-foreground hover:text-foreground"}`}
                    >
                      {l === "en"
                        ? "🇬🇧 English"
                        : l === "es"
                          ? "🇪🇸 Español"
                          : l === "fr"
                            ? "🇫🇷 Français"
                            : l === "hi"
                              ? "🇮🇳 हिंदी"
                              : "🇸🇦 العربية"}
                    </button>
                  ))}
                </div>
              </div>
              {/* Dark Mode Toggle */}
              <button
                type="button"
                data-ocid="darkmode.toggle"
                onClick={toggleDark}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium border border-border bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDark ? (
                  <Sun className="w-3.5 h-3.5" />
                ) : (
                  <Moon className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                type="button"
                data-ocid="weekend.toggle"
                onClick={() => setIsWeekend((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  isWeekend
                    ? "bg-brand/20 text-brand border-brand/40"
                    : "bg-secondary text-muted-foreground border-border"
                }`}
              >
                {isWeekend ? (
                  <Moon className="w-3.5 h-3.5" />
                ) : (
                  <Sun className="w-3.5 h-3.5" />
                )}
                {isWeekend ? "Weekend" : "Weekday"}
              </button>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="bg-gradient-to-b from-card to-background border-b border-border">
          <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground leading-tight">
              Find Your <span className="text-brand">Perfect</span>
              <br />
              Departure Time
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
              QuikLiv analyzes traffic patterns to suggest the best times to
              leave — so you arrive stress-free.
            </p>
          </div>
        </section>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
          {/* Input Card */}
          <section
            data-ocid="input.section"
            className="bg-card border border-border rounded-2xl p-6 space-y-6"
          >
            <h2 className="text-xl font-bold text-foreground">
              Plan Your Trip
            </h2>

            {/* Origin + Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-foreground font-medium flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand" /> Origin
                </Label>
                <AddressInput
                  data-ocid="trip.origin.input"
                  value={origin}
                  onChange={(val) => {
                    setOrigin(val);
                    setErrors((err) => ({ ...err, origin: "" }));
                  }}
                  onCoordinatesSelected={(lat, lon) =>
                    setOriginCoords({ lat, lon })
                  }
                  placeholder="e.g. Home, New York"
                  error={errors.origin}
                  savedAddresses={savedAddresses}
                  onSaveAddress={handleSaveAddress}
                  onSelectSaved={handleSelectSavedOrigin}
                  onDeleteSaved={handleDeleteSaved}
                  currentCoords={originCoords ?? undefined}
                  rightElement={
                    <button
                      type="button"
                      data-ocid="trip.origin.locate"
                      className="text-muted-foreground hover:text-brand transition-colors"
                      onClick={() =>
                        detectLocation(
                          (addr) => {
                            setOrigin(addr);
                            setErrors((err) => ({ ...err, origin: "" }));
                          },
                          (msg) => toast.success(msg),
                        )
                      }
                      title="Use my location"
                    >
                      {locStatus === "detecting" ? (
                        <span className="text-sm">⏳</span>
                      ) : locStatus === "success" ? (
                        <span className="text-sm">✅</span>
                      ) : (
                        <Locate className="w-4 h-4" />
                      )}
                    </button>
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-foreground font-medium flex items-center gap-1.5">
                  <Flag className="w-3.5 h-3.5 text-brand" /> Destination
                </Label>
                <AddressInput
                  data-ocid="trip.destination.input"
                  value={destination}
                  onChange={(val) => {
                    setDestination(val);
                    setErrors((err) => ({ ...err, destination: "" }));
                  }}
                  onCoordinatesSelected={(lat, lon) =>
                    setDestCoords({ lat, lon })
                  }
                  placeholder="e.g. Work, Airport"
                  error={errors.destination}
                  savedAddresses={savedAddresses}
                  onSaveAddress={handleSaveAddress}
                  onSelectSaved={handleSelectSavedDest}
                  onDeleteSaved={handleDeleteSaved}
                  currentCoords={destCoords ?? undefined}
                />
              </div>
            </div>

            {/* Transport Mode */}
            <div className="space-y-2">
              <Label className="text-foreground font-medium">
                Transport Mode
              </Label>
              <div className="flex gap-2 flex-wrap">
                {transportModes.map((m) => (
                  <button
                    type="button"
                    key={m.id}
                    data-ocid={`transport.${m.id}.toggle`}
                    onClick={() => setMode(m.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                      mode === m.id
                        ? "bg-brand text-primary-foreground border-brand shadow-md"
                        : "bg-secondary text-muted-foreground border-border hover:border-brand/50 hover:text-foreground"
                    }`}
                  >
                    {m.icon}
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Trip Type + Office Hours */}
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Trip Type</Label>
                <div className="flex rounded-xl border border-border overflow-hidden">
                  <button
                    type="button"
                    data-ocid="trip.oneway.toggle"
                    onClick={() => setIsRoundTrip(false)}
                    className={`px-4 py-2.5 text-sm font-semibold transition-colors ${
                      !isRoundTrip
                        ? "bg-brand text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    One-Way
                  </button>
                  <button
                    type="button"
                    data-ocid="trip.roundtrip.toggle"
                    onClick={() => setIsRoundTrip(true)}
                    className={`px-4 py-2.5 text-sm font-semibold transition-colors ${
                      isRoundTrip
                        ? "bg-brand text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Round Trip
                  </button>
                </div>
              </div>

              {/* Office Hours Toggle */}
              <div className="space-y-2">
                <Label className="text-foreground font-medium flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-brand" /> Office Hours
                </Label>
                <button
                  type="button"
                  data-ocid="office_hours.toggle"
                  onClick={() => setIsOfficeHours((v) => !v)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                    isOfficeHours
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                      : "bg-secondary text-muted-foreground border-border hover:border-amber-500/40 hover:text-foreground"
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  {isOfficeHours ? "Office Hours On" : "Office Hours Off"}
                </button>
                {isOfficeHours && (
                  <p className="text-xs text-amber-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> 8:00 AM – 6:00 PM
                  </p>
                )}
              </div>
            </div>

            {/* Trip Date */}
            <div className="space-y-1.5">
              <Label className="text-foreground font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand" /> Trip Date
              </Label>
              <input
                data-ocid="trip.date.input"
                type="date"
                value={tripDate}
                onChange={(e) => setTripDate(e.target.value)}
                className="flex h-10 w-full max-w-xs rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* CTA */}
            <Button
              data-ocid="trip.find_times.primary_button"
              className="w-full h-14 text-base font-bold bg-brand text-primary-foreground hover:bg-brand/90 rounded-xl gap-2 shadow-lg"
              onClick={handlePlan}
            >
              Find Best Times
              <ArrowRight className="w-5 h-5" />
            </Button>
          </section>

          {/* Results */}
          {result && (
            <div id="results-section" className="space-y-8">
              {/* Route Summary Header */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-border text-sm">
                <MapPin className="w-4 h-4 text-brand shrink-0" />
                <div className="flex-1 min-w-0">
                  {(() => {
                    const parts = origin.split(", ");
                    const main = parts
                      .slice(0, Math.max(1, parts.length - 2))
                      .join(", ");
                    const sub = parts.slice(-2).join(", ");
                    return (
                      <>
                        <div className="font-medium text-foreground truncate">
                          {main || origin}
                        </div>
                        {sub && main !== origin && (
                          <div className="text-xs text-muted-foreground truncate">
                            {sub}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                <Flag className="w-4 h-4 text-brand shrink-0" />
                <div className="flex-1 min-w-0">
                  {(() => {
                    const parts = destination.split(", ");
                    const main = parts
                      .slice(0, Math.max(1, parts.length - 2))
                      .join(", ");
                    const sub = parts.slice(-2).join(", ");
                    return (
                      <>
                        <div className="font-medium text-foreground truncate">
                          {main || destination}
                        </div>
                        {sub && main !== destination && (
                          <div className="text-xs text-muted-foreground truncate">
                            {sub}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
              {/* Weather Banner */}
              {showWeatherBanner && (
                <WeatherBanner message={weatherBannerMsg} />
              )}

              {/* Night Travel Banner */}
              {hasNightTravel && (
                <div
                  data-ocid="night_travel.toast"
                  className="flex items-start gap-3 p-4 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-300"
                >
                  <Moon className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm">
                    <strong>Night travel (12am–5am):</strong> Traffic is
                    typically minimal. Expect smooth roads with very few delays.
                  </p>
                </div>
              )}

              {/* Approximate Banner */}
              {usingApproximate && (
                <div
                  data-ocid="approximate.toast"
                  className="flex items-center gap-2 p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 text-sm"
                >
                  <span>⚠️</span>
                  <span>Showing approximate times — route estimation used</span>
                </div>
              )}

              {/* Departure Suggestions */}
              <section data-ocid="departure.section">
                <div className="flex items-center gap-2 mb-4">
                  <ArrowRight className="w-5 h-5 text-brand" />
                  <h2 className="text-xl font-bold text-foreground">
                    Departure — Going
                  </h2>
                  {isOfficeHours && (
                    <span className="text-xs text-amber-400 flex items-center gap-1 ml-auto">
                      <Briefcase className="w-3 h-3" /> Office Hours (8am–6pm)
                    </span>
                  )}
                </div>
                {isOfficeHours ? (
                  <OfficeHoursGrid
                    slots={generateOfficeHoursSlots(
                      8,
                      18,
                      result.distanceKm,
                      result.mode,
                      isWeekend,
                      tripDate,
                    )}
                    section="going"
                    remindedHour={remindedGoingHour}
                    onSetReminder={(slot) =>
                      handleSetReminderForSlot(slot, "going")
                    }
                  />
                ) : (
                  <>
                    {result.isLongDistance && (
                      <div className="flex items-center gap-2 p-3 rounded-xl border border-brand/30 bg-brand/10 text-brand text-sm mb-4">
                        <span>🛣️</span>
                        <span>
                          Long distance trip — showing best departure windows by
                          time of day
                        </span>
                      </div>
                    )}
                    {displayedDepartureWindows.length === 0 ? (
                      <div
                        data-ocid="departure.empty_state"
                        className="p-6 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-sm text-center"
                      >
                        No departure times fall within office hours (8am–6pm).
                        Try adjusting your trip date.
                      </div>
                    ) : (
                      <div
                        className={`grid grid-cols-1 gap-4 ${result.isLongDistance ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}
                      >
                        {displayedDepartureWindows.map((w) => (
                          <DepartureCard
                            key={w.label}
                            window={w}
                            onSetReminder={() => handleSetReminder(w, "going")}
                            isReminded={isReminded(w, "going")}
                            showReminder={
                              w.label === "Recommended" || w.isBest === true
                            }
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </section>

              {/* Custom Time Evaluator — Departure */}
              <section data-ocid="custom_dep.section">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-brand" />
                  <h2 className="text-xl font-bold text-foreground">
                    Check Your Departure Time
                  </h2>
                </div>
                <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Enter a custom time to see how traffic looks and whether
                    it's a good choice.
                  </p>
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label
                        htmlFor="custom-dep-time"
                        className="text-xs text-muted-foreground mb-1 block"
                      >
                        Your preferred departure time
                      </label>
                      <input
                        id="custom-dep-time"
                        data-ocid="custom_dep.input"
                        type="time"
                        value={customDepTime}
                        onChange={(e) => {
                          setCustomDepTime(e.target.value);
                          setCustomDepResult(null);
                        }}
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
                      />
                    </div>
                    <Button
                      data-ocid="custom_dep.submit_button"
                      onClick={() =>
                        setCustomDepResult(
                          evaluateCustomTime(customDepTime, "dep"),
                        )
                      }
                      disabled={!customDepTime}
                      className="bg-brand hover:bg-brand/90 text-primary-foreground rounded-xl px-5"
                    >
                      Evaluate
                    </Button>
                  </div>
                  {customDepResult && (
                    <div
                      data-ocid="custom_dep.result.card"
                      className="space-y-4"
                    >
                      <div className="border border-border rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-3xl font-bold text-foreground">
                            {customDepResult.time
                              .split(":")
                              .map((p, i) =>
                                i === 0
                                  ? String(
                                      Number.parseInt(p) % 12 || 12,
                                    ).padStart(2, "0")
                                  : p,
                              )
                              .join(":")}{" "}
                            {Number.parseInt(
                              customDepResult.time.split(":")[0],
                            ) >= 12
                              ? "PM"
                              : "AM"}
                          </span>
                          <span
                            className={`flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-lg ${customDepResult.verdict === "good" ? "bg-green-500/15 text-green-400" : customDepResult.verdict === "fair" ? "bg-amber-500/15 text-amber-400" : "bg-red-500/15 text-red-400"}`}
                          >
                            {customDepResult.verdict === "good"
                              ? "✅"
                              : customDepResult.verdict === "fair"
                                ? "⚠️"
                                : "❌"}{" "}
                            {customDepResult.verdict === "good"
                              ? "Good Option"
                              : customDepResult.verdict === "fair"
                                ? "Fair Option"
                                : "Not Recommended"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-xs text-muted-foreground">
                            Traffic:
                          </span>
                          <TrafficBadge level={customDepResult.trafficLevel} />
                          <span className="text-xs text-muted-foreground ml-auto">
                            ~{customDepResult.travelMinutes} min travel
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground italic">
                          {customDepResult.reason}
                        </p>
                      </div>
                      {displayedDepartureWindows.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            ★ Best Available Options
                          </p>
                          <div className="space-y-2">
                            {[...displayedDepartureWindows]
                              .sort((a, b) => a.travelMinutes - b.travelMinutes)
                              .slice(0, 2)
                              .map((w, idx) => (
                                <div
                                  key={w.label}
                                  data-ocid={`custom_dep.best.item.${idx + 1}`}
                                  className={`flex items-center justify-between px-4 py-3 rounded-xl border ${idx === 0 ? "border-brand/50 bg-brand/5" : "border-border bg-background/50"}`}
                                >
                                  <div className="flex items-center gap-2">
                                    {idx === 0 && (
                                      <span className="text-brand text-xs font-bold">
                                        ★ Best
                                      </span>
                                    )}
                                    <span className="text-sm font-semibold text-foreground">
                                      {formatTime(w.departureTime)}
                                    </span>
                                  </div>
                                  <TrafficBadge level={w.trafficLevel} />
                                  <span className="text-xs text-muted-foreground">
                                    ~{w.travelMinutes} min
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </section>

              {/* Traffic Timeline */}
              <section data-ocid="timeline.section">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-brand" />
                  <h2 className="text-xl font-bold text-foreground">
                    Traffic Timeline — Next 6 Hours
                  </h2>
                </div>
                <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
                  <div className="relative">
                    <div className="flex gap-0.5 mb-1 h-4">
                      {result.timeline.map((slot, _i) => {
                        const recWindow = result.departureWindows[1];
                        const slotEnd = new Date(
                          slot.time.getTime() + 30 * 60 * 1000,
                        );
                        const isMarked =
                          recWindow.departureTime >= slot.time &&
                          recWindow.departureTime < slotEnd;
                        return (
                          <div
                            key={slot.label}
                            className="flex-1 flex items-end justify-center"
                          >
                            {isMarked && (
                              <div className="flex flex-col items-center">
                                <span className="text-[9px] font-bold text-brand leading-none">
                                  ▼
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="relative">
                      <div
                        className="flex gap-0.5 rounded-lg overflow-hidden"
                        key={timelineKey}
                      >
                        {result.timeline.map((slot, i) => (
                          <div
                            key={slot.label}
                            style={{ animationDelay: `${i * 60}ms` }}
                            className={`timeline-segment flex-1 h-10 rounded-sm ${timelineColor(
                              slot.trafficLevel,
                            )} opacity-90`}
                          />
                        ))}
                      </div>

                      {isOfficeHours && (
                        <div className="absolute inset-0 flex gap-0.5 rounded-lg overflow-hidden pointer-events-none">
                          {result.timeline.map((slot) => (
                            <div
                              key={`oh-${slot.label}`}
                              className={`flex-1 h-10 rounded-sm transition-opacity ${
                                isOfficeHourSlot(slot)
                                  ? "bg-amber-400/25 ring-1 ring-inset ring-amber-400/40"
                                  : "bg-transparent"
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-0.5 mt-1">
                      {result.timeline.map((slot, i) => (
                        <div key={slot.label} className="flex-1 text-center">
                          {i % 2 === 0 && (
                            <span className="text-[10px] text-muted-foreground">
                              {slot.label}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-5 flex-wrap pt-2 border-t border-border">
                    {(
                      [
                        {
                          level: "low",
                          label: "Low Traffic",
                          cls: "bg-traffic-low",
                        },
                        {
                          level: "moderate",
                          label: "Moderate Traffic",
                          cls: "bg-traffic-moderate",
                        },
                        {
                          level: "heavy",
                          label: "High Traffic",
                          cls: "bg-traffic-heavy",
                        },
                      ] as const
                    ).map((item) => (
                      <div
                        key={item.level}
                        className="flex items-center gap-1.5"
                      >
                        <div className={`w-3 h-3 rounded-sm ${item.cls}`} />
                        <span className="text-xs text-muted-foreground">
                          {item.label}
                        </span>
                      </div>
                    ))}
                    <div className="flex items-center gap-1.5">
                      <span className="text-brand text-xs">▼</span>
                      <span className="text-xs text-muted-foreground">
                        Recommended departure
                      </span>
                    </div>
                    {isOfficeHours && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm bg-amber-400/40 ring-1 ring-amber-400/60" />
                        <span className="text-xs text-amber-400">
                          Office Hours
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Return Suggestions */}
              {result.isRoundTrip && result.returnWindows && (
                <section data-ocid="return.section">
                  <div className="flex items-center gap-2 mb-4">
                    <RotateCcw className="w-5 h-5 text-brand" />
                    <h2 className="text-xl font-bold text-foreground">
                      Return — Coming Back
                    </h2>
                    {isOfficeHours && (
                      <span className="text-xs text-amber-400 flex items-center gap-1 ml-auto">
                        <Briefcase className="w-3 h-3" /> Office Hours (8am–6pm)
                      </span>
                    )}
                  </div>
                  {isOfficeHours ? (
                    <OfficeHoursGrid
                      slots={generateOfficeHoursSlots(
                        16,
                        20,
                        result.distanceKm,
                        result.mode,
                        isWeekend,
                        tripDate,
                      )}
                      section="return"
                      remindedHour={remindedReturnHour}
                      onSetReminder={(slot) =>
                        handleSetReminderForSlot(slot, "return")
                      }
                    />
                  ) : displayedReturnWindows &&
                    displayedReturnWindows.length === 0 ? (
                    <div
                      data-ocid="return.empty_state"
                      className="p-6 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-sm text-center"
                    >
                      No return times fall within office hours (8am–6pm). Try
                      adjusting your trip date.
                    </div>
                  ) : (
                    <div
                      className={`grid grid-cols-1 gap-4 ${result.isLongDistance ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}
                    >
                      {(displayedReturnWindows ?? result.returnWindows).map(
                        (w) => (
                          <DepartureCard
                            key={w.label}
                            window={w}
                            onSetReminder={() => handleSetReminder(w, "return")}
                            isReminded={isReminded(w, "return")}
                            showReminder={
                              w.label === "Recommended" || w.isBest === true
                            }
                          />
                        ),
                      )}
                    </div>
                  )}
                </section>
              )}

              {/* Custom Return Time Evaluator */}
              {result.isRoundTrip && result.returnWindows && (
                <section data-ocid="custom_ret.section">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-brand" />
                    <h2 className="text-xl font-bold text-foreground">
                      Check Your Return Time
                    </h2>
                  </div>
                  <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Enter a custom time to evaluate traffic for your return
                      journey.
                    </p>
                    <div className="flex gap-3 items-end">
                      <div className="flex-1">
                        <label
                          htmlFor="custom-ret-time"
                          className="text-xs text-muted-foreground mb-1 block"
                        >
                          Your preferred return time
                        </label>
                        <input
                          id="custom-ret-time"
                          data-ocid="custom_ret.input"
                          type="time"
                          value={customRetTime}
                          onChange={(e) => {
                            setCustomRetTime(e.target.value);
                            setCustomRetResult(null);
                          }}
                          className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
                        />
                      </div>
                      <Button
                        data-ocid="custom_ret.submit_button"
                        onClick={() =>
                          setCustomRetResult(
                            evaluateCustomTime(customRetTime, "ret"),
                          )
                        }
                        disabled={!customRetTime}
                        className="bg-brand hover:bg-brand/90 text-primary-foreground rounded-xl px-5"
                      >
                        Evaluate
                      </Button>
                    </div>
                    {customRetResult && (
                      <div
                        data-ocid="custom_ret.result.card"
                        className="space-y-4"
                      >
                        <div className="border border-border rounded-xl p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-3xl font-bold text-foreground">
                              {customRetResult.time
                                .split(":")
                                .map((p: string, i: number) =>
                                  i === 0
                                    ? String(
                                        Number.parseInt(p) % 12 || 12,
                                      ).padStart(2, "0")
                                    : p,
                                )
                                .join(":")}{" "}
                              {Number.parseInt(
                                customRetResult.time.split(":")[0],
                              ) >= 12
                                ? "PM"
                                : "AM"}
                            </span>
                            <span
                              className={`flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-lg ${customRetResult.verdict === "good" ? "bg-green-500/15 text-green-400" : customRetResult.verdict === "fair" ? "bg-amber-500/15 text-amber-400" : "bg-red-500/15 text-red-400"}`}
                            >
                              {customRetResult.verdict === "good"
                                ? "✅"
                                : customRetResult.verdict === "fair"
                                  ? "⚠️"
                                  : "❌"}{" "}
                              {customRetResult.verdict === "good"
                                ? "Good Option"
                                : customRetResult.verdict === "fair"
                                  ? "Fair Option"
                                  : "Not Recommended"}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-xs text-muted-foreground">
                              Traffic:
                            </span>
                            <TrafficBadge
                              level={customRetResult.trafficLevel}
                            />
                            <span className="text-xs text-muted-foreground ml-auto">
                              ~{customRetResult.travelMinutes} min travel
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground italic">
                            {customRetResult.reason}
                          </p>
                        </div>
                        {displayedReturnWindows &&
                          displayedReturnWindows.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                ★ Best Available Options
                              </p>
                              <div className="space-y-2">
                                {[...displayedReturnWindows]
                                  .sort(
                                    (a, b) => a.travelMinutes - b.travelMinutes,
                                  )
                                  .slice(0, 2)
                                  .map((w, idx) => (
                                    <div
                                      key={w.label}
                                      data-ocid={`custom_ret.best.item.${idx + 1}`}
                                      className={`flex items-center justify-between px-4 py-3 rounded-xl border ${idx === 0 ? "border-brand/50 bg-brand/5" : "border-border bg-background/50"}`}
                                    >
                                      <div className="flex items-center gap-2">
                                        {idx === 0 && (
                                          <span className="text-brand text-xs font-bold">
                                            ★ Best
                                          </span>
                                        )}
                                        <span className="text-sm font-semibold text-foreground">
                                          {formatTime(w.departureTime)}
                                        </span>
                                      </div>
                                      <TrafficBadge level={w.trafficLevel} />
                                      <span className="text-xs text-muted-foreground">
                                        ~{w.travelMinutes} min
                                      </span>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Share Trip */}
              <div className="flex justify-end">
                <button
                  type="button"
                  data-ocid="share.button"
                  onClick={async () => {
                    const bestWindow =
                      result.departureWindows.find((w) => w.isBest) ??
                      result.departureWindows[0];
                    const shareText = `QuikLiv Trip Plan\nFrom: ${origin} → To: ${destination}\nDeparture: ${formatTime(bestWindow.departureTime)}\nTravel Time: ~${bestWindow.travelMinutes} min\nTraffic: ${bestWindow.trafficLevel}\nPlan your trip at QuikLiv`;
                    if (navigator.share) {
                      try {
                        await navigator.share({
                          title: "QuikLiv Trip Plan",
                          text: shareText,
                        });
                      } catch {
                        /* cancelled */
                      }
                    } else {
                      await navigator.clipboard.writeText(shareText);
                      toast.success("Trip plan copied to clipboard!");
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-secondary text-sm font-medium text-muted-foreground hover:text-foreground hover:border-brand/50 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  {t.share}
                </button>
              </div>

              {/* Route Summary */}
              <section data-ocid="summary.section">
                <div className="flex items-center gap-2 mb-4">
                  <Navigation className="w-5 h-5 text-brand" />
                  <h2 className="text-xl font-bold text-foreground">
                    Route Summary
                  </h2>
                </div>
                <div className="bg-card border border-border rounded-2xl p-5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border rounded-xl overflow-hidden">
                    {[
                      {
                        label: "Distance",
                        value: `${result.distanceKm} km`,
                        sub: usingApproximate ? "estimated" : "calculated",
                      },
                      {
                        label: "Transport",
                        value: modeLabels[result.mode],
                        sub: "selected mode",
                      },
                      {
                        label: "Best Case",
                        value: `${bestDuration} min`,
                        sub: "low traffic",
                      },
                      {
                        label: "Worst Case",
                        value: `${worstDuration} min`,
                        sub: "high traffic",
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        data-ocid={`summary.${item.label.toLowerCase().replace(" ", "_")}.card`}
                        className="bg-card p-4 text-center space-y-1"
                      >
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">
                          {item.label}
                        </p>
                        <p className="text-2xl font-bold text-foreground">
                          {item.value}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.sub}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Current traffic:{" "}
                      <TrafficBadge
                        level={getTrafficLevel(
                          new Date().getHours(),
                          isWeekend,
                        )}
                      />
                    </p>
                  </div>
                </div>
              </section>

              {/* Reset */}
              <div className="flex justify-center pb-4">
                <Button
                  data-ocid="trip.reset.secondary_button"
                  variant="outline"
                  className="gap-2 border-border text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setResult(null);
                    setReminders([]);
                    setActiveAlert(null);
                    firedReminders.current.clear();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  <RotateCcw className="w-4 h-4" />
                  Plan Another Trip
                </Button>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-card mt-12">
          <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-brand flex items-center justify-center">
                <Navigation className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold text-foreground">
                QuikLiv
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()}. Built with ❤️ using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <AppInner />
    </I18nProvider>
  );
}
