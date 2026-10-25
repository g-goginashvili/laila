import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useStore from "../../hooks/use-store";
import { setTableOccupancy } from "../../api/stores-api";
import { queryKeys } from "../../api/query-keys";
import type { StoreTableType, StoreType } from "../../api/types";
import { useSnackBar } from "../../components/snack-bar/snack-bar-context";
import { errorMessage } from "../../utility/validation";

const TICK_MS = 30_000;

export type TableCardType = StoreTableType & {
    occupied: boolean;
    occupiedLabel: string | null;
};

// "19:05 · 25 min" in the store's time zone.
const occupiedLabel = (since: string, timeZone: string, nowMs: number) => {
    const clock = new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(since));
    const minutes = Math.max(0, Math.floor((nowMs - Date.parse(since)) / 60_000));
    const elapsed = minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
    return `Since ${clock} · ${elapsed}`;
};

const useStoreTablesPageController = () => {
    const { storeId = "" } = useParams();
    const { store, isLoading, error, uid, applyStore } = useStore(storeId);
    const queryClient = useQueryClient();
    const { addSnackBar } = useSnackBar();
    const [isEditing, setIsEditing] = useState(false);
    const [nowMs, setNowMs] = useState(() => Date.now());

    // Keeps "occupied for …" current while the page stays open.
    useEffect(() => {
        const timer = window.setInterval(() => setNowMs(Date.now()), TICK_MS);
        return () => window.clearInterval(timer);
    }, []);

    const storeKey = queryKeys.store(uid, storeId);

    const { mutate, isPending, variables } = useMutation({
        mutationFn: setTableOccupancy,
        // Flip the card straight away; roll back if the server says no.
        onMutate: async ({ tableId, occupied }) => {
            await queryClient.cancelQueries({ queryKey: storeKey });
            const previous = queryClient.getQueryData<StoreType>(storeKey);
            if (previous) {
                queryClient.setQueryData<StoreType>(storeKey, {
                    ...previous,
                    tables: previous.tables.map(table => table.id === tableId
                        ? { ...table, occupiedSince: occupied ? table.occupiedSince ?? new Date().toISOString() : null }
                        : table),
                });
            }
            return { previous };
        },
        onError: (mutationError, _variables, context) => {
            if (context?.previous) queryClient.setQueryData(storeKey, context.previous);
            addSnackBar(errorMessage(mutationError, "Could not update the table."), { variant: "error" });
        },
        onSuccess: (table) => addSnackBar(table.occupiedSince ? `${table.label} marked occupied.` : `${table.label} is free again.`),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: storeKey });
            queryClient.invalidateQueries({ queryKey: queryKeys.stores(uid), exact: true });
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(uid) });
        },
    });

    const tables: TableCardType[] = (store?.tables ?? []).map(table => ({
        ...table,
        occupied: !!table.occupiedSince,
        occupiedLabel: table.occupiedSince && store ? occupiedLabel(table.occupiedSince, store.timezone, nowMs) : null,
    }));

    const free = tables.filter(table => !table.occupied);

    return {
        storeId,
        store,
        isLoading,
        error,
        applyStore,
        tables,
        freeCount: free.length,
        toggle: (table: TableCardType) => mutate({ id: storeId, tableId: table.id, occupied: !table.occupied }),
        isToggling: (tableId: string) => isPending && variables?.tableId === tableId,
        isEditing,
        setIsEditing,
    };
};

export default useStoreTablesPageController;
