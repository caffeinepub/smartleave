export type TrafficLevel = "low" | "moderate" | "heavy";
export type TransportMode = "car" | "bike" | "walk";
export type DelayRisk = "low" | "medium" | "high";

export interface DepartureWindow {
  label:
    | "Early"
    | "Recommended"
    | "Latest"
    | "Early Morning"
    | "Afternoon"
    | "Evening"
    | "Night";
  departureTime: Date;
  arrivalTime: Date;
  travelMinutes: number;
  trafficLevel: TrafficLevel;
  delayRisk: DelayRisk;
  isNightTravel: boolean;
  reason: string;
  isBest?: boolean;
}

export interface TimelineSlot {
  time: Date;
  label: string;
  trafficLevel: TrafficLevel;
  isNight: boolean;
}

export interface OfficeHoursSlot {
  hour: number;
  label: string;
  travelMinutes: number;
  trafficLevel: TrafficLevel;
  trafficMultiplier: number;
  isBest: boolean;
}

export function getTrafficLevel(
  hour: number,
  isWeekend: boolean,
): TrafficLevel {
  if (hour >= 0 && hour < 5) return "low";

  if (!isWeekend) {
    if ((hour >= 7 && hour < 9) || (hour >= 17 && hour < 19)) return "heavy";
    if (hour === 6 || hour === 9 || hour === 16 || hour === 19)
      return "moderate";
  } else {
    if (hour >= 10 && hour < 14) return "moderate";
  }

  return "low";
}

export function isNightHour(hour: number): boolean {
  return hour >= 0 && hour < 5;
}

export function getTrafficMultiplier(
  level: TrafficLevel,
  mode: TransportMode,
): number {
  if (mode === "walk") return 1.0;
  const multipliers: Record<TransportMode, Record<TrafficLevel, number>> = {
    car: { low: 1.0, moderate: 1.4, heavy: 2.0 },
    bike: { low: 1.0, moderate: 1.1, heavy: 1.2 },
    walk: { low: 1.0, moderate: 1.0, heavy: 1.0 },
  };
  return multipliers[mode][level];
}

export function getBaseMinutes(
  distanceKm: number,
  mode: TransportMode,
): number {
  const minutesPerKm: Record<TransportMode, number> = {
    car: 2,
    bike: 4,
    walk: 12,
  };
  return distanceKm * minutesPerKm[mode];
}

export function computeTravelMinutes(
  departureTime: Date,
  distanceKm: number,
  mode: TransportMode,
  isWeekend: boolean,
): number {
  const hour = departureTime.getHours();
  const level = getTrafficLevel(hour, isWeekend);
  const base = getBaseMinutes(distanceKm, mode);
  const multiplier = getTrafficMultiplier(level, mode);
  return Math.round(base * multiplier);
}

function delayRiskFromLevel(level: TrafficLevel): DelayRisk {
  if (level === "heavy") return "high";
  if (level === "moderate") return "medium";
  return "low";
}

function buildReason(
  label: string,
  departureTime: Date,
  trafficLevel: TrafficLevel,
  isNight: boolean,
): string {
  if (isNight)
    return "Night travel (12am–5am): Traffic is typically minimal. Expect smooth roads.";
  const timeStr = formatTime(departureTime);
  const hour = departureTime.getHours();

  if (label === "Recommended") {
    if (trafficLevel === "low")
      return `Leave at ${timeStr} — light traffic expected, smooth journey ahead.`;
    if (trafficLevel === "moderate")
      return `Leave at ${timeStr} — moderate traffic but manageable conditions.`;
    return `Leave at ${timeStr} — best available option despite heavy traffic.`;
  }
  if (label === "Early" || label === "Early Morning") {
    if (hour < 7)
      return `Depart at ${timeStr} — beat the morning rush entirely.`;
    if (hour >= 17 && hour < 19)
      return `Leave early at ${timeStr} — traffic intensifies later in the evening.`;
    return `Early departure at ${timeStr} — lighter traffic than later windows.`;
  }
  if (label === "Afternoon") {
    if (trafficLevel === "low")
      return `Afternoon departure at ${timeStr} — off-peak, comfortable travel.`;
    return `Afternoon at ${timeStr} — moderate city traffic possible.`;
  }
  if (label === "Evening") {
    if (trafficLevel === "heavy")
      return `Evening at ${timeStr} — rush hour, expect some delays.`;
    return `Evening departure at ${timeStr} — traffic typically easing by this hour.`;
  }
  if (label === "Night") {
    return `Night departure at ${timeStr} — minimal traffic, smooth journey for long distances.`;
  }
  if (trafficLevel === "heavy")
    return `Latest viable option at ${timeStr} — expect significant delays.`;
  return `Leaving at ${timeStr} — traffic typically eases by then.`;
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export interface DepartureWindowParams {
  targetArrivalTime: Date;
  distanceKm: number;
  mode: TransportMode;
  isWeekend: boolean;
}

export function generateDepartureWindows(
  params: DepartureWindowParams,
): DepartureWindow[] {
  const { targetArrivalTime, distanceKm, mode, isWeekend } = params;

  const offsets: Array<{
    label: "Early" | "Recommended" | "Latest";
    minuteOffset: number;
  }> = [
    { label: "Early", minuteOffset: -60 },
    { label: "Recommended", minuteOffset: 0 },
    { label: "Latest", minuteOffset: 30 },
  ];

  const recommendedDeparture = new Date(targetArrivalTime);
  const recHour = recommendedDeparture.getHours();
  const recLevel = getTrafficLevel(recHour, isWeekend);
  const recBase = getBaseMinutes(distanceKm, mode);
  const recMultiplier = getTrafficMultiplier(recLevel, mode);
  const recTravelMins = Math.round(recBase * recMultiplier);
  recommendedDeparture.setMinutes(
    recommendedDeparture.getMinutes() - recTravelMins,
  );

  return offsets.map(({ label, minuteOffset }) => {
    const departure = new Date(
      recommendedDeparture.getTime() + minuteOffset * 60 * 1000,
    );
    const hour = departure.getHours();
    const level = getTrafficLevel(hour, isWeekend);
    const base = getBaseMinutes(distanceKm, mode);
    const multiplier = getTrafficMultiplier(level, mode);
    const travelMins = Math.round(base * multiplier);
    const arrival = new Date(departure.getTime() + travelMins * 60 * 1000);
    const isNight = isNightHour(hour);
    const delayRisk = delayRiskFromLevel(level);
    const reason = buildReason(label, departure, level, isNight);

    return {
      label,
      departureTime: departure,
      arrivalTime: arrival,
      travelMinutes: travelMins,
      trafficLevel: level,
      delayRisk,
      isNightTravel: isNight,
      reason,
    };
  });
}

export function getTimelineData(
  startHour: number,
  isWeekend: boolean,
): TimelineSlot[] {
  const slots: TimelineSlot[] = [];
  const now = new Date();
  const base = new Date(now);
  base.setHours(startHour, 0, 0, 0);

  for (let i = 0; i < 12; i++) {
    const slotTime = new Date(base.getTime() + i * 30 * 60 * 1000);
    const hour = slotTime.getHours();
    const mins = slotTime.getMinutes();
    const level = getTrafficLevel(hour, isWeekend);
    const isNight = isNightHour(hour);
    const label = `${hour % 12 === 0 ? 12 : hour % 12}:${mins === 0 ? "00" : "30"}${hour < 12 ? "am" : "pm"}`;
    slots.push({ time: slotTime, label, trafficLevel: level, isNight });
  }
  return slots;
}

export function generateOfficeHoursSlots(
  startHour: number,
  endHour: number,
  distanceKm: number,
  mode: TransportMode,
  isWeekend: boolean,
  tripDate: string,
): OfficeHoursSlot[] {
  const slots: OfficeHoursSlot[] = [];

  for (let hour = startHour; hour < endHour; hour++) {
    const dateObj = new Date(
      `${tripDate}T${String(hour).padStart(2, "0")}:00:00`,
    );
    const level = getTrafficLevel(hour, isWeekend);
    const multiplier = getTrafficMultiplier(level, mode);
    const base = getBaseMinutes(distanceKm, mode);
    const travelMinutes = Math.round(base * multiplier);
    const label = dateObj.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    slots.push({
      hour,
      label,
      travelMinutes,
      trafficLevel: level,
      trafficMultiplier: multiplier,
      isBest: false,
    });
  }

  // Mark best slot
  let bestIdx = 0;
  for (let i = 1; i < slots.length; i++) {
    if (
      slots[i].trafficMultiplier < slots[bestIdx].trafficMultiplier ||
      (slots[i].trafficMultiplier === slots[bestIdx].trafficMultiplier &&
        slots[i].travelMinutes < slots[bestIdx].travelMinutes)
    ) {
      bestIdx = i;
    }
  }
  if (slots.length > 0) slots[bestIdx].isBest = true;

  return slots;
}

export function generateLongDistanceWindows(
  params: DepartureWindowParams,
): DepartureWindow[] {
  const { distanceKm, mode, isWeekend, targetArrivalTime } = params;
  const dateStr = `${targetArrivalTime.getFullYear()}-${String(targetArrivalTime.getMonth() + 1).padStart(2, "0")}-${String(targetArrivalTime.getDate()).padStart(2, "0")}`;

  const slots: Array<{
    label: "Early Morning" | "Afternoon" | "Evening" | "Night";
    hour: number;
  }> = [
    { label: "Early Morning", hour: 5 },
    { label: "Afternoon", hour: 14 },
    { label: "Evening", hour: 19 },
    { label: "Night", hour: 23 },
  ];

  const windows: DepartureWindow[] = slots.map(({ label, hour }) => {
    const departure = new Date(
      `${dateStr}T${String(hour).padStart(2, "0")}:00:00`,
    );
    const level = getTrafficLevel(hour, isWeekend);
    const base = getBaseMinutes(distanceKm, mode);
    const multiplier = getTrafficMultiplier(level, mode);
    const travelMins = Math.round(base * multiplier);
    const arrival = new Date(departure.getTime() + travelMins * 60 * 1000);
    const isNight = isNightHour(hour);
    const delayRisk = delayRiskFromLevel(level);

    return {
      label,
      departureTime: departure,
      arrivalTime: arrival,
      travelMinutes: travelMins,
      trafficLevel: level,
      delayRisk,
      isNightTravel: isNight,
      reason: buildReason(label, departure, level, isNight),
      isBest: false,
    };
  });

  // Mark the window with lowest travel minutes as best
  let bestIdx = 0;
  for (let i = 1; i < windows.length; i++) {
    if (windows[i].travelMinutes < windows[bestIdx].travelMinutes) {
      bestIdx = i;
    }
  }
  windows[bestIdx].isBest = true;

  return windows;
}
