// Mirrors laila-core/src/utils/service-time.ts: a service day runs until 06:00 the
// next morning, and after-midnight times are counted past 1440 minutes.
import type { ServiceNowType } from "../api/types";

export const SERVICE_DAY_CUTOFF_MINUTES = 6 * 60;
export const MINUTES_PER_DAY = 24 * 60;

const toUtcDate = (date: string) => new Date(`${date}T00:00:00Z`);

export const addDays = (date: string, days: number) => {
    const value = toUtcDate(date);
    value.setUTCDate(value.getUTCDate() + days);
    return value.toISOString().slice(0, 10);
};

// 0 = Monday … 6 = Sunday
export const weekdayOf = (date: string) => (toUtcDate(date).getUTCDay() + 6) % 7;

export const startOfMonth = (date: string) => `${date.slice(0, 7)}-01`;

// Same day in another month, clamped to that month's last day (31 Jan + 1 month → 28/29 Feb).
export const addMonths = (date: string, months: number) => {
    const value = toUtcDate(startOfMonth(date));
    value.setUTCMonth(value.getUTCMonth() + months);
    const lastDay = new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth() + 1, 0)).getUTCDate();
    value.setUTCDate(Math.min(Number(date.slice(8, 10)), lastDay));
    return value.toISOString().slice(0, 10);
};

// Today's date (YYYY-MM-DD) in the browser's time zone.
export const localToday = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

export const serviceNow = (timeZone: string, at: Date = new Date()): ServiceNowType => {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    }).formatToParts(at);
    const get = (type: string) => parts.find(part => part.type === type)?.value ?? "00";

    const calendarDate = `${get("year")}-${get("month")}-${get("day")}`;
    const minutes = Number(get("hour")) * 60 + Number(get("minute"));

    return minutes < SERVICE_DAY_CUTOFF_MINUTES
        ? { date: addDays(calendarDate, -1), minutes: minutes + MINUTES_PER_DAY }
        : { date: calendarDate, minutes };
};

export const formatMinutes = (minutes: number) => {
    const wrapped = ((minutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
    return `${String(Math.floor(wrapped / 60)).padStart(2, "0")}:${String(wrapped % 60).padStart(2, "0")}`;
};

// "HH:MM" → minutes; times before 06:00 belong to the end of the service day.
export const parseServiceTime = (value: string) => {
    const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
    if (!match) return null;
    const minutes = Number(match[1]) * 60 + Number(match[2]);
    if (minutes >= MINUTES_PER_DAY) return null;
    return minutes < SERVICE_DAY_CUTOFF_MINUTES ? minutes + MINUTES_PER_DAY : minutes;
};

const dateFormat = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", ...options });

// "Thu 17 Sep 2026"
export const formatShortDate = (date: string) =>
    dateFormat({ weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(toUtcDate(date)).replace(",", "");

// "October 2026"
export const formatMonthYear = (date: string) =>
    dateFormat({ month: "long", year: "numeric" }).format(toUtcDate(date));

// "Thursday 17 September"
export const formatLongDate = (date: string) =>
    dateFormat({ weekday: "long", day: "numeric", month: "long" }).format(toUtcDate(date)).replace(",", "");

// "Thu 17"
export const formatDayLabel = (date: string) =>
    dateFormat({ weekday: "short", day: "numeric" }).format(toUtcDate(date)).replace(",", "");

// "Thursday 17 September 2026", for screen readers on calendar days
export const formatFullDate = (date: string) =>
    dateFormat({ weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(toUtcDate(date)).replace(",", "");

// "14 May 2019"
export const formatDayMonthYear = (date: string) =>
    dateFormat({ day: "numeric", month: "long", year: "numeric" }).format(toUtcDate(date));

export const formatTimestampDate = (iso: string) =>
    new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));

export const WEEKDAYS = [
    { name: "Monday", short: "Mon" },
    { name: "Tuesday", short: "Tue" },
    { name: "Wednesday", short: "Wed" },
    { name: "Thursday", short: "Thu" },
    { name: "Friday", short: "Fri" },
    { name: "Saturday", short: "Sat" },
    { name: "Sunday", short: "Sun" },
];

export const formatEuro = (amount: number) =>
    `€${amount.toFixed(2).replace(".", ",")}`;
