import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import Drawer from "../../components/admin-ui/drawer";
import { replaceStoreHours } from "../../api/stores-api";
import type { StoreType } from "../../api/types";
import { formatMinutes, MINUTES_PER_DAY, SERVICE_DAY_CUTOFF_MINUTES, WEEKDAYS } from "../../utility/service-time";
import { errorMessage } from "../../utility/validation";
import { useSnackBar } from "../../components/snack-bar/snack-bar-context";

type ShiftRowType = { key: number, opens: string, closes: string };

const MAX_SHIFTS_PER_DAY = 3;
let nextKey = 0;

const toMinutes = (value: string) => {
    const [hours, minutes] = value.split(":").map(Number);
    return (hours ?? 0) * 60 + (minutes ?? 0);
};

// Closing at or before opening (e.g. 12:00–01:00) means the next morning.
const toShift = (row: ShiftRowType) => {
    const opensMinutes = toMinutes(row.opens);
    let closesMinutes = toMinutes(row.closes);
    if (closesMinutes <= opensMinutes) closesMinutes += MINUTES_PER_DAY;
    return { opensMinutes, closesMinutes };
};

const StoreHoursDrawer = ({ store, onClose, onSaved }: { store: StoreType, onClose: () => void, onSaved: (store: StoreType) => void }) => {
    const { addSnackBar } = useSnackBar();
    const [days, setDays] = useState<ShiftRowType[][]>(() => WEEKDAYS.map((_, weekday) =>
        store.hours.filter(shift => shift.weekday === weekday).map(shift => ({
            key: nextKey++, opens: formatMinutes(shift.opensMinutes), closes: formatMinutes(shift.closesMinutes),
        }))
    ));
    const [formError, setFormError] = useState<string>("");

    const { mutate, isPending } = useMutation({
        mutationFn: replaceStoreHours,
        onSuccess: (updated) => {
            addSnackBar("Opening hours saved.");
            onSaved(updated);
            onClose();
        },
        onError: (error) => setFormError(errorMessage(error)),
    });

    const updateDay = (weekday: number, rows: ShiftRowType[]) =>
        setDays(current => current.map((day, index) => index === weekday ? rows : day));

    const copyToAll = (weekday: number) =>
        setDays(current => current.map(() => current[weekday]!.map(row => ({ ...row, key: nextKey++ }))));

    const submit = () => {
        const hours = days.flatMap((rows, weekday) => rows.map(row => ({ weekday, ...toShift(row) })));
        const invalid = hours.find(shift => shift.closesMinutes > MINUTES_PER_DAY + SERVICE_DAY_CUTOFF_MINUTES);
        if (invalid) {
            setFormError(`${WEEKDAYS[invalid.weekday]!.name}: closing after 06:00 the next morning isn't supported.`);
            return;
        }
        mutate({ id: store.id, hours });
    };

    return (
        <Drawer
            title="Opening hours"
            subtitle={`${store.storeName} · ${store.timezone}`}
            onClose={onClose}
            onSubmit={submit}
            footer={<div className="adm-drawer-footer-end">
                <button type="button" className="adm-btn adm-btn--outline" onClick={onClose}>Cancel</button>
                <button type="submit" className="adm-btn adm-btn--primary" disabled={isPending}>{isPending ? "Saving…" : "Save hours"}</button>
            </div>}
        >
            {formError && <p className="adm-form-error" role="alert">{formError}</p>}
            <p className="adm-hint">Closing times up to 06:00 count as the following morning. Leave a day empty to close it.</p>
            <ol className="hours-editor">
                {days.map((rows, weekday) => (
                    <li key={WEEKDAYS[weekday]!.short} className="hours-editor-day">
                        <div className="hours-editor-day-head">
                            <span className="hours-editor-day-name">{WEEKDAYS[weekday]!.name}</span>
                            {rows.length === 0 && <span className="adm-muted">Closed</span>}
                            {rows.length > 0 &&
                                <button type="button" className="adm-btn adm-btn--text hours-editor-copy" onClick={() => copyToAll(weekday)}>Copy to all days</button>}
                        </div>
                        {rows.map((row, index) => (
                            <div key={row.key} className="hours-editor-shift">
                                <input
                                    type="time"
                                    className="adm-input"
                                    aria-label={`${WEEKDAYS[weekday]!.name} shift ${index + 1} opens`}
                                    value={row.opens}
                                    onChange={(event) => updateDay(weekday, rows.map(entry => entry.key === row.key ? { ...entry, opens: event.target.value } : entry))}
                                    required
                                />
                                <span aria-hidden="true" className="adm-muted">–</span>
                                <input
                                    type="time"
                                    className="adm-input"
                                    aria-label={`${WEEKDAYS[weekday]!.name} shift ${index + 1} closes`}
                                    value={row.closes}
                                    onChange={(event) => updateDay(weekday, rows.map(entry => entry.key === row.key ? { ...entry, closes: event.target.value } : entry))}
                                    required
                                />
                                <button
                                    type="button"
                                    className="adm-icon-btn adm-icon-btn--danger"
                                    aria-label={`Remove ${WEEKDAYS[weekday]!.name} shift ${index + 1}`}
                                    onClick={() => updateDay(weekday, rows.filter(entry => entry.key !== row.key))}
                                >×</button>
                            </div>
                        ))}
                        {rows.length < MAX_SHIFTS_PER_DAY &&
                            <button
                                type="button"
                                className="adm-btn adm-btn--text hours-editor-add"
                                onClick={() => updateDay(weekday, [...rows, { key: nextKey++, opens: rows.length ? "19:00" : "12:00", closes: rows.length ? "23:00" : "16:00" }])}
                            >
                                <span className="adm-btn-glyph" aria-hidden="true">+</span>{rows.length ? "Add shift" : "Open this day"}
                            </button>}
                    </li>
                ))}
            </ol>
        </Drawer>
    );
};

export default StoreHoursDrawer;
