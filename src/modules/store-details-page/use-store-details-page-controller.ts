import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { deleteStore, getStore, updateStore } from "../../api/stores-api";
import { queryKeys } from "../../api/query-keys";
import useAuth from "../../hooks/use-auth";
import { useSnackBar } from "../../components/snack-bar/snack-bar-context";
import { errorMessage } from "../../utility/validation";
import { formValuesToStore } from "../stores-page/store-form-config";

const useStoreDetailsPageController = () => {
    const { storeId = "" } = useParams();
    const uid = useAuth((state) => state.user?.uid);
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { addSnackBar } = useSnackBar();

    const [isConfirmingDelete, setIsConfirmingDelete] = useState<boolean>(false);

    const queryStore = useQuery({
        queryKey: queryKeys.store(uid, storeId),
        queryFn: () => getStore(storeId),
        enabled: !!uid && !!storeId
    });

    const { mutate: updateStoreMutation, isPending: isSaving } = useMutation({
        mutationFn: updateStore,
        onSuccess: (store) => {
            addSnackBar("Store updated.");
            queryClient.setQueryData(queryKeys.store(uid, store.id), store);
            queryClient.invalidateQueries({ queryKey: queryKeys.stores(uid) });
        },
        onError: (error) => { addSnackBar(errorMessage(error), { variant: "error" }) }
    });

    const { mutate: deleteStoreMutation, isPending: isDeleting } = useMutation({
        mutationFn: deleteStore,
        onSuccess: () => {
            addSnackBar("Store deleted.");
            queryClient.removeQueries({ queryKey: queryKeys.store(uid, storeId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.stores(uid) });
            navigate("/stores", { replace: true });
        },
        onError: (error) => { addSnackBar(errorMessage(error), { variant: "error" }) }
    });

    const handleSave = (values: Record<string, string>) => {
        updateStoreMutation({ id: storeId, values: formValuesToStore(values) });
    };

    const handleDelete = () => {
        deleteStoreMutation(storeId);
    };

    return {
        store: queryStore.data,
        isLoading: queryStore.isLoading,
        isError: queryStore.isError,
        error: queryStore.error,
        isSaving,
        isDeleting,
        isConfirmingDelete,
        setIsConfirmingDelete,
        handleSave,
        handleDelete,
    };
};

export default useStoreDetailsPageController;
