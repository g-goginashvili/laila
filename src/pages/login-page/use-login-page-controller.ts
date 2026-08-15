import { signInWithEmailAndPassword } from "firebase/auth";
import { firebaseAuth } from "../../utility/firebase";
import type { FormikHelpers } from "formik";
import { useSnackBar } from "../../components/snack-bar/snack-bar-context";
import { FirebaseError } from "firebase/app";

const useLoginPageController = () => {

    const { addSnackBar } = useSnackBar();

    const handleSignIn = async (
        values: Record<string, string>,
        formikHelpers: FormikHelpers<Record<string, string>>
    ) => {
        try {
            await signInWithEmailAndPassword(firebaseAuth, values.email, values.password)
        } catch (error) {
            const firebaseErrors: Record<string, string> = {
                "auth/user-not-found": "Unable to authorize an user."
            };

            if (error instanceof FirebaseError && Boolean(firebaseErrors[error.code])) {
                addSnackBar(firebaseErrors[error.code], { variant: "error" });
            } else {
                addSnackBar("Behold An Unknown Error", { variant: "error" });

            }

            formikHelpers.resetForm();
        }
    };

    return {
        handleSignIn
    };
};

export default useLoginPageController;