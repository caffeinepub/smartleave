import { ArrowRight, Clock, RotateCcw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

export interface TripHistoryEntry {
  id: string;
  origin: string;
  destination: string;
  mode: string;
  date: string;
  departureTime: string;
  travelEstimate: number;
  timestamp: number;
}

const HISTORY_KEY = "quikliv_trip_history";

function loadHistory(): TripHistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

const MODE_ICONS: Record<string, string> = {
  car: "🚗",
  bike: "🚲",
  walk: "🚶",
};

interface TripHistoryProps {
  onReRun?: (entry: TripHistoryEntry) => void;
}

export function TripHistory({ onReRun }: TripHistoryProps) {
  const [entries, setEntries] = useState<TripHistoryEntry[]>(loadHistory);

  useEffect(() => {
    setEntries(loadHistory());
  }, []);

  function deleteEntry(id: string) {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  }

  function clearAll() {
    setEntries([]);
    localStorage.removeItem(HISTORY_KEY);
  }

  if (entries.length === 0) {
    return (
      <div
        data-ocid="history.empty_state"
        className="text-center py-10 text-muted-foreground"
      >
        <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm font-medium">No trips yet.</p>
        <p className="text-xs mt-1 opacity-70">Plan your first trip!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {entries.length} trip{entries.length !== 1 ? "s" : ""}
        </p>
        <button
          type="button"
          onClick={clearAll}
          data-ocid="history.delete_button"
          className="text-xs text-destructive hover:underline"
        >
          Clear all
        </button>
      </div>
      {entries.map((entry, idx) => (
        <div
          key={entry.id}
          data-ocid={`history.item.${idx + 1}`}
          className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 border border-border/50"
        >
          <span className="text-lg mt-0.5">
            {MODE_ICONS[entry.mode] ?? "🚗"}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 text-sm font-semibold text-foreground flex-wrap">
              <span className="truncate max-w-[100px]">{entry.origin}</span>
              <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
              <span className="truncate max-w-[100px]">
                {entry.destination}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span>🕐 {entry.departureTime}</span>
              <span>📅 {entry.date}</span>
              <span>~{entry.travelEstimate} min</span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {onReRun && (
              <button
                type="button"
                data-ocid={`history.secondary_button.${idx + 1}`}
                onClick={() => onReRun(entry)}
                title="Re-run this trip"
                className="p-1.5 rounded-lg hover:bg-brand/10 text-muted-foreground hover:text-brand transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              data-ocid={`history.delete_button.${idx + 1}`}
              onClick={() => deleteEntry(entry.id)}
              title="Remove"
              className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function saveTripToHistory(
  entry: Omit<TripHistoryEntry, "id" | "timestamp">,
) {
  try {
    const history = loadHistory();
    const newEntry: TripHistoryEntry = {
      ...entry,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify([newEntry, ...history].slice(0, 30)),
    );
  } catch {
    // silent
  }
}
