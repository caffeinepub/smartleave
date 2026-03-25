import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import type { OfficeHoursSlot, TrafficLevel } from "./trafficEngine";

function TrafficBadge({ level }: { level: TrafficLevel }) {
  const config = {
    low: {
      label: "Low",
      className: "bg-traffic-low/20 text-traffic-low border-traffic-low/30",
    },
    moderate: {
      label: "Moderate",
      className:
        "bg-traffic-moderate/20 text-traffic-moderate border-traffic-moderate/30",
    },
    heavy: {
      label: "Heavy",
      className:
        "bg-traffic-heavy/20 text-traffic-heavy border-traffic-heavy/30",
    },
  };
  const c = config[level];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${c.className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
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

interface OfficeHoursGridProps {
  slots: OfficeHoursSlot[];
  section: "going" | "return";
  remindedHour: number | null;
  onSetReminder: (slot: OfficeHoursSlot) => void;
}

function getReminderLabel(hour: number): string {
  const reminderDate = new Date();
  reminderDate.setHours(hour, 0, 0, 0);
  reminderDate.setMinutes(reminderDate.getMinutes() - 15);
  return reminderDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function OfficeHoursGrid({
  slots,
  section,
  remindedHour,
  onSetReminder,
}: OfficeHoursGridProps) {
  if (slots.length === 0) {
    return (
      <div
        data-ocid={`${section}.empty_state`}
        className="p-6 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-sm text-center"
      >
        No slots available for this time window.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {slots.map((slot) => (
        <div
          key={slot.hour}
          data-ocid={`${section}.item.${slot.hour - slots[0].hour + 1}`}
          className={`relative flex flex-col gap-2 p-4 rounded-xl border transition-all ${
            slot.isBest
              ? "border-brand bg-brand/5 brand-glow"
              : "border-border bg-card"
          }`}
        >
          {slot.isBest && (
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
              <span className="bg-brand text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                ★ BEST
              </span>
            </div>
          )}
          <div
            className={`text-lg font-bold ${slot.isBest ? "text-brand" : "text-foreground"}`}
          >
            {slot.label}
          </div>
          <div className="text-xs text-muted-foreground">
            {slot.travelMinutes} min
          </div>
          <TrafficBadge level={slot.trafficLevel} />
          {slot.isBest && (
            <Button
              data-ocid={`${section}.set_reminder.button`}
              variant="outline"
              size="sm"
              className={`mt-1 gap-1.5 text-xs ${
                remindedHour === slot.hour
                  ? "text-green-400 border-green-400/40 bg-green-400/10 cursor-not-allowed"
                  : "hover:border-brand hover:text-brand"
              }`}
              onClick={() => onSetReminder(slot)}
              disabled={remindedHour === slot.hour}
            >
              <Bell className="w-3 h-3" />
              {remindedHour === slot.hour
                ? "✅ Reminder Set"
                : `🔔 Remind me at ${getReminderLabel(slot.hour)}`}
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
