import type { StoreType } from "../api/types";
import { formatMinutes, serviceNow } from "./service-time";
import { shiftsOn } from "./availability";

export type ChipToneType = "success" | "warning" | "error" | "info" | "neutral" | "secondary";

type StatusChipType = { tone: ChipToneType, label: string };

export const storeToday = (store: StoreType) => serviceNow(store.timezone).date;

export const formatShift = (shift: { opensMinutes: number, closesMinutes: number }) =>
    `${formatMinutes(shift.opensMinutes)}–${formatMinutes(shift.closesMinutes)}`;

export const storeStatusChip = (store: StoreType, variant: "list" | "details" = "list"): StatusChipType => {
    if (store.status === "draft") return { tone: "neutral", label: variant === "details" ? "Draft — hidden from diners" : "Draft" };
    if (store.status === "temporarily_closed") return { tone: "warning", label: "Temporarily closed" };
    if (variant === "list" && shiftsOn(store, storeToday(store)).length === 0) return { tone: "neutral", label: "Closed today" };
    return { tone: "success", label: "Accepting reservations" };
};

export const todayHoursLabel = (store: StoreType) => {
    if (store.status === "temporarily_closed") return "Temporarily closed";
    const shifts = shiftsOn(store, storeToday(store));
    return shifts.length ? shifts.map(formatShift).join(" · ") : "Closed today";
};

export const streetLine = (store: Pick<StoreType, "address" | "postcode" | "city">) =>
    [store.address, [store.postcode, store.city].filter(Boolean).join(" ")].filter(Boolean).join(", ");

export const seatCount = (store: Pick<StoreType, "tables">) =>
    store.tables.reduce((total, table) => total + table.seats, 0);
