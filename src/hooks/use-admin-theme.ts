import { useEffect, useState } from "react";
import { create } from "zustand";

export type AdminThemeModeType = "system" | "light" | "dark";

const STORAGE_KEY = "gviano-admin-theme";

const readStoredMode = (): AdminThemeModeType => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored === "light" || stored === "dark" ? stored : "system";
    } catch {
        return "system";
    }
};

type AdminThemeStateType = {
    mode: AdminThemeModeType;
    setMode: (mode: AdminThemeModeType) => void;
};

export const useAdminThemeStore = create<AdminThemeStateType>((set) => ({
    mode: readStoredMode(),
    setMode: (mode) => {
        try {
            if (mode === "system") localStorage.removeItem(STORAGE_KEY);
            else localStorage.setItem(STORAGE_KEY, mode);
        } catch {
            // Storage can be unavailable (private mode); the choice still applies for this session.
        }
        set({ mode });
    },
}));

const DARK_QUERY = "(prefers-color-scheme: dark)";

// The theme actually applied: the saved choice, or the OS setting for "system".
const useAdminTheme = (): "light" | "dark" => {
    const mode = useAdminThemeStore((state) => state.mode);
    const [prefersDark, setPrefersDark] = useState(() => window.matchMedia(DARK_QUERY).matches);

    useEffect(() => {
        const query = window.matchMedia(DARK_QUERY);
        const onChange = (event: MediaQueryListEvent) => setPrefersDark(event.matches);
        query.addEventListener("change", onChange);
        return () => query.removeEventListener("change", onChange);
    }, []);

    return mode === "system" ? (prefersDark ? "dark" : "light") : mode;
};

export default useAdminTheme;
