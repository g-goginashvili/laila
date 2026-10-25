import { useMutation, useQuery } from "@tanstack/react-query";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import * as Yup from "yup";
import { getAccount } from "../../api/account-api";
import { getOrganisationDetails } from "../../api/organisations-api";
import { queryKeys } from "../../api/query-keys";
import useAuth from "../../hooks/use-auth";
import useFormState from "../../components/admin-ui/use-form-state";
import { useSnackBar } from "../../components/snack-bar/snack-bar-context";
import { errorMessage } from "../../utility/validation";

const PASSWORD_ERRORS: Record<string, string> = {
    "auth/invalid-credential": "Current password is incorrect.",
    "auth/wrong-password": "Current password is incorrect.",
    "auth/weak-password": "Choose a stronger password.",
    "auth/too-many-requests": "Too many attempts. Try again later.",
};

// Same length limits as sign-up.
const PasswordSchema = Yup.object({
    currentPassword: Yup.string().required("Required"),
    newPassword: Yup.string()
        .min(8, "At least 8 characters")
        .max(128, "At most 128 characters")
        .notOneOf([Yup.ref("currentPassword")], "Must differ from the current password")
        .required("Required"),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref("newPassword")], "Passwords don't match")
        .required("Required"),
});

const EMPTY_PASSWORDS = { currentPassword: "", newPassword: "", confirmPassword: "" };

const changePassword = async ({ currentPassword, newPassword }: typeof EMPTY_PASSWORDS) => {
    const user = useAuth.getState().user;
    if (!user?.email) throw new Error("You are not signed in.");
    // Firebase requires a recent sign-in before a password change.
    await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, currentPassword));
    await updatePassword(user, newPassword);
};

const useAccountPageController = () => {
    const user = useAuth((state) => state.user);
    const { addSnackBar } = useSnackBar();

    const queryAccount = useQuery({
        queryKey: queryKeys.account(user?.uid),
        queryFn: getAccount,
        enabled: !!user
    });

    const queryOrganisation = useQuery({
        queryKey: queryKeys.organisation(user?.uid),
        queryFn: getOrganisationDetails,
        enabled: !!user
    });

    const passwordForm = useFormState(EMPTY_PASSWORDS, PasswordSchema);

    const { mutate, isPending: isChangingPassword } = useMutation({
        mutationFn: changePassword,
        onSuccess: () => {
            passwordForm.setValues(EMPTY_PASSWORDS);
            addSnackBar("Password changed.");
        },
        onError: (error) => passwordForm.setFormError(
            error instanceof FirebaseError && PASSWORD_ERRORS[error.code] ? PASSWORD_ERRORS[error.code] : errorMessage(error)
        ),
    });

    const handleChangePassword = () => {
        if (passwordForm.validate()) mutate(passwordForm.values);
    };

    return {
        account: queryAccount.data,
        organisation: queryOrganisation.data,
        isEmailVerified: !!user?.emailVerified,
        isLoading: queryAccount.isLoading || queryOrganisation.isLoading,
        error: queryAccount.error ?? queryOrganisation.error,
        passwordForm,
        isChangingPassword,
        handleChangePassword,
    };
};

export default useAccountPageController;
