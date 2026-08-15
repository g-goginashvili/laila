import "./snack-bar.css";

import Typography from "../typography/typography";
import CustomButton from "../custom-button/custom-button";
import { useEffect, type Ref } from "react";

export type SnackBarVariantType =
    | "success"
    | "warning"
    | "error"
    | "info"
    | "neutral";

type SnackBarPropType = {
    id?: string;
    ref?: Ref<HTMLDivElement>;
    message: string;
    buttonText?: string;
    onButtonClick?: () => void;
    variant?: SnackBarVariantType;
    hasBorder?: boolean;
    duration?: number;
    isExpired?: boolean;
    onExpire?: (id: string) => void;
    onAnimationEnd?: (id: string) => void;
};

const SnackBar = ({
    id,
    ref,
    message,
    buttonText = "Clear",
    onButtonClick,
    variant = "success",
    hasBorder = true,
    duration = 3000,
    isExpired = false,
    onExpire,
    onAnimationEnd,
}: SnackBarPropType) => {

    const preciseClass =
        "snack-bar " +
        `snack-bar-${variant} ` +
        (isExpired ? "snack-bar-expired " : "") +
        (hasBorder ? `snack-bar-border-${variant}` : "");


    const handleAnimationEnd = () => {
        if (isExpired && id) onAnimationEnd?.(id);
    };

    useEffect(() => {
        if (id && duration > 0) {
            const timer = setTimeout(() => { onExpire?.(id) }, duration);
            return () => clearTimeout(timer);
        }
    }, []);

    return (
        <div className={preciseClass} onAnimationEnd={handleAnimationEnd} ref={ref}>
            <div className={`snack-bar-dot snack-bar-dot-${variant}`} />
            <Typography
                variant="body"
                size="medium"
                color="inherit"
            >
                {message}
            </Typography>
            <CustomButton variant="text" onClick={onButtonClick}>{buttonText}</CustomButton>
        </div>
    );
};

export default SnackBar;