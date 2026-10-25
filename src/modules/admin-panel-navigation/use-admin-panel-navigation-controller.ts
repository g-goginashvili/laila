import { useQuery } from "@tanstack/react-query"
import { getStoresList } from "../../api/stores-api"
import { useState } from "react";
import useAuth from "../../hooks/use-auth";
import { useMatch, useNavigate } from "react-router";
import { getOrganisationDetails } from "../../api/organisations-api";
import { queryKeys } from "../../api/query-keys";
import { firebaseAuth } from "../../utility/firebase";
import { useAdminThemeStore } from "../../hooks/use-admin-theme";

const useAdminPanelNavigationController = () => {
    const user = useAuth((state) => state.user);
    const navigate = useNavigate();

    const { data: organisation } = useQuery({
        queryKey: queryKeys.organisation(user?.uid),
        queryFn: getOrganisationDetails,
        enabled: !!user
    });

    const { data: stores = [] } = useQuery({
        queryKey: queryKeys.stores(user?.uid),
        queryFn: getStoresList,
        enabled: !!user
    });

    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState<boolean>(false);
    const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
    const themeMode = useAdminThemeStore((state) => state.mode);
    const setThemeMode = useAdminThemeStore((state) => state.setMode);

    const storeMatch = useMatch("/stores/:storeId/:section");
    const activeStoreId = storeMatch?.params.storeId;
    const activeSection = storeMatch?.params.section;

    const closeMenus = () => {
        setIsMobileNavOpen(false);
        setIsAccountMenuOpen(false);
    };

    const initials = (user?.displayName ?? user?.email ?? "")
        .split(/\s+/)
        .filter((_, index, parts) => index === 0 || index === parts.length - 1)
        .map(part => part[0]?.toUpperCase() ?? "")
        .join("");

    const handleSignOut = async () => {
        await firebaseAuth.signOut();
        navigate("/admin-auth", { replace: true });
    };

    return {
        organisation,
        stores,
        user,
        initials,
        activeStoreId,
        activeSection,
        isAccountMenuOpen,
        isMobileNavOpen,
        themeMode,
        setThemeMode,
        setIsAccountMenuOpen,
        setIsMobileNavOpen,
        closeMenus,
        handleSignOut,
    };
};

export default useAdminPanelNavigationController;
