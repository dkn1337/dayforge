const dayFormatter = new Intl.DateTimeFormat("pl-PL", { weekday: "short" });
const longDateFormatter = new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "long", year: "numeric" });

export function toDateKey(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function fromDateKey(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(value: Date, amount: number): Date {
  const next = new Date(value);
  next.setDate(next.getDate() + amount);
  return next;
}

export function startOfWeekMonday(value = new Date()): Date {
  const next = new Date(value.getFullYear(), value.getMonth(), value.getDate());
  const weekday = next.getDay();
  const offset = weekday === 0 ? -6 : 1 - weekday;
  next.setDate(next.getDate() + offset);
  return next;
}

export function dateKeysForWeek(weekStart: Date): string[] {
  return Array.from({ length: 7 }, (_, index) => toDateKey(addDays(weekStart, index)));
}

export function weekdayLabel(value: Date): string {
  const raw = dayFormatter.format(value).replace(".", "");
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function formatWeekRange(weekStart: Date): string {
  const end = addDays(weekStart, 6);
  const firstDay = weekStart.getDate();
  const endDay = end.getDate();
  const firstMonth = new Intl.DateTimeFormat("pl-PL", { month: "long" }).format(weekStart);
  const endMonth = new Intl.DateTimeFormat("pl-PL", { month: "long" }).format(end);

  if (weekStart.getMonth() === end.getMonth() && weekStart.getFullYear() === end.getFullYear()) {
    return `${firstDay}–${endDay} ${firstMonth} ${weekStart.getFullYear()}`;
  }

  return `${firstDay} ${firstMonth} – ${endDay} ${endMonth} ${end.getFullYear()}`;
}

export function formatLongDate(dateKey: string): string {
  return longDateFormatter.format(fromDateKey(dateKey));
}

export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

export function timeToMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function isSameDate(left: string | null | undefined, right: string): boolean {
  return left === right;
}

export function dateKeyFromIso(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return toDateKey(date);
}

export function shortWeekdayLabel(dateKey: string): string {
  const raw = new Intl.DateTimeFormat("pl-PL", { weekday: "short" }).format(fromDateKey(dateKey)).replace(".", "");
  return raw.charAt(0).toUpperCase() + raw.slice(1, 3);
}

export function formatClockFromIso(value: string): string {
  const date = new Date(value);
  return new Intl.DateTimeFormat("pl-PL", { hour: "2-digit", minute: "2-digit" }).format(date);
}

export function differenceInCalendarDays(left: string, right: string): number {
  const leftDate = fromDateKey(left);
  const rightDate = fromDateKey(right);
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.round((leftDate.getTime() - rightDate.getTime()) / millisecondsPerDay);
}
