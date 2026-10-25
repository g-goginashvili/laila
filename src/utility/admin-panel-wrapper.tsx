import "./admin-panel-wrapper.css"

import { Navigate, Outlet, useNavigate } from "react-router";
import useAuth from "../hooks/use-auth";
import Typography from "../components/typography/typography";
import CustomButton from "../components/custom-button/custom-button";
import { sendEmailVerification } from "firebase/auth";
import { useSnackBar } from "../components/snack-bar/snack-bar-context";
import AdminPanelNavigation from "../modules/admin-panel-navigation/admin-panel-navigation";
import Modal from "../components/modal/modal";
import { firebaseAuth } from "./firebase";
import useAdminTheme from "../hooks/use-admin-theme";

const AdminRequireGuard = () => {
    const status = useAuth((state) => state.status);
    const role = useAuth((state) => state.role);
    const user = useAuth((state) => state.user);

    const { addSnackBar } = useSnackBar();
    const navigate = useNavigate();
    const theme = useAdminTheme();

    if (status === "initializing") return <div>Loading…</div>;
    if (status === "unauthenticated") return <Navigate to="/admin-auth" replace />;
    if (role !== "admin") return <Navigate to="/" replace />;

    const handleSendVerification = async () => {
        if (!user) return;
        try {
            await sendEmailVerification(user);
            addSnackBar("Verification sent.");
        } catch {
            addSnackBar("Could not send the verification email. Try again later.", { variant: "error" });
        }
    };

    const handleReturnToSignIn = async () => {
        await firebaseAuth.signOut();
        navigate("/admin-auth", { replace: true });
    };

    return (
        <div className="admin-theme admin-shell" data-theme={theme}>
            {!user?.emailVerified &&
                <Modal>
                    <Typography
                        variant="title"
                        color="primary"
                        weight="emphasis"
                    >
                        Email Verification Required
                    </Typography>
                    <Typography
                        variant="body"
                        color="secondary"
                        size="medium"
                    >
                        Hi {user?.displayName?.split(" ")[0]}, Please verify your email address:{" "}
                        <strong>{user?.email}</strong>. Once verified, sign in again.
                    </Typography>
                    <CustomButton
                        isFitContent={false}
                        onClick={handleSendVerification}
                        className="verification-button"
                    >
                        Send Verification Email
                    </CustomButton>
                    <CustomButton
                        variant="text"
                        onClick={handleReturnToSignIn}
                        className="return-button"
                    >
                        Return to Sign In Page
                    </CustomButton>
                    <Typography
                        variant="body"
                        size="small"
                        color="muted">
                        In case of any question contact us at info@gviano.com
                    </Typography>
                </Modal>
            }
            <AdminPanelNavigation />
            <div className="admin-shell-content">
                <Outlet />
            </div>
        </div>
    );
};

export default AdminRequireGuard;
