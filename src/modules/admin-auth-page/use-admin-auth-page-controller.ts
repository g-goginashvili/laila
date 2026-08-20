import { sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { firebaseAuth } from "../../utility/firebase";
import type { FormikHelpers } from "formik";
import { useSnackBar } from "../../components/snack-bar/snack-bar-context";
import { FirebaseError } from "firebase/app";
import { useNavigate } from "react-router";
import { useState } from "react";

const FirebaseErrorsMap: Record<string, string> = {
    "auth/user-not-found": "Unable to authorize an user.",
    "auth/email-already-in-use": "Email address is already in use."
};

const useAdminAuthPageController = () => {
    const navigate = useNavigate();
    const { addSnackBar } = useSnackBar();

    const [isForgotPassword, setIsForgotPassword] = useState<boolean>(false);
    const [isRegistering, setIsRegistering] = useState<boolean>(false);

    const handleSignUp = async (
        values: Record<string, string>,
        formikHelpers: FormikHelpers<Record<string, string>>
    ) => {
        try {
            addSnackBar("sign up success");

            await fetch("https://core.gviano.com/api/auth/admin-sign-up",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: values.name,
                        surname: values.surname,
                        email: values.email,
                        phoneNumber: values.phoneNumber,
                        orgName: values.orgName,
                        address: values.address,
                        password: values.password,
                    })
                }
            );

            formikHelpers.resetForm();
            addSnackBar("Success");

        } catch (error) {
            if (error instanceof FirebaseError && Boolean(FirebaseErrorsMap[error.code])) {
                addSnackBar(FirebaseErrorsMap[error.code], { variant: "error" });
            } else {
                addSnackBar("Behold An Unknown Error", { variant: "error" });
            }
        }
    };

    const handleSignIn = async (
        values: Record<string, string>,
        formikHelpers: FormikHelpers<Record<string, string>>
    ) => {
        try {
            await signInWithEmailAndPassword(firebaseAuth, values.email, values.password);
            addSnackBar("Signed in.");
            navigate("/admin-panel", { replace: true });

        } catch (error) {
            if (error instanceof FirebaseError && Boolean(FirebaseErrorsMap[error.code])) {
                addSnackBar(FirebaseErrorsMap[error.code], { variant: "error" });
            } else {
                addSnackBar("Behold An Unknown Error", { variant: "error" });

            }
            formikHelpers.resetForm();

        }
    };

    const handlePasswordResetModal = () => {
        setIsForgotPassword(prev => !prev);
    };

    const handlePasswordReset = async (email: string) => {
        try {
            await sendPasswordResetEmail(firebaseAuth, email);
            addSnackBar("Password reset sent.");
            navigate("/admin-panel", { replace: true });

        } catch (error) {
            if (error instanceof FirebaseError && Boolean(FirebaseErrorsMap[error.code])) {
                addSnackBar(FirebaseErrorsMap[error.code], { variant: "error" });
            } else {
                addSnackBar("Behold An Unknown Error", { variant: "error" });
            }
        }
    };

    return {
        isForgotPassword,
        isRegistering,
        setIsRegistering,
        handleSignUp,
        handleSignIn,
        handlePasswordResetModal,
        handlePasswordReset,
    };
};

export default useAdminAuthPageController;