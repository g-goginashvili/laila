import "./admin-auth-page.css";

import StatusChip from "../../components/status-chip/status-chip";
import CustomButton from "../../components/custom-button/custom-button";
import CheckBox from "../../components/checkbox/checkbox";
import CustomForm from "../../components/custom-form/custom-form";
import SnackBar from "../../components/snack-bar/snack-bar";
import Typography from "../../components/typography/typography";
import useAdminAuthPageController from "./use-admin-auth-page-controller";
import { signInInitialValues, signInInputFields, SignInSchema, signUpInitialValues, signUpInputFields, SignUpSchema } from "./admin-auth-page-formik-controller";
import ForgotPasswordModal from "./admin-auth-page-forgot-password";
import { Navigate } from "react-router";
import useAuth from "../../hooks/use-auth";
import HeartbeatLoader from "../../components/heartbeat-loader/heartbeat-loader";

const AdminAuthPage = () => {
    const status = useAuth((state) => state.status);
    const role = useAuth((state) => state.role);

    const {
        isForgotPassword,
        isRegistering,
        isSigningUp,
        staySignedIn,
        acceptedTerms,
        setStaySignedIn,
        setAcceptedTerms,
        toggleRegistering,
        handleSignUp,
        handleSignIn,
        handlePasswordResetModal,
    } = useAdminAuthPageController();

    // A session kept by "Stay signed in" goes straight to the dashboard; wait for Firebase to restore it
    // so the form doesn't flash first.
    if (status === "initializing") return <HeartbeatLoader isFullScreen />;
    if (status === "authenticated" && role === "admin") return <Navigate to="/dashboard" replace />;

    return (
        <main className="login-page">

            {isForgotPassword && <ForgotPasswordModal handleClose={handlePasswordResetModal} />}

            <section className="text-section">
                <div className="text-section-div">
                    <StatusChip variant="success" textValue="Reservations pouring in" />
                    <Typography
                        variant="display"
                        color="inherit"
                        size="medium"
                        weight="emphasis"
                    >
                        Every customer's reservation in one place.
                    </Typography>
                    <Typography
                        variant="body"
                        color="secondary"
                        size="large"
                    >
                        Sign in to manage reservations and details, review schedules and approve pre-orders.
                    </Typography>
                    <SnackBar
                        buttonText={isRegistering ? "Sign in" : "Jump in"}
                        onButtonClick={toggleRegistering}
                        variant="info"
                        message="Reservations are being made as you read. Get the good times rolling."
                        hasBorder={false}
                    />
                </div>
            </section>

            <section className="login-section">
                <div className="login-section-div">
                    <div className="login-section-header">
                        <Typography
                            variant="headline"
                            size="large"
                            weight="emphasis"
                        >
                            {isRegistering ? "Sign up" : "Sign in"}
                        </Typography>
                        <Typography
                            variant="body"
                            color="secondary"
                        >
                            {isRegistering ? (
                                <>Create the administrator credentials<br />to access the workspace.</>
                            ) : (
                                <>Use your administrator credentials<br />to access the workspace.</>
                            )}
                        </Typography>
                    </div>
                    {!isRegistering ?
                        <CustomForm
                            key="signInCustomForm"
                            formName="signInCustomForm"
                            initialValues={signInInitialValues}
                            validationSchema={SignInSchema}
                            inputFields={signInInputFields}
                            onSubmit={handleSignIn}
                        /> :
                        <CustomForm
                            key="signUpCustomForm"
                            formName="signUpCustomForm"
                            initialValues={signUpInitialValues}
                            validationSchema={SignUpSchema}
                            inputFields={signUpInputFields}
                            onSubmit={handleSignUp}
                        />
                    }
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        {isRegistering ?
                            <CheckBox
                                key="acceptTermsCheckBox"
                                name="acceptTerms"
                                label="Agree to the terms & conditions"
                                checked={acceptedTerms}
                                onChange={(e) => setAcceptedTerms(e.target.checked)}
                            /> :
                            <CheckBox
                                key="staySignedInCheckBox"
                                name="staySignedIn"
                                label="Stay signed in"
                                checked={staySignedIn}
                                onChange={(e) => setStaySignedIn(e.target.checked)}
                            />
                        }
                        {!isRegistering &&
                            <CustomButton
                                onClick={handlePasswordResetModal}
                                variant="text"
                            >Forgot password?
                            </CustomButton>}
                    </div>
                    <div className="buttons-div">
                        <CustomButton
                            isFitContent={false}
                            type="submit"
                            form={isRegistering ? "signUpCustomForm" : "signInCustomForm"}
                            disabled={isRegistering && isSigningUp}
                        >
                            {isRegistering ? (isSigningUp ? "Creating…" : "Create") : "Sign in"}
                        </CustomButton>
                        <CustomButton
                            variant="text"
                            className="create-account-button"
                            onClick={toggleRegistering}
                        >
                            {isRegistering ? "Back to Sign in" : "Create an account"}
                        </CustomButton>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default AdminAuthPage;