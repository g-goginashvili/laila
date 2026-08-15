import "./custom-button.css";

import Typography from "../typography/typography";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type CustomButtonVariantType = "filled" | "outlined" | "text";
type CustomButtonSizeType = "small" | "medium" | "large";
type CustomButtonShapeType = "pill" | "square";

type CustomButtonPropType =
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color"> & {
        variant?: CustomButtonVariantType;
        size?: CustomButtonSizeType;
        isFitContent?: boolean;
        shape?: CustomButtonShapeType;
        disabled?: boolean;
        children?: ReactNode;
    };

const CustomButton = ({
    variant = "filled",
    size = "large",
    isFitContent = true,
    shape = "square",
    disabled = false,
    type = "button",
    className,
    children = "Label",
    ...rest
}: CustomButtonPropType) => {

    const styleClasses =
        "custom-button " +
        `custom-button-${variant} ` +
        `custom-button-${size} ` +
        `${isFitContent ? "custom-button-fit-content" : ""} ` +
        `custom-button-${shape} ` +
        `${className ?? ""}`;

    return (
        <button
            {...rest}
            type={type}
            disabled={disabled}
            className={styleClasses}
        >
            <Typography
                variant="label"
                size={size === "small" ? "medium" : "large"}
                color="inherit"
            >
                {children}
            </Typography>
        </button>
    );
};

export default CustomButton;
