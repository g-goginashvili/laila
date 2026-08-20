import { create } from "zustand";
import type { User } from "firebase/auth";

type AuthState = {
    status: "initializing" | "authenticated" | "unauthenticated";
    user: User | null;
    role: string | null;
};

const useAuth = create<AuthState>(() => ({
    status: "initializing",
    user: null,
    role: null
}));

export default useAuth;