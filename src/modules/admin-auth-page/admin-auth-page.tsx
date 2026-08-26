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

export const AdminAuthPage = () => {
    const {
        isForgotPassword,
        isRegistering,
        setIsRegistering,
        handleSignUp,
        handleSignIn,
        handlePasswordResetModal,
    } = useAdminAuthPageController();

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
                        Every customers reservation in one place.
                    </Typography>
                    <Typography
                        variant="body"
                        color="secondary"
                        size="large"
                    >
                        Sign in to manage reservations and details, review schedules and aproove pre-orders.
                    </Typography>
                    <SnackBar
                        buttonText={isRegistering ? "Sign in" : "Jump in"}
                        onButtonClick={() => setIsRegistering(prev => !prev)}
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
                            onSubmit={isRegistering ? handleSignUp : handleSignIn}
                        />
                    }
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <CheckBox
                            name="Gocha"
                            label={isRegistering ? "Agree to the terms & conditions" : "Stay signed in"}
                        />
                        {!isRegistering &&
                            <CustomButton
                                onClick={handlePasswordResetModal}
                                variant="text"
                            >Forgot password ?
                            </CustomButton>}
                    </div>
                    <div className="buttons-div">
                        <CustomButton
                            isFitContent={false}
                            type="submit"
                            form={isRegistering ? "signUpCustomForm" : "signInCustomForm"}
                        >
                            {isRegistering ? "Create" : "Sign in"}
                        </CustomButton>
                        <CustomButton
                            variant="text"
                            className="create-account-button"
                            onClick={() => setIsRegistering(prev => !prev)}
                        >
                            {isRegistering ? "Back to Sign in" : "Create an account"}
                        </CustomButton>
                    </div>
                </div>
            </section>
        </main>
    );
};