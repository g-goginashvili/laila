import "./dropdown.css";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import useAnchoredPosition, { popoverRoot } from "../popover/use-anchored-position";

export type DropdownOptionType = {
    value: string;
    label: string;
    disabled?: boolean;
};

type DropdownPropType = {
    id?: string;
    name?: string;
    value: string;
    options: DropdownOptionType[];
    onChange: (value: string) => void;
    onBlur?: () => void;
    placeholder?: string;
    disabled?: boolean;
    invalid?: boolean;
    // Styles the trigger like the surrounding fields, e.g. "adm-input" or "text-input-element".
    className?: string;
    "aria-label"?: string;
};

const LIST_MAX_HEIGHT = 280;
const TYPEAHEAD_RESET_MS = 600;

// Single-select dropdown used for every select in the app: a combobox button plus a listbox.
// Focus stays on the button (aria-activedescendant), so it works with labels, forms and drawers.
const Dropdown = ({
    id,
    name,
    value,
    options,
    onChange,
    onBlur,
    placeholder = "Select…",
    disabled = false,
    invalid = false,
    className,
    "aria-label": ariaLabel,
}: DropdownPropType) => {
    const generatedId = useId();
    const triggerId = id ?? `dropdown-${generatedId}`;
    const listId = `${triggerId}-list`;

    const triggerRef = useRef<HTMLButtonElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const typeahead = useRef({ text: "", timer: 0 });

    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
    const position = useAnchoredPosition(isOpen, triggerRef, listRef, { matchWidth: true, maxHeight: LIST_MAX_HEIGHT });

    const selectedIndex = options.findIndex(option => option.value === value);
    const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

    const enabledIndex = (from: number, step: 1 | -1) => {
        for (let index = from; index >= 0 && index < options.length; index += step) {
            if (!options[index]!.disabled) return index;
        }
        return -1;
    };

    const open = (preferLast = false) => {
        if (disabled || options.length === 0) return;
        setPortalTarget(popoverRoot(triggerRef.current));
        setActiveIndex(selectedIndex >= 0 && !options[selectedIndex]!.disabled
            ? selectedIndex
            : preferLast ? enabledIndex(options.length - 1, -1) : enabledIndex(0, 1));
        setIsOpen(true);
    };

    const close = () => setIsOpen(false);

    const choose = (index: number) => {
        const option = options[index];
        if (!option || option.disabled) return;
        if (option.value !== value) onChange(option.value);
        close();
    };

    const move = (step: 1 | -1) => {
        const next = enabledIndex(activeIndex + step, step);
        if (next >= 0) setActiveIndex(next);
    };

    // Typing jumps to the next option starting with the typed text, like a native select.
    const handleTypeahead = (key: string) => {
        window.clearTimeout(typeahead.current.timer);
        typeahead.current.text += key.toLowerCase();
        typeahead.current.timer = window.setTimeout(() => { typeahead.current.text = ""; }, TYPEAHEAD_RESET_MS);

        const start = (isOpen ? activeIndex : selectedIndex) + (typeahead.current.text.length === 1 ? 1 : 0);
        const ordered = [...options.keys()].map(offset => (Math.max(start, 0) + offset) % options.length);
        const match = ordered.find(index => !options[index]!.disabled && options[index]!.label.toLowerCase().startsWith(typeahead.current.text));
        if (match === undefined) return;
        if (isOpen) setActiveIndex(match);
        else if (options[match]!.value !== value) onChange(options[match]!.value);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
        if (!isOpen) {
            if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
                event.preventDefault();
                open(event.key === "ArrowUp");
            } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
                handleTypeahead(event.key);
            }
            return;
        }

        switch (event.key) {
            case "ArrowDown": event.preventDefault(); move(1); break;
            case "ArrowUp": event.preventDefault(); move(-1); break;
            case "Home": event.preventDefault(); setActiveIndex(enabledIndex(0, 1)); break;
            case "End": event.preventDefault(); setActiveIndex(enabledIndex(options.length - 1, -1)); break;
            case "Enter":
            case " ":
                event.preventDefault();
                choose(activeIndex);
                break;
            case "Escape":
                // Close only the list, not the drawer or modal listening on document.
                event.preventDefault();
                event.nativeEvent.stopPropagation();
                close();
                break;
            case "Tab":
                close();
                break;
            default:
                if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) handleTypeahead(event.key);
        }
    };

    useEffect(() => {
        if (!isOpen || activeIndex < 0) return;
        listRef.current?.children[activeIndex]?.scrollIntoView({ block: "nearest" });
    }, [isOpen, activeIndex]);

    useEffect(() => () => window.clearTimeout(typeahead.current.timer), []);

    return (
        <>
            <button
                ref={triggerRef}
                type="button"
                id={triggerId}
                className={`dropdown-trigger ${className ?? ""}`}
                role="combobox"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-controls={isOpen ? listId : undefined}
                aria-activedescendant={isOpen && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
                aria-invalid={invalid || undefined}
                aria-label={ariaLabel}
                // Lets floating-label fields lift the label only once an option is chosen.
                data-has-value={selected ? "true" : "false"}
                disabled={disabled}
                onClick={() => (isOpen ? close() : open())}
                onKeyDown={handleKeyDown}
                onBlur={() => { close(); onBlur?.(); }}
            >
                {/* A non-breaking space keeps the field's height when there is no placeholder. */}
                <span className={`dropdown-value ${selected ? "" : "dropdown-placeholder"}`}>{selected?.label ?? (placeholder || " ")}</span>
                <span className="dropdown-caret" aria-hidden="true" />
            </button>
            {name && <input type="hidden" name={name} value={value} />}

            {isOpen && portalTarget && createPortal(
                <ul
                    ref={listRef}
                    id={listId}
                    role="listbox"
                    aria-labelledby={triggerId}
                    className="dropdown-list"
                    style={position}
                    // Keep focus on the trigger while clicking or scrolling the list.
                    onMouseDown={(event) => event.preventDefault()}
                >
                    {options.map((option, index) => (
                        <li
                            key={option.value}
                            id={`${listId}-${index}`}
                            role="option"
                            aria-selected={index === selectedIndex}
                            aria-disabled={option.disabled || undefined}
                            className={[
                                "dropdown-option",
                                index === activeIndex && "is-active",
                                index === selectedIndex && "is-selected",
                                option.disabled && "is-disabled",
                            ].filter(Boolean).join(" ")}
                            onMouseEnter={() => !option.disabled && setActiveIndex(index)}
                            onClick={() => choose(index)}
                        >
                            <span className="dropdown-option-label">{option.label}</span>
                            {index === selectedIndex && <span className="dropdown-check" aria-hidden="true" />}
                        </li>
                    ))}
                </ul>,
                portalTarget
            )}
        </>
    );
};

export default Dropdown;
