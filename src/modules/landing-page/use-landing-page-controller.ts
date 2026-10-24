import { useNavigate } from "react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { joinWaitlist } from "../../api/waitlist-api";
import { useSnackBar } from "../../components/snack-bar/snack-bar-context";
import { emailRule, errorMessage } from "../../utility/validation";

const useLandingPageController = () => {
    const navigate = useNavigate();
    const { addSnackBar } = useSnackBar();

    const [waitlistEmail, setWaitlistEmail] = useState<string>("");
    const [waitlistError, setWaitlistError] = useState<string | undefined>(undefined);

    const { mutate: joinWaitlistMutation, isPending: isJoiningWaitlist } = useMutation({
        mutationFn: joinWaitlist,
        onSuccess: () => {
            addSnackBar("Thanks! We'll email you on launch day.");
            setWaitlistEmail("");
        },
        onError: (error) => { addSnackBar(errorMessage(error), { variant: "error" }) }
    });

    const handleBusinessRedirect = () => {
        navigate("/admin-auth");
    };

    const handleWaitlistEmailChange = (value: string) => {
        setWaitlistEmail(value);
        setWaitlistError(undefined);
    };

    const handleJoinWaitlist = () => {
        if (!emailRule.isValidSync(waitlistEmail)) {
            setWaitlistError("Enter a valid email address");
            return;
        }
        joinWaitlistMutation(waitlistEmail.trim());
    };

    return {
        waitlistEmail,
        waitlistError,
        isJoiningWaitlist,
        handleBusinessRedirect,
        handleWaitlistEmailChange,
        handleJoinWaitlist,
    };
};

export default useLandingPageController;
