import StatusChip from "../../components/status-chip/status-chip";
import CustomButton from "../../components/custom-button/custom-button";
import CheckBox from "../../components/checkbox/checkbox";
import CustomForm from "../../components/custom-form/custom-form";
import SnackBar from "../../components/snack-bar/snack-bar";
import Typography from "../../components/typography/typography";
import "./login-page.css";
import * as Yup from 'yup';
// import useLoginPageController from "./use-login-page-controller";
import { useState } from "react";

const LoginSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Required"),
    password: Yup.string().required("Required"),
});

export const LoginPage = () => {
    // const { handleSignIn } = useLoginPageController();
    const [isRegistering, setIsRegistering] = useState<boolean>(false);

    return (
        <main className="login-page">
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
                    <CustomForm
                        formName="loginCustomForm"
                        initialValues={{
                            email: "",
                            password: "",
                        }}
                        validationSchema={LoginSchema}
                        inputFields={[
                            { name: "email", type: "email", label: "Email" },
                            { name: "password", type: "password", label: "Password", helperText: "Password must be 8 characters" }
                        ]}
                        onSubmit={() => { }}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <CheckBox
                            name="Gocha"
                            label={isRegistering ? "Agree to the terms & conditions" : "Stay signed in"}
                        />
                        {!isRegistering && <CustomButton variant="text">Forgot password ?</CustomButton>}
                    </div>
                    <div className="buttons-div">
                        <CustomButton isFitContent={false} type="submit" form="loginCustomForm">
                            {isRegistering ? "Create" : "Sign in"}
                        </CustomButton>
                        <CustomButton
                            variant="text"
                            className="create-account-button"
                            onClick={() => setIsRegistering(prev => !prev)}
                        >
                            {isRegistering ? "Back" : "Create an account"}
                        </CustomButton>
                    </div>
                </div>
            </section>
        </main>
    );
};