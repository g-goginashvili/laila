// Mirrors laila-core/src/utils/availability.ts so the grid and the reservation
// drawer can show free tables without a round trip.
import type { ReservationStatusType, ReservationType, StoreShiftType, StoreType } from "../api/types";
import { weekdayOf } from "./service-time";

export const SLOT_MINUTES = 30;
const LUNCH_ENDS_MINUTES = 16 * 60;

export const ACTIVE_STATUSES: ReservationStatusType[] = ["unconfirmed", "confirmed", "seated"];

type StorePolicyType = Pick<StoreType, "tableTimeMinutes" | "lunchTableTimeMinutes" | "lastSeatingMinutes">;

export const tableTimeFor = (store: StorePolicyType, startMinutes: number) =>
    store.lunchTableTimeMinutes && startMinutes < LUNCH_ENDS_MINUTES ? store.lunchTableTimeMinutes : store.tableTimeMinutes;

export const shiftsOn = (store: Pick<StoreType, "hours" | "closures">, date: string): StoreShiftType[] => {
    if (store.closures.some(closure => closure.date === date)) return [];
    return store.hours.filter(shift => shift.weekday === weekdayOf(date)).sort((a, b) => a.opensMinutes - b.opensMinutes);
};

export const bookableStarts = (store: StorePolicyType, shifts: StoreShiftType[]) =>
    shifts.flatMap(shift => {
        const starts: number[] = [];
        const firstSlot = Math.ceil(shift.opensMinutes / SLOT_MINUTES) * SLOT_MINUTES;
        for (let start = firstSlot; start <= shift.closesMinutes - store.lastSeatingMinutes; start += SLOT_MINUTES) {
            starts.push(start);
        }
        return starts;
    });

export const overlaps = (
    reservation: Pick<ReservationType, "startMinutes" | "durationMinutes">,
    start: number,
    duration: number
) => reservation.startMinutes < start + duration && reservation.startMinutes + reservation.durationMinutes > start;

export const isTableFree = (
    tableId: string,
    start: number,
    duration: number,
    dayReservations: ReservationType[],
    ignoreId?: string
) => !dayReservations.some(reservation =>
    reservation.id !== ignoreId
    && reservation.tableId === tableId
    && ACTIVE_STATUSES.includes(reservation.status)
    && overlaps(reservation, start, duration)
);
