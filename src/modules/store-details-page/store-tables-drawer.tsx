import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import Drawer from "../../components/admin-ui/drawer";
import { replaceStoreTables } from "../../api/stores-api";
import type { StoreType } from "../../api/types";
import { errorMessage } from "../../utility/validation";
import { useSnackBar } from "../../components/snack-bar/snack-bar-context";

type TableRowType = { key: string, id?: string, label: string, seats: string, area: string };

let nextKey = 0;

const nextLabel = (rows: TableRowType[]) => {
    const taken = new Set(rows.map(row => row.label.toUpperCase()));
    let number = rows.length + 1;
    while (taken.has(`T${number}`)) number++;
    return `T${number}`;
};

const StoreTablesDrawer = ({ store, onClose, onSaved }: { store: StoreType, onClose: () => void, onSaved: (store: StoreType) => void }) => {
    const { addSnackBar } = useSnackBar();
    const [rows, setRows] = useState<TableRowType[]>(() => store.tables.map(table => ({
        key: table.id, id: table.id, label: table.label, seats: String(table.seats), area: table.area,
    })));
    const [formError, setFormError] = useState<string>("");

    const { mutate, isPending } = useMutation({
        mutationFn: replaceStoreTables,
        onSuccess: (updated) => {
            addSnackBar("Tables saved.");
            onSaved(updated);
            onClose();
        },
        onError: (error) => setFormError(errorMessage(error)),
    });

    const update = (key: string, patch: Partial<TableRowType>) =>
        setRows(current => current.map(row => row.key === key ? { ...row, ...patch } : row));

    const seats = rows.reduce((total, row) => total + (Number(row.seats) || 0), 0);

    const submit = () => {
        const labels = rows.map(row => row.label.trim().toLowerCase());
        if (labels.some(label => !label)) return setFormError("Every table needs a name.");
        if (new Set(labels).size !== labels.length) return setFormError("Table names must be unique.");
        if (rows.some(row => !Number.isInteger(Number(row.seats)) || Number(row.seats) < 1 || Number(row.seats) > 50)) {
            return setFormError("Seats must be a whole number from 1 to 50.");
        }
        mutate({
            id: store.id,
            tables: rows.map(row => ({ ...(row.id && { id: row.id }), label: row.label.trim(), seats: Number(row.seats), area: row.area.trim() })),
        });
    };

    return (
        <Drawer
            title="Tables"
            subtitle={`${store.storeName} · ${seats} seats across ${rows.length} ${rows.length === 1 ? "table" : "tables"}`}
            onClose={onClose}
            onSubmit={submit}
            footer={<div className="adm-drawer-footer-end">
                <button type="button" className="adm-btn adm-btn--outline" onClick={onClose}>Cancel</button>
                <button type="submit" className="adm-btn adm-btn--primary" disabled={isPending}>{isPending ? "Saving…" : "Save tables"}</button>
            </div>}
        >
            {formError && <p className="adm-form-error" role="alert">{formError}</p>}
            <p className="adm-hint">Areas group tables on the details page and in the reservation picker, e.g. Window, Bar, Terrace.</p>
            {rows.length === 0
                ? <p className="adm-empty">No tables yet. Add each table and how many guests it seats.</p>
                : <div className="tables-editor" role="table" aria-label="Tables">
                    <div className="tables-editor-row tables-editor-head" role="row">
                        <span role="columnheader">Name</span><span role="columnheader">Seats</span><span role="columnheader">Area</span><span role="columnheader" className="adm-visually-hidden">Remove</span>
                    </div>
                    {rows.map(row => (
                        <div key={row.key} className="tables-editor-row" role="row">
                            <input className="adm-input" aria-label="Table name" value={row.label} maxLength={20} onChange={(event) => update(row.key, { label: event.target.value })} />
                            <input className="adm-input adm-tabular" aria-label={`${row.label} seats`} inputMode="numeric" value={row.seats} onChange={(event) => update(row.key, { seats: event.target.value.replace(/\D/g, "") })} />
                            <input className="adm-input" aria-label={`${row.label} area`} value={row.area} maxLength={50} placeholder="Optional" onChange={(event) => update(row.key, { area: event.target.value })} />
                            <button type="button" className="adm-icon-btn adm-icon-btn--danger" aria-label={`Remove ${row.label}`} onClick={() => setRows(current => current.filter(entry => entry.key !== row.key))}>×</button>
                        </div>
                    ))}
                </div>}
            <button
                type="button"
                className="adm-btn adm-btn--dashed"
                onClick={() => setRows(current => [...current, { key: `new-${nextKey++}`, label: nextLabel(current), seats: "2", area: current[current.length - 1]?.area ?? "" }])}
            >
                <span className="adm-btn-glyph" aria-hidden="true">+</span>Add table
            </button>
            {store.tables.length > 0 && <p className="adm-hint">Removing a table keeps its reservations but leaves them without a table.</p>}
        </Drawer>
    );
};

export default StoreTablesDrawer;
