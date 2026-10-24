import "./text-input.css";

import Typography from "../typography/typography"
import type { ChangeEvent, FocusEvent } from "react";

export type TextInputOptionType = {
    value: string;
    label: string;
};

type TextInputPropType = {
    type?: "text" | "password" | "email" | "tel" | "select";
    name: string;
    label?: string;
    placeholder?: string;
    value?: string;
    options?: TextInputOptionType[];
    helperText?: string;
    errorText?: string;
    disabled?: boolean;
    onChange?: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onBlur?: (e: FocusEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const TextInput = ({
    type = "text",
    name,
    label = "Label",
    placeholder,
    value,
    options = [],
    helperText,
    errorText,
    disabled = false,
    onChange,
    onBlur,
}: TextInputPropType) => {

    const elementClass = `text-input-element ${errorText ? "text-input-error-state" : ""}`;

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
                {type === "select" ?
                    <select
                        id={name}
                        name={name}
                        className={`${elementClass} text-input-select`}
                        value={value}
                        disabled={disabled}
                        onChange={onChange}
                        onBlur={onBlur}
                    >
                        {options.map(option =>
                            <option key={option.value} value={option.value}>{option.label}</option>
                        )}
                    </select> :
                    <input
                        type={type}
                        id={name}
                        name={name}
                        className={elementClass}
                        placeholder={placeholder ? placeholder : label}
                        value={value}
                        disabled={disabled}
                        onChange={onChange}
                        onBlur={onBlur}
                    />
                }
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
