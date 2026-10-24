import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { FormikHelpers } from "formik";
import { addStore, getStoresList } from "../../api/stores-api";
import { queryKeys } from "../../api/query-keys";
import useAuth from "../../hooks/use-auth";
import { useSnackBar } from "../../components/snack-bar/snack-bar-context";
import { errorMessage } from "../../utility/validation";
import { formValuesToStore } from "./store-form-config";

const useStoresPageController = () => {
    const uid = useAuth((state) => state.user?.uid);
    const queryClient = useQueryClient();
    const { addSnackBar } = useSnackBar();

    const [isAdding, setIsAdding] = useState<boolean>(false);

    const queryStores = useQuery({
        queryKey: queryKeys.stores(uid),
        queryFn: getStoresList,
        enabled: !!uid
    });

    const { mutate: addStoreMutation, isPending: isSaving } = useMutation({
        mutationFn: addStore,
        onSuccess: (store) => {
            addSnackBar(`${store.storeName} added.`);
            queryClient.invalidateQueries({ queryKey: queryKeys.stores(uid) });
            queryClient.invalidateQueries({ queryKey: queryKeys.organisation(uid) });
        },
        onError: (error) => { addSnackBar(errorMessage(error), { variant: "error" }) }
    });

    const handleAddStore = (
        values: Record<string, string>,
        formikHelpers: FormikHelpers<Record<string, string>>
    ) => {
        addStoreMutation(formValuesToStore(values), {
            onSuccess: () => {
                formikHelpers.resetForm();
                setIsAdding(false);
            }
        });
    };

    return {
        stores: queryStores.data ?? [],
        isLoading: queryStores.isLoading,
        isError: queryStores.isError,
        error: queryStores.error,
        isAdding,
        isSaving,
        setIsAdding,
        handleAddStore,
    };
};

export default useStoresPageController;
