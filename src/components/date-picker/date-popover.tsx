import "./date-picker.css";

import { useEffect, useRef, useState, type KeyboardEvent, type RefObject } from "react";
import { createPortal } from "react-dom";
import useAnchoredPosition from "../popover/use-anchored-position";
import {
    addDays, addMonths, formatFullDate, formatMonthYear, startOfMonth, weekdayOf, WEEKDAYS,
} from "../../utility/service-time";

type DatePopoverPropType = {
    isOpen: boolean;
    anchorRef: RefObject<HTMLElement | null>;
    // Where the calendar renders; resolve it with popoverRoot() when opening so theme tokens apply.
    container: HTMLElement | null;
    onClose: (returnFocus: boolean) => void;
    value: string;
    onSelect: (date: string) => void;
    // The store's "today" where it matters (service day); defaults to the browser's date.
    today: string;
    // Days shown as one band, e.g. the visible week in the availability week view.
    highlight?: { from: string, to: string };
    onClear?: () => void;
    label?: string;
};

const DAYS_SHOWN = 42; // six weeks, so the grid height never jumps between months

// Month calendar in a popover, used by DatePicker and the availability date control.
// Mounted only while open, so each opening starts on the selected (or current) month.
const DatePopover = (props: DatePopoverPropType) => (props.isOpen && props.container ? <DatePanel {...props} /> : null);

const DatePanel = ({ anchorRef, container, onClose, value, onSelect, today, highlight, onClear, label = "Choose date" }: DatePopoverPropType) => {
    const panelRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const [active, setActive] = useState(value || today);
    const position = useAnchoredPosition(true, anchorRef, panelRef, { maxHeight: 520 });

    // Focus follows the active day, including when it opens.
    useEffect(() => {
        gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${active}"]`)?.focus({ preventScroll: true });
    }, [active]);

    // Close on a press outside the calendar and its anchor.
    useEffect(() => {
        const onPointerDown = (event: PointerEvent) => {
            const target = event.target as Node;
            if (!panelRef.current?.contains(target) && !anchorRef.current?.contains(target)) onClose(false);
        };
        document.addEventListener("pointerdown", onPointerDown);
        return () => document.removeEventListener("pointerdown", onPointerDown);
    }, [onClose, anchorRef]);

    const month = startOfMonth(active);
    const gridStart = addDays(month, -weekdayOf(month));
    const days = Array.from({ length: DAYS_SHOWN }, (_, index) => addDays(gridStart, index));

    const choose = (date: string) => {
        onSelect(date);
        onClose(true);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        const moves: Record<string, () => string> = {
            ArrowLeft: () => addDays(active, -1),
            ArrowRight: () => addDays(active, 1),
            ArrowUp: () => addDays(active, -7),
            ArrowDown: () => addDays(active, 7),
            Home: () => addDays(active, -weekdayOf(active)),
            End: () => addDays(active, 6 - weekdayOf(active)),
            PageUp: () => addMonths(active, event.shiftKey ? -12 : -1),
            PageDown: () => addMonths(active, event.shiftKey ? 12 : 1),
        };
        if (moves[event.key]) {
            event.preventDefault();
            setActive(moves[event.key]!());
        } else if (event.key === "Escape") {
            // Close only the calendar, not a drawer listening on document.
            event.preventDefault();
            event.nativeEvent.stopPropagation();
            onClose(true);
        }
    };

    return createPortal(
        <div
            ref={panelRef}
            className="dp-panel"
            role="dialog"
            aria-label={label}
            style={position}
            onKeyDown={handleKeyDown}
            onBlur={(event) => {
                // Tabbing out of the calendar closes it.
                const next = event.relatedTarget as Node | null;
                if (next && !panelRef.current?.contains(next) && !anchorRef.current?.contains(next)) onClose(false);
            }}
        >
            <div className="dp-header">
                <button type="button" className="dp-nav" aria-label="Previous month" onClick={() => setActive(addMonths(active, -1))}>‹</button>
                <span className="dp-month" aria-live="polite">{formatMonthYear(month)}</span>
                <button type="button" className="dp-nav" aria-label="Next month" onClick={() => setActive(addMonths(active, 1))}>›</button>
            </div>

            <div ref={gridRef} className="dp-grid" role="grid" aria-label={formatMonthYear(month)}>
                <div className="dp-row" role="row">
                    {WEEKDAYS.map(day => (
                        <span key={day.short} className="dp-weekday" role="columnheader" aria-label={day.name}>{day.short.slice(0, 2)}</span>
                    ))}
                </div>
                {Array.from({ length: DAYS_SHOWN / 7 }, (_, week) => (
                    <div key={week} className="dp-row" role="row">
                        {days.slice(week * 7, week * 7 + 7).map(date => {
                            const inHighlight = highlight && date >= highlight.from && date <= highlight.to;
                            return (
                                <span key={date} role="gridcell" aria-selected={date === value}
                                    className={[
                                        "dp-cell",
                                        inHighlight && "is-in-range",
                                        inHighlight && date === highlight.from && "is-range-start",
                                        inHighlight && date === highlight.to && "is-range-end",
                                    ].filter(Boolean).join(" ")}
                                >
                                    <button
                                        type="button"
                                        data-date={date}
                                        tabIndex={date === active ? 0 : -1}
                                        aria-label={formatFullDate(date)}
                                        aria-current={date === today ? "date" : undefined}
                                        className={[
                                            "dp-day",
                                            date.slice(0, 7) !== month.slice(0, 7) && "is-outside",
                                            date === today && "is-today",
                                            date === value && "is-selected",
                                        ].filter(Boolean).join(" ")}
                                        onClick={() => choose(date)}
                                    >
                                        {Number(date.slice(8, 10))}
                                    </button>
                                </span>
                            );
                        })}
                    </div>
                ))}
            </div>

            {onClear && value &&
                <div className="dp-footer">
                    <button type="button" className="dp-footer-btn" onClick={() => { onClear(); onClose(true); }}>Clear</button>
                </div>}
        </div>,
        container!
    );
};

export default DatePopover;
