import { useQuery } from "@tanstack/react-query"
import { getStoresList } from "../../api/stores-api"
import { useState } from "react";
import useAuth from "../../hooks/use-auth";
import { useMatch } from "react-router";
import { getOrganisationDetails } from "../../api/organisations-api";

const useAdminPanelNavigationController = () => {
    const user = useAuth((state) => state.user);

    const queryOrganisationDetails = useQuery({
        queryKey: ["getOrganisationDetails", user?.uid],
        queryFn: () => getOrganisationDetails(user!.uid),
        enabled: !!user
    });

    const [organisation] = queryOrganisationDetails.data ?? [];

    const queryStoresList = useQuery({
        queryKey: ["getStores", organisation?.id],
        queryFn: () => getStoresList(organisation?.id),
        enabled: !!organisation?.id
    });

    const stores = queryStoresList.data ?? [];

    const [isOptionsActive, setIsOptionsActive] = useState<boolean>(false);

    const isStoresSection = Boolean(useMatch("/stores/*"));
    const storesMatch = useMatch("/stores/:storeId/:option");

    return {
        organisation,
        stores,
        isOptionsActive,
        user,
        isStoresSection,
        storesMatch,
        setIsOptionsActive
    };
};

export default useAdminPanelNavigationController;