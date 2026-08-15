import "./checkbox.css";

import Typography from "../typography/typography";
import type { ChangeEvent, ReactElement } from "react";

type CheckBoxPropType = {
    name: string;
    label?: string;
    checked?: boolean;
    defaultChecked?: boolean;
    disabled?: boolean;
    helperText?: string;
    errorText?: string;
    reserveHelperSpace?: boolean;
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

const CheckBox = ({
    name,
    label = "Label",
    checked,
    defaultChecked,
    disabled = false,
    helperText,
    errorText,
    reserveHelperSpace = false,
    onChange,
}: CheckBoxPropType): ReactElement => {

    return (
        <div className="check-box-block">
            <div className={
                `check-box ${errorText && "check-box-error-state"}`
            }>
                <input
                    id={name}
                    name={name}
                    type="checkbox"
                    checked={checked}
                    defaultChecked={defaultChecked}
                    disabled={disabled}
                    onChange={onChange}
                    className="check-box-input"
                />
                <Typography
                    htmlFor={name}
                    variant="label"
                    color={errorText ? "error" : "secondary"}
                    className="check-box-label"
                >
                    {label}
                </Typography>
            </div>
            <div className={
                `check-box-helper-text-field ${reserveHelperSpace && "check-box-helper-reserved"}`
            }>
                <Typography
                    variant="body"
                    size="small"
                    color={errorText ? "error" : "secondary"}
                    className="check-box-helper-text"
                >
                    {errorText ? errorText : helperText}
                </Typography>
            </div>
        </div>
    );
};

export default CheckBox;
