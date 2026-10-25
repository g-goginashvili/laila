import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import Drawer from "../../components/admin-ui/drawer";
import Field from "../../components/admin-ui/field";
import { addStoreClosure } from "../../api/stores-api";
import type { StoreType } from "../../api/types";
import { formatShortDate } from "../../utility/service-time";
import { errorMessage } from "../../utility/validation";
import { useSnackBar } from "../../components/snack-bar/snack-bar-context";

type ClosureDrawerPropType = {
    store: StoreType;
    date: string;
    bookingCount: number;
    onClose: () => void;
    onSaved: () => void;
};

const ClosureDrawer = ({ store, date, bookingCount, onClose, onSaved }: ClosureDrawerPropType) => {
    const { addSnackBar } = useSnackBar();
    const [note, setNote] = useState<string>("");
    const [error, setError] = useState<string>("");

    const { mutate, isPending } = useMutation({
        mutationFn: addStoreClosure,
        onSuccess: () => {
            addSnackBar(`${formatShortDate(date)} closed.`);
            onSaved();
            onClose();
        },
        onError: (mutationError) => setError(errorMessage(mutationError)),
    });

    return (
        <Drawer
            title="Close this date"
            subtitle={`${store.storeName} · ${formatShortDate(date)}`}
            onClose={onClose}
            onSubmit={() => mutate({ id: store.id, date, note: note.trim() })}
            footer={<div className="adm-drawer-footer-end">
                <button type="button" className="adm-btn adm-btn--outline" onClick={onClose}>Cancel</button>
                <button type="submit" className="adm-btn adm-btn--primary" disabled={isPending}>Close date</button>
            </div>}
        >
            {error && <p className="adm-form-error" role="alert">{error}</p>}
            <p className="adm-muted avail-drawer-text">Diners can’t book on this date. Opening hours for other days don’t change.</p>
            {bookingCount > 0 &&
                <div className="adm-callout adm-callout--warning" role="status">
                    <strong aria-hidden="true">!</strong>
                    <span>{bookingCount} {bookingCount === 1 ? "reservation is" : "reservations are"} already booked on this date. They stay on the grid — contact the guests or cancel them.</span>
                </div>}
            <Field label="Reason" htmlFor="cl-note" optional="Optional" hint="For staff, e.g. Private event or Public holiday.">
                <input id="cl-note" className="adm-input" maxLength={255} value={note} onChange={(event) => setNote(event.target.value)} />
            </Field>
        </Drawer>
    );
};

export default ClosureDrawer;
