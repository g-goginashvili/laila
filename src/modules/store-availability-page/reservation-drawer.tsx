import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Drawer from "../../components/admin-ui/drawer";
import Field from "../../components/admin-ui/field";
import { addReservation, deleteReservation, getReservations, updateReservation } from "../../api/reservations-api";
import { queryKeys } from "../../api/query-keys";
import type { ReservationStatusType, ReservationType, StoreType } from "../../api/types";
import { bookableStarts, isTableFree, shiftsOn, SLOT_MINUTES, tableTimeFor } from "../../utility/availability";
import { formatMinutes, formatShortDate } from "../../utility/service-time";
import { errorMessage } from "../../utility/validation";
import { useSnackBar } from "../../components/snack-bar/snack-bar-context";
import { DATE_PATTERN } from "./availability-dates";
import { RESERVATION_STATUS_LABELS } from "./reservation-styles";

const PHONE_PATTERN = /^\+?[0-9][0-9 ()-]{5,24}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DURATIONS = [60, 90, 120, 150, 180];
const NEW_STATUSES: ReservationStatusType[] = ["confirmed", "unconfirmed", "seated"];
const ALL_STATUSES: ReservationStatusType[] = ["unconfirmed", "confirmed", "seated", "finished", "no_show", "cancelled"];
const FALLBACK_SLOTS = Array.from({ length: 24 }, (_, index) => 12 * 60 + index * SLOT_MINUTES);

type ReservationDrawerPropType = {
    store: StoreType;
    uid: string | undefined;
    date: string;
    reservation: ReservationType | null;
    tableId: string | null;
    startMinutes: number | null;
    fromGrid: boolean;
    onClose: () => void;
    onSaved: () => void;
};

const ReservationDrawer = ({ store, uid, date: initialDate, reservation, tableId: initialTable, startMinutes: initialStart, fromGrid, onClose, onSaved }: ReservationDrawerPropType) => {
    const { addSnackBar } = useSnackBar();
    const initialTime = reservation?.startMinutes ?? initialStart ?? 20 * 60;

    const [guestName, setGuestName] = useState<string>(reservation?.guestName ?? "");
    const [phone, setPhone] = useState<string>(reservation?.phone ?? "");
    const [email, setEmail] = useState<string>(reservation?.email ?? "");
    const [partySize, setPartySize] = useState<number>(reservation?.partySize ?? 2);
    const [date, setDate] = useState<string>(reservation?.date ?? initialDate);
    const [startMinutes, setStartMinutes] = useState<number>(initialTime);
    const [duration, setDuration] = useState<number>(reservation?.durationMinutes ?? tableTimeFor(store, initialTime));
    const [durationTouched, setDurationTouched] = useState<boolean>(!!reservation);
    const [tableId, setTableId] = useState<string>(reservation?.tableId ?? initialTable ?? "");
    const [status, setStatus] = useState<ReservationStatusType>(reservation?.status ?? "confirmed");
    const [notes, setNotes] = useState<string>(reservation?.notes ?? "");
    const [errors, setErrors] = useState<Record<string, string | undefined>>({});
    const [isConfirmingDelete, setIsConfirmingDelete] = useState<boolean>(false);

    const validDate = DATE_PATTERN.test(date);
    const { data: dayReservations = [] } = useQuery({
        queryKey: queryKeys.reservations(uid, store.id, date, date),
        queryFn: () => getReservations({ storeId: store.id, from: date, to: date }),
        enabled: !!uid && validDate,
    });

    const done = (message: string) => {
        addSnackBar(message);
        onSaved();
        onClose();
    };
    const onError = (error: unknown) => setErrors({ form: errorMessage(error) });
    const { mutate: create, isPending: isCreating } = useMutation({ mutationFn: addReservation, onSuccess: () => done("Reservation added."), onError });
    const { mutate: update, isPending: isUpdating } = useMutation({ mutationFn: updateReservation, onSuccess: () => done("Reservation saved."), onError });
    const { mutate: remove, isPending: isDeleting } = useMutation({ mutationFn: deleteReservation, onSuccess: () => done("Reservation deleted."), onError });

    const shifts = validDate ? shiftsOn(store, date) : [];
    const starts = bookableStarts(store, shifts);
    const timeOptions = [...new Set([...(starts.length ? starts : FALLBACK_SLOTS), startMinutes])].sort((a, b) => a - b);
    const durationOptions = [...new Set([...DURATIONS, tableTimeFor(store, startMinutes), duration])].sort((a, b) => a - b);

    const free = (id: string) => isTableFree(id, startMinutes, duration, dayReservations, reservation?.id);
    const table = store.tables.find(entry => entry.id === tableId);
    const end = startMinutes + duration;
    const nextOnTable = table
        ? dayReservations.filter(entry => entry.id !== reservation?.id && entry.tableId === table.id && entry.status !== "cancelled" && entry.startMinutes >= end)
            .sort((a, b) => a.startMinutes - b.startMinutes)[0]
        : undefined;
    const closesAt = shifts.find(shift => startMinutes >= shift.opensMinutes && startMinutes < shift.closesMinutes)?.closesMinutes;
    const freeUntil = nextOnTable?.startMinutes ?? closesAt;
    const alternatives = store.tables.filter(entry => entry.id !== tableId && entry.seats >= partySize && free(entry.id)).map(entry => entry.label);
    const time = formatMinutes(startMinutes);

    const partyHint = table && partySize > table.seats
        ? { text: `Over ${table.label}’s ${table.seats} seats — pick a larger table`, error: true }
        : partySize > store.maxPartySize
            ? { text: `Above the online limit of ${store.maxPartySize} guests`, error: false }
            : { text: table ? `${table.label} seats up to ${table.seats}` : "No table chosen yet", error: false };

    const changeTime = (value: number) => {
        setStartMinutes(value);
        if (!durationTouched) setDuration(tableTimeFor(store, value));
    };

    const submit = () => {
        const next: Record<string, string> = {};
        if (!guestName.trim()) next.guestName = "Required";
        if (!PHONE_PATTERN.test(phone.trim())) next.phone = "Phone number like +30 694 512 3378";
        if (email.trim() && !EMAIL_PATTERN.test(email.trim())) next.email = "Invalid email";
        if (!validDate) next.date = "Pick a date";
        if (partySize < 1 || partySize > 100) next.partySize = "1–100 guests";
        if (table && !free(table.id) && ["unconfirmed", "confirmed", "seated"].includes(status)) next.tableId = `${table.label} is booked then — pick another table`;
        setErrors(next);
        if (Object.keys(next).length) return;

        const values = {
            tableId: tableId || null,
            date,
            startMinutes,
            durationMinutes: duration,
            partySize,
            guestName: guestName.trim(),
            phone: phone.trim(),
            email: email.trim(),
            notes: notes.trim(),
            status,
        };
        if (reservation) update({ storeId: store.id, reservationId: reservation.id, values });
        else create({ storeId: store.id, values });
    };

    const clearError = (key: string) => setErrors(current => (current[key] ? { ...current, [key]: undefined } : current));

    return (
        <Drawer
            title={reservation ? "Reservation" : "New reservation"}
            subtitle={<div className="avail-drawer-context">
                {table && <span className="adm-chip adm-chip--secondary adm-chip--medium">{table.label} · {table.seats} seats</span>}
                {validDate && <span className="adm-chip adm-chip--neutral adm-chip--medium adm-chip--plain adm-tabular">{formatShortDate(date).slice(0, -5)} · {time}</span>}
                {reservation && <span className={`adm-chip adm-chip--medium avail-status-chip avail-status-chip--${reservation.status}`}>{RESERVATION_STATUS_LABELS[reservation.status]}</span>}
                {fromGrid && !reservation && <span className="adm-small">from the grid</span>}
            </div>}
            onClose={onClose}
            onSubmit={submit}
            footer={isConfirmingDelete && reservation
                ? <>
                    <span className="adm-error">Delete this reservation? Use Cancelled to keep a record.</span>
                    <div className="adm-drawer-footer-end">
                        <button type="button" className="adm-btn adm-btn--outline" onClick={() => setIsConfirmingDelete(false)}>Keep</button>
                        <button type="button" className="adm-btn adm-btn--danger" disabled={isDeleting} onClick={() => remove({ storeId: store.id, reservationId: reservation.id })}>Delete</button>
                    </div>
                </>
                : <>
                    {reservation && <button type="button" className="adm-btn adm-btn--danger-text" onClick={() => setIsConfirmingDelete(true)}>Delete</button>}
                    <div className="adm-drawer-footer-end">
                        <button type="button" className="adm-btn adm-btn--outline" onClick={onClose}>Cancel</button>
                        <button type="submit" className="adm-btn adm-btn--primary" disabled={isCreating || isUpdating}>{reservation ? "Save changes" : "Add reservation"}</button>
                    </div>
                </>}
        >
            {errors.form && <p className="adm-form-error" role="alert">{errors.form}</p>}

            <section className="adm-form-section" aria-labelledby="rv-guest">
                <h3 id="rv-guest" className="adm-form-section-title">Guest</h3>
                <Field label="Guest name" htmlFor="rv-name" required error={errors.guestName}>
                    <input id="rv-name" className={`adm-input ${errors.guestName ? "adm-input--invalid" : ""}`} autoComplete="name" maxLength={150}
                        value={guestName} onChange={(event) => { setGuestName(event.target.value); clearError("guestName"); }} />
                </Field>
                <div className="adm-form-grid">
                    <Field label="Phone" htmlFor="rv-phone" required error={errors.phone}>
                        <input id="rv-phone" type="tel" className={`adm-input adm-tabular ${errors.phone ? "adm-input--invalid" : ""}`} autoComplete="tel"
                            value={phone} onChange={(event) => { setPhone(event.target.value); clearError("phone"); }} />
                    </Field>
                    <Field label="Email" htmlFor="rv-email" optional="Optional" error={errors.email}>
                        <input id="rv-email" type="email" className={`adm-input ${errors.email ? "adm-input--invalid" : ""}`} autoComplete="email"
                            value={email} onChange={(event) => { setEmail(event.target.value); clearError("email"); }} />
                    </Field>
                </div>
            </section>

            <section className="adm-form-section" aria-labelledby="rv-booking">
                <h3 id="rv-booking" className="adm-form-section-title">Booking</h3>
                <div className="adm-form-grid adm-form-grid--narrow">
                    <div className="adm-field">
                        <span id="rv-party-label" className="adm-label"><span>Party size<span className="adm-required" aria-hidden="true"> *</span></span></span>
                        <div className="avail-stepper" role="group" aria-labelledby="rv-party-label">
                            <button type="button" aria-label="Fewer guests" onClick={() => setPartySize(size => Math.max(1, size - 1))}>−</button>
                            <input inputMode="numeric" aria-label="Party size" className="adm-tabular" value={partySize}
                                onChange={(event) => setPartySize(Math.min(100, Number(event.target.value.replace(/\D/g, "")) || 0))} />
                            <button type="button" aria-label="More guests" onClick={() => setPartySize(size => Math.min(100, size + 1))}>+</button>
                        </div>
                        <span className={errors.partySize || partyHint.error ? "adm-error" : "adm-hint"}>{errors.partySize ?? partyHint.text}</span>
                    </div>
                    <Field label="Date" htmlFor="rv-date" required error={errors.date}>
                        <input id="rv-date" type="date" className="adm-input adm-tabular" value={date} onChange={(event) => { setDate(event.target.value); clearError("date"); }} />
                    </Field>
                </div>
                <div className="adm-form-grid adm-form-grid--narrow">
                    <Field label="Time" htmlFor="rv-time" required hint={starts.length ? undefined : "Closed on this date — booking anyway"}>
                        <select id="rv-time" className="adm-input adm-tabular" value={startMinutes} onChange={(event) => changeTime(Number(event.target.value))}>
                            {timeOptions.map(option => <option key={option} value={option}>{formatMinutes(option)}</option>)}
                        </select>
                    </Field>
                    <Field label="Duration" htmlFor="rv-duration"
                        hint={`Ends ${formatMinutes(end)}${table && freeUntil ? ` · table free until ${formatMinutes(freeUntil)}` : ""}`}>
                        <select id="rv-duration" className="adm-input" value={duration} onChange={(event) => { setDuration(Number(event.target.value)); setDurationTouched(true); }}>
                            {durationOptions.map(option => <option key={option} value={option}>{option} min</option>)}
                        </select>
                    </Field>
                </div>
                <Field label="Table" htmlFor="rv-table" error={errors.tableId}
                    hint={alternatives.length ? `Also free at ${time} for ${partySize}: ${alternatives.slice(0, 4).join(", ")}` : `No other free tables for ${partySize} at ${time}`}>
                    <select id="rv-table" className="adm-input" value={tableId} onChange={(event) => { setTableId(event.target.value); clearError("tableId"); }}>
                        <option value="">No table yet</option>
                        {store.tables.map(entry => {
                            const isFree = free(entry.id);
                            return (
                                <option key={entry.id} value={entry.id} disabled={!isFree && entry.id !== tableId}>
                                    {entry.label} · {entry.seats} seats{entry.area ? ` · ${entry.area}` : ""}{isFree ? "" : " · booked"}
                                </option>
                            );
                        })}
                    </select>
                </Field>
                <Field label="Status" htmlFor="rv-status">
                    <select id="rv-status" className="adm-input" value={status} onChange={(event) => setStatus(event.target.value as ReservationStatusType)}>
                        {(reservation ? ALL_STATUSES : NEW_STATUSES).map(option => <option key={option} value={option}>{RESERVATION_STATUS_LABELS[option]}</option>)}
                    </select>
                </Field>
            </section>

            <Field label="Notes" htmlFor="rv-notes" optional="Visible to floor staff">
                <textarea id="rv-notes" className="adm-input" rows={3} maxLength={1000} value={notes} onChange={(event) => setNotes(event.target.value)} />
            </Field>
        </Drawer>
    );
};

export default ReservationDrawer;
