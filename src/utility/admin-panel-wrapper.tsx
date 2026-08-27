import "./admin-panel-wrapper.css"

import { Navigate, Outlet, useNavigate } from "react-router";
import useAuth from "../hooks/use-auth";
import Typography from "../components/typography/typography";
import CustomButton from "../components/custom-button/custom-button";
import { sendEmailVerification } from "firebase/auth";
import { useSnackBar } from "../components/snack-bar/snack-bar-context";
import AdminPanelNavigation from "../modules/admin-panel-navigation/admin-panel-navigation";
import Modal from "../components/modal/modal";

const AdminRequireGuard = () => {
    const status = useAuth((state) => state.status);
    const role = useAuth((state) => state.role);
    const user = useAuth((state) => state.user);

    const { addSnackBar } = useSnackBar();
    const navigate = useNavigate();

    if (status === "initializing") return <div>Loading…</div>;
    if (status === "unauthenticated") return <Navigate to="/admin-auth" replace />;
    if (role !== "admin") return <Navigate to="/" replace />;

    const handleSendVerification = async () => {
        user && await sendEmailVerification(user);
        addSnackBar("Verification sent.")
    };

    return (
        <>
            {!user?.emailVerified &&
                <Modal>
                    <Typography
                        variant="title"
                        color="primary"
                        weight="emphasis"
                    >
                        Email Verification Requiered
                    </Typography>
                    <Typography
                        variant="body"
                        color="secondary"
                        size="medium"
                    >
                        Hi {user?.displayName?.split(" ")[0]}, Please verify your email address:{" "}
                        <strong>{user?.email}</strong>
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
                        onClick={() => { navigate("/admin-auth", { replace: true }) }}
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
            <div className="admin-panel-wrapper" >
                <AdminPanelNavigation />
                <Outlet />
            </div>
        </>
    );
};

export default AdminRequireGuard;