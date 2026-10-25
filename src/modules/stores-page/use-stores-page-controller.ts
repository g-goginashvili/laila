import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { getStoresList } from "../../api/stores-api";
import { queryKeys } from "../../api/query-keys";
import useAuth from "../../hooks/use-auth";

const useStoresPageController = () => {
    const uid = useAuth((state) => state.user?.uid);
    const [searchParams, setSearchParams] = useSearchParams();

    const queryStores = useQuery({
        queryKey: queryKeys.stores(uid),
        queryFn: getStoresList,
        enabled: !!uid
    });

    const stores = queryStores.data ?? [];
    const isAdding = searchParams.get("new") === "1";

    const setIsAdding = (adding: boolean) => setSearchParams(adding ? { new: "1" } : {}, { replace: true });

    return {
        stores,
        acceptingCount: stores.filter(store => store.status === "open").length,
        isLoading: queryStores.isLoading,
        error: queryStores.error,
        isAdding,
        setIsAdding,
    };
};

export default useStoresPageController;
