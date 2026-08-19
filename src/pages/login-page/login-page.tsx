import StatusChip from "../../components/status-chip/status-chip";
import CustomButton from "../../components/custom-button/custom-button";
import CheckBox from "../../components/checkbox/checkbox";
import CustomForm from "../../components/custom-form/custom-form";
import SnackBar from "../../components/snack-bar/snack-bar";
import Typography from "../../components/typography/typography";
import "./login-page.css";
import * as Yup from 'yup';
import useAuthorizationPageController from "./use-login-page-controller";
import { useState } from "react";

const SignInSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Required"),
    password: Yup.string().required("Required"),
});

const SignUpSchema = Yup.object().shape({
    name: Yup.string().required("Required"),
    surname: Yup.string().required("Required"),
    email: Yup.string().email("Invalid email").required("Required"),
    phoneNumber: Yup.string().required("Required"),
    orgName: Yup.string().required("Required"),
    address: Yup.string().required("Required"),
    numberOfStores: Yup.string().required("Required"),
    password: Yup.string().required("Required"),
});

export const AuthorizationPage = () => {
    const {
        handleSignUp,
        handleSignIn
    } = useAuthorizationPageController();

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
                    {!isRegistering ?
                        <CustomForm
                            key="signInCustomForm"
                            formName="signInCustomForm"
                            initialValues={{
                                email: "",
                                password: "",
                            }}
                            validationSchema={SignInSchema}
                            inputFields={[
                                { name: "email", type: "email", label: "Email" },
                                { name: "password", type: "password", label: "Password", helperText: "Password must be 8 characters" }
                            ]}
                            onSubmit={handleSignIn}
                        /> :
                        <CustomForm
                            key="signUpCustomForm"
                            formName="signUpCustomForm"
                            initialValues={{
                                name: "",
                                surname: "",
                                email: "",
                                phoneNumber: "",
                                orgName: "",
                                address: "",
                                numberOfStores: "Single",
                                password: "",
                            }}
                            validationSchema={SignUpSchema}
                            inputFields={[
                                { name: "name", type: "text", label: "Name", width: "half" },
                                { name: "surname", type: "text", label: "Surname", width: "half" },
                                { name: "phoneNumber", type: "text", label: "Phone Number", width: "half" },
                                { name: "email", type: "email", label: "Email", width: "half" },
                                { name: "orgName", type: "text", label: "Organisation", width: "half" },
                                { name: "numberOfStores", type: "text", label: "Number of Stores", width: "half" },
                                { name: "address", type: "text", label: "Address" },
                                { name: "password", type: "password", label: "Password", helperText: "Password must be 8 characters" }
                            ]}
                            onSubmit={isRegistering ?
                                (values, formikHelpers) => {
                                    handleSignUp(values, formikHelpers);
                                    setIsRegistering(prev => !prev)
                                } : handleSignIn}
                        />
                    }
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <CheckBox
                            name="Gocha"
                            label={isRegistering ? "Agree to the terms & conditions" : "Stay signed in"}
                        />
                        {!isRegistering && <CustomButton variant="text">Forgot password ?</CustomButton>}
                    </div>
                    <div className="buttons-div">
                        <CustomButton isFitContent={false} type="submit" form={isRegistering ? "signUpCustomForm" : "signInCustomForm"}>
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