import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useParams, useSearchParams } from "react-router";
import useStore from "../../hooks/use-store";
import { getReservations } from "../../api/reservations-api";
import { queryKeys } from "../../api/query-keys";
import type { ReservationType, StoreType } from "../../api/types";
import { addDays, formatShortDate, serviceNow, weekdayOf } from "../../utility/service-time";
import { SLOT_MINUTES, shiftsOn } from "../../utility/availability";
import { DATE_PATTERN } from "./availability-dates";

export type ReservationDrawerType =
    | { type: "reservation", reservationId: string | null, tableId: string | null, startMinutes: number | null, fromGrid: boolean }
    | { type: "closure" }
    | null;

const DEFAULT_RANGE = { start: 12 * 60, end: 23 * 60 };

// Columns span the day's opening hours, widened to fit any booking outside them.
const gridRange = (store: StoreType, date: string, reservations: ReservationType[]) => {
    const shifts = shiftsOn(store, date);
    let start = shifts.length ? Math.min(...shifts.map(shift => shift.opensMinutes)) : DEFAULT_RANGE.start;
    let end = shifts.length ? Math.max(...shifts.map(shift => shift.closesMinutes)) : DEFAULT_RANGE.end;
    for (const reservation of reservations) {
        start = Math.min(start, reservation.startMinutes);
        end = Math.max(end, reservation.startMinutes + reservation.durationMinutes);
    }
    return {
        start: Math.floor(start / SLOT_MINUTES) * SLOT_MINUTES,
        end: Math.ceil(end / SLOT_MINUTES) * SLOT_MINUTES,
    };
};

const useStoreAvailabilityPageController = () => {
    const { storeId = "" } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const { store, uid, isLoading: isStoreLoading, error: storeError, applyStore } = useStore(storeId);
    const [drawer, setDrawer] = useState<ReservationDrawerType>(null);

    const now = store ? serviceNow(store.timezone) : null;
    const requestedDate = searchParams.get("date");
    const date = requestedDate && DATE_PATTERN.test(requestedDate) ? requestedDate : now?.date ?? "";
    const view = searchParams.get("view") === "week" ? "week" : "day";

    const weekStart = date ? addDays(date, -weekdayOf(date)) : "";
    const from = view === "week" ? weekStart : date;
    const to = view === "week" ? addDays(weekStart, 6) : date;

    const { data: reservations = [], isLoading: isReservationsLoading, error: reservationsError } = useQuery({
        queryKey: queryKeys.reservations(uid, storeId, from, to),
        queryFn: () => getReservations({ storeId, from, to }),
        enabled: !!uid && !!storeId && !!from,
        refetchInterval: 60_000,
    });

    const setParams = (next: { date?: string, view?: "day" | "week" }) => {
        const params: Record<string, string> = {};
        const nextDate = next.date ?? date;
        const nextView = next.view ?? view;
        if (nextDate && nextDate !== now?.date) params.date = nextDate;
        if (nextView === "week") params.view = "week";
        setSearchParams(params, { replace: true });
    };

    const visible = reservations.filter(reservation => reservation.status !== "cancelled");
    const dayReservations = visible.filter(reservation => reservation.date === date);
    const isToday = !!now && date === now.date;

    return {
        storeId,
        store,
        applyStore,
        isLoading: isStoreLoading || (isReservationsLoading && !reservations.length),
        error: storeError ?? reservationsError,
        now,
        date,
        dateLabel: date ? formatShortDate(date) : "",
        isToday,
        view,
        goToDate: (nextDate: string) => setParams({ date: nextDate }),
        shiftDate: (days: number) => setParams({ date: addDays(date, view === "week" ? days * 7 : days) }),
        goToToday: () => setParams({ date: now?.date ?? date }),
        setView: (nextView: "day" | "week") => setParams({ view: nextView }),
        openDay: (nextDate: string) => setParams({ date: nextDate, view: "day" }),
        reservations,
        dayReservations,
        cancelledCount: reservations.filter(reservation => reservation.date === date && reservation.status === "cancelled").length,
        range: store && date ? gridRange(store, date, dayReservations) : DEFAULT_RANGE,
        shifts: store && date ? shiftsOn(store, date) : [],
        closure: store?.closures.find(entry => entry.date === date) ?? null,
        weekStart,
        drawer,
        setDrawer,
    };
};

export default useStoreAvailabilityPageController;
