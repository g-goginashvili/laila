import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useParams, useSearchParams } from "react-router";
import useStore from "../../hooks/use-store";
import { getReservations } from "../../api/reservations-api";
import { queryKeys } from "../../api/query-keys";
import { addDays, serviceNow } from "../../utility/service-time";

export type ReservationsScopeType = "upcoming" | "past";

// The API serves at most 42 days per request, so each scope covers six weeks either side of today.
const RANGE_DAYS = 41;

const useStoreReservationsPageController = () => {
    const { storeId = "" } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const { store, uid, isLoading: isStoreLoading, error: storeError } = useStore(storeId);
    const [drawer, setDrawer] = useState<{ reservationId: string | null } | null>(null);

    const now = store ? serviceNow(store.timezone) : null;
    const today = now?.date ?? "";
    const scope: ReservationsScopeType = searchParams.get("scope") === "past" ? "past" : "upcoming";
    const from = !today ? "" : scope === "past" ? addDays(today, -RANGE_DAYS - 1) : today;
    const to = !today ? "" : scope === "past" ? addDays(today, -1) : addDays(today, RANGE_DAYS);

    const { data = [], isLoading: isReservationsLoading, error: reservationsError } = useQuery({
        queryKey: queryKeys.reservations(uid, storeId, from, to),
        queryFn: () => getReservations({ storeId, from, to }),
        enabled: !!uid && !!storeId && !!from,
        refetchInterval: 60_000,
    });

    // The API returns oldest first; past bookings read better most recent first.
    const reservations = scope === "past" ? [...data].reverse() : data;
    const tableLabels = new Map(store?.tables.map(table => [table.id, table.label]));

    return {
        storeId,
        store,
        uid,
        today,
        from,
        to,
        scope,
        setScope: (next: ReservationsScopeType) => setSearchParams(next === "past" ? { scope: "past" } : {}, { replace: true }),
        isLoading: isStoreLoading || isReservationsLoading,
        error: storeError ?? reservationsError,
        reservations,
        tableLabel: (tableId: string | null) => (tableId && tableLabels.get(tableId)) || null,
        drawer,
        setDrawer,
    };
};

export default useStoreReservationsPageController;
