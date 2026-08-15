import "./text-input.css";

import Typography from "../typography/typography"
import type { ChangeEvent, FocusEvent } from "react";

type TextInputPropType = {
    type?: "text" | "password" | "email";
    name: string;
    label?: string;
    placeholder?: string;
    value?: string;
    helperText?: string;
    errorText?: string;
    onChange?: (e: ChangeEvent) => void;
    onBlur?: (e: FocusEvent) => void;
}

const TextInput = ({
    type = "text",
    name,
    label = "Label",
    placeholder,
    value,
    helperText,
    errorText,
    onChange,
    onBlur,
}: TextInputPropType) => {

    const errorStateClass = errorText && "text-input-error-state";

    return (
        <div className="text-input-block">
            <div className="text-input-field">
                <Typography
                    htmlFor={name}
                    variant="label"
                    color={errorText ? "error" : "secondary"}
                    className="text-input-label"
                >
                    {label}
                </Typography>
                <input
                    type={type}
                    id={name}
                    name={name}
                    className={`text-input-element ${errorStateClass}`}
                    placeholder={placeholder ? placeholder : label}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                />
            </div>
            <div className="text-input-helper-text-field">
                <Typography
                    variant="body"
                    size="small"
                    color={errorText ? "error" : "secondary"}
                    className="text-input-helper-text"
                >
                    {errorText ? errorText : helperText}
                </Typography>
            </div>
        </div>
    );
};

export default TextInput;