import "./text-input.css";

import Typography from "../typography/typography"
import Dropdown, { type DropdownOptionType } from "../dropdown/dropdown";
import type { ChangeEvent, FocusEvent } from "react";

export type TextInputOptionType = DropdownOptionType;

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
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
    // Used by type="select", which renders a Dropdown rather than an input.
    onValueChange?: (value: string) => void;
    onTouched?: () => void;
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
    onValueChange,
    onTouched,
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
                    <Dropdown
                        id={name}
                        name={name}
                        className={`${elementClass} text-input-select`}
                        value={value ?? ""}
                        options={options}
                        // The resting label already says what to pick, like an empty text input.
                        placeholder=""
                        disabled={disabled}
                        invalid={!!errorText}
                        onChange={(next) => onValueChange?.(next)}
                        onBlur={onTouched}
                    /> :
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
