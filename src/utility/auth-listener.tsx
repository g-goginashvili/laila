import { useEffect, type ReactNode } from "react";
import { onIdTokenChanged } from "firebase/auth";
import { useQueryClient } from "@tanstack/react-query";
import { firebaseAuth } from "./firebase";
import useAuth from "../hooks/use-auth";

const AuthListener = ({
    children
}: { children: ReactNode }) => {
    const queryClient = useQueryClient();

    useEffect(() =>
        onIdTokenChanged(firebaseAuth, async (user) => {
            if (!user) {
                queryClient.clear();
                useAuth.setState({ status: "unauthenticated", user: null, role: null });
                return;
            }
            const { claims } = await user.getIdTokenResult();
            useAuth.setState({
                status: "authenticated",
                user,
                role: typeof claims.role === "string" ? claims.role : null
            });
        }), [queryClient]);

    return <>{children}</>;
};

export default AuthListener;
