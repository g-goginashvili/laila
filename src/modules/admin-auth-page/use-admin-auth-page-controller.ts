import { browserLocalPersistence, browserSessionPersistence, sendPasswordResetEmail, setPersistence, signInWithEmailAndPassword } from "firebase/auth";
import { firebaseAuth } from "../../utility/firebase";
import type { FormikHelpers } from "formik";
import { useSnackBar } from "../../components/snack-bar/snack-bar-context";
import { FirebaseError } from "firebase/app";
import { useNavigate } from "react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { adminSignUp } from "../../api/auth-api";
import { errorMessage } from "../../utility/validation";

const FirebaseErrorsMap: Record<string, string> = {
    "auth/user-not-found": "Unable to authorize an user.",
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/wrong-password": "Incorrect email or password.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/too-many-requests": "Too many attempts. Try again later.",
    "auth/email-already-in-use": "Email address is already in use."
};

const UNKNOWN_ERROR = "Behold An Unknown Error";

const firebaseErrorMessage = (error: unknown) =>
    error instanceof FirebaseError && FirebaseErrorsMap[error.code] ? FirebaseErrorsMap[error.code] : UNKNOWN_ERROR;

const useAdminAuthPageController = () => {
    const navigate = useNavigate();
    const { addSnackBar } = useSnackBar();

    const [isForgotPassword, setIsForgotPassword] = useState<boolean>(false);
    const [isRegistering, setIsRegistering] = useState<boolean>(false);
    const [staySignedIn, setStaySignedIn] = useState<boolean>(true);
    const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);

    const { mutate: adminSignUpMutation, isPending: isSigningUp } = useMutation({
        mutationFn: adminSignUp,
        onSuccess: () => { addSnackBar("Account created. You can sign in now.") },
        onError: (error) => { addSnackBar(errorMessage(error, UNKNOWN_ERROR), { variant: "error" }) }
    });

    const toggleRegistering = () => {
        setIsRegistering(prev => !prev);
        setAcceptedTerms(false);
    };

    const handleSignUp = (
        values: Record<string, string>,
        formikHelpers: FormikHelpers<Record<string, string>>
    ) => {
        if (!acceptedTerms) {
            addSnackBar("Please agree to the terms & conditions.", { variant: "warning" });
            return;
        }
        adminSignUpMutation(values, {
            onSuccess: () => {
                toggleRegistering();
                formikHelpers.resetForm();
            }
        });
    };

    const handleSignIn = async (
        values: Record<string, string>,
        formikHelpers: FormikHelpers<Record<string, string>>
    ) => {
        try {
            await setPersistence(firebaseAuth, staySignedIn ? browserLocalPersistence : browserSessionPersistence);
            await signInWithEmailAndPassword(firebaseAuth, values.email, values.password);
            addSnackBar("Signed in.");
            navigate("/dashboard", { replace: true });

        } catch (error) {
            addSnackBar(firebaseErrorMessage(error), { variant: "error" });
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
            return true;
        } catch (error) {
            addSnackBar(firebaseErrorMessage(error), { variant: "error" });
            return false;
        }
    };

    return {
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
        handlePasswordReset,
    };
};

export default useAdminAuthPageController;
