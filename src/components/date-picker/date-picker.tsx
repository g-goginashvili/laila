import "./date-picker.css";

import { useCallback, useRef, useState } from "react";
import DatePopover from "./date-popover";
import { popoverRoot } from "../popover/use-anchored-position";
import { formatShortDate, localToday } from "../../utility/service-time";

type DatePickerPropType = {
    id?: string;
    value: string; // YYYY-MM-DD, or "" when empty
    onChange: (value: string) => void;
    placeholder?: string;
    // Shows a Clear button; for optional dates.
    clearable?: boolean;
    today?: string;
    disabled?: boolean;
    invalid?: boolean;
    // Styles the trigger like the surrounding fields, e.g. "adm-input".
    className?: string;
    "aria-label"?: string;
};

// Date field for forms: a button showing the date that opens the calendar popover.
const DatePicker = ({
    id,
    value,
    onChange,
    placeholder = "Pick a date",
    clearable = false,
    today,
    disabled = false,
    invalid = false,
    className,
    "aria-label": ariaLabel,
}: DatePickerPropType) => {
    const triggerRef = useRef<HTMLButtonElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [container, setContainer] = useState<HTMLElement | null>(null);

    const open = () => {
        setContainer(popoverRoot(triggerRef.current));
        setIsOpen(true);
    };

    const close = useCallback((returnFocus: boolean) => {
        setIsOpen(false);
        if (returnFocus) triggerRef.current?.focus();
    }, []);

    return (
        <>
            <button
                ref={triggerRef}
                type="button"
                id={id}
                className={`dp-trigger ${className ?? ""}`}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
                aria-invalid={invalid || undefined}
                aria-label={ariaLabel}
                disabled={disabled}
                onClick={() => (isOpen ? setIsOpen(false) : open())}
                onKeyDown={(event) => {
                    if (event.key === "ArrowDown" && !isOpen) {
                        event.preventDefault();
                        open();
                    }
                }}
            >
                <span className={`dp-trigger-value ${value ? "" : "dp-placeholder"}`}>{value ? formatShortDate(value) : placeholder}</span>
                <span className="dp-calendar-icon" aria-hidden="true" />
            </button>
            <DatePopover
                isOpen={isOpen}
                anchorRef={triggerRef}
                container={container}
                onClose={close}
                value={value}
                onSelect={onChange}
                today={today ?? localToday()}
                onClear={clearable ? () => onChange("") : undefined}
            />
        </>
    );
};

export default DatePicker;
