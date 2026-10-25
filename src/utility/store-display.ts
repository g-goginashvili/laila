import type { StoreType } from "../api/types";
import { formatMinutes, serviceNow } from "./service-time";
import { shiftsOn } from "./availability";

export type ChipToneType = "success" | "warning" | "error" | "info" | "neutral" | "secondary";

type StatusChipType = { tone: ChipToneType, label: string };

export const storeToday = (store: StoreType) => serviceNow(store.timezone).date;

export const formatShift = (shift: { opensMinutes: number, closesMinutes: number }) =>
    `${formatMinutes(shift.opensMinutes)}–${formatMinutes(shift.closesMinutes)}`;

// Whether the store opens today (hours and whole-day closures); booking status is shown separately.
export const storeOpenTodayChip = (store: StoreType): StatusChipType =>
    store.status !== "temporarily_closed" && shiftsOn(store, storeToday(store)).length > 0
        ? { tone: "success", label: "Open today" }
        : { tone: "neutral", label: "Closed today" };

export const isAcceptingReservations = (store: Pick<StoreType, "status">) => store.status === "open";

export const streetLine = (store: Pick<StoreType, "address" | "postcode" | "city">) =>
    [store.address, [store.postcode, store.city].filter(Boolean).join(" ")].filter(Boolean).join(", ");

export const seatCount = (store: Pick<StoreType, "tables">) =>
    store.tables.reduce((total, table) => total + table.seats, 0);
