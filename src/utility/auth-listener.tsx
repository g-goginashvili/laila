import { useEffect, type ReactNode } from "react";
import { onIdTokenChanged } from "firebase/auth";
import { firebaseAuth } from "./firebase";
import useAuth from "../hooks/use-auth";

const AuthListener = ({
    children
}: { children: ReactNode }) => {
    useEffect(() =>
        onIdTokenChanged(firebaseAuth, async (user) => {
            if (!user) {
                useAuth.setState({ status: "unauthenticated", user: null, role: null });
                return;
            }
            const { claims } = await user.getIdTokenResult();
            useAuth.setState({
                status: "authenticated",
                user,
                role: claims.role as string
            });
        }), []);

    return <>{children}</>;
};

export default AuthListener;