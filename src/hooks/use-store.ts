import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getStore } from "../api/stores-api";
import { queryKeys } from "../api/query-keys";
import type { StoreType } from "../api/types";
import useAuth from "./use-auth";

// Loads one store and exposes a helper to push a fresh copy into every cache that shows it.
const useStore = (storeId: string) => {
    const uid = useAuth((state) => state.user?.uid);
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: queryKeys.store(uid, storeId),
        queryFn: () => getStore(storeId),
        enabled: !!uid && !!storeId,
        // The stores list carries the same shape, so show it instantly while the fresh copy loads.
        placeholderData: () => queryClient.getQueryData<StoreType[]>(queryKeys.stores(uid))?.find(store => store.id === storeId),
    });

    const applyStore = (store: StoreType) => {
        queryClient.setQueryData(queryKeys.store(uid, store.id), store);
        queryClient.invalidateQueries({ queryKey: queryKeys.stores(uid), exact: true });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(uid) });
    };

    return { ...query, store: query.data, uid, applyStore };
};

export default useStore;
