import { useQuery } from "@tanstack/react-query"
import { getStoresList } from "../../api/stores-api"
import { useState } from "react";
import useAuth from "../../hooks/use-auth";
import { useMatch, useNavigate } from "react-router";
import { getOrganisationDetails } from "../../api/organisations-api";
import { queryKeys } from "../../api/query-keys";
import { firebaseAuth } from "../../utility/firebase";

const useAdminPanelNavigationController = () => {
    const user = useAuth((state) => state.user);
    const navigate = useNavigate();

    const queryOrganisationDetails = useQuery({
        queryKey: queryKeys.organisation(user?.uid),
        queryFn: getOrganisationDetails,
        enabled: !!user
    });

    const organisation = queryOrganisationDetails.data;

    const queryStoresList = useQuery({
        queryKey: queryKeys.stores(user?.uid),
        queryFn: getStoresList,
        enabled: !!user
    });

    const stores = queryStoresList.data ?? [];

    const [isOptionsActive, setIsOptionsActive] = useState<boolean>(false);

    const isStoresSection = Boolean(useMatch("/stores/*"));
    const storesMatch = useMatch("/stores/:storeId/:option");

    const handleSignOut = async () => {
        await firebaseAuth.signOut();
        navigate("/admin-auth", { replace: true });
    };

    return {
        organisation,
        stores,
        isOptionsActive,
        user,
        isStoresSection,
        storesMatch,
        setIsOptionsActive,
        handleSignOut
    };
};

export default useAdminPanelNavigationController;
