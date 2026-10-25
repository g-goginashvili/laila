import type { ReservationType, StoreShiftType, StoreTableType } from "../../api/types";
import { formatMinutes } from "../../utility/service-time";
import { SLOT_MINUTES } from "../../utility/availability";
import { RESERVATION_STATUS_LABELS } from "./reservation-styles";

const HEADER_WIDTH = 172;
const SLOT_WIDTH = 72;

type AvailabilityGridPropType = {
    tables: StoreTableType[];
    reservations: ReservationType[];
    shifts: StoreShiftType[];
    lastSeatingMinutes: number;
    range: { start: number, end: number };
    nowMinutes: number | null;
    dateLabel: string;
    onSlot: (tableId: string | null, startMinutes: number) => void;
    onReservation: (reservation: ReservationType) => void;
};

const AvailabilityGrid = ({
    tables,
    reservations,
    shifts,
    lastSeatingMinutes,
    range,
    nowMinutes,
    dateLabel,
    onSlot,
    onReservation,
}: AvailabilityGridPropType) => {
    const slots: number[] = [];
    for (let minutes = range.start; minutes < range.end; minutes += SLOT_MINUTES) slots.push(minutes);

    const columns = `${HEADER_WIDTH}px repeat(${slots.length}, ${SLOT_WIDTH}px)`;
    const isBookable = (slot: number) => shifts.some(shift => slot >= shift.opensMinutes && slot <= shift.closesMinutes - lastSeatingMinutes);
    const isOpen = (slot: number) => shifts.some(shift => slot >= shift.opensMinutes && slot < shift.closesMinutes);
    const offset = (minutes: number) => ((minutes - range.start) / SLOT_MINUTES) * SLOT_WIDTH;

    const unassigned = reservations.filter(reservation => !reservation.tableId || !tables.some(table => table.id === reservation.tableId));
    const rows = [
        ...tables.map(table => ({ id: table.id, label: table.label, seats: table.seats, area: table.area })),
        ...(unassigned.length ? [{ id: null, label: "No table", seats: null, area: "Assign a table to seat these" }] : []),
    ];

    const showNow = nowMinutes !== null && nowMinutes >= range.start && nowMinutes <= range.end;

    return (
        <div className="avail-grid-scroll" role="grid" aria-label={`Availability for ${dateLabel}`}>
            <div className="avail-grid">
                <div role="row" className="avail-grid-head" style={{ gridTemplateColumns: columns }}>
                    <div role="columnheader" className="avail-grid-corner">Table</div>
                    {slots.map(slot => (
                        <div key={slot} role="columnheader" className={`avail-grid-slot-label ${slot % 60 ? "is-half" : ""}`}>{formatMinutes(slot)}</div>
                    ))}
                </div>

                {rows.map(row => {
                    const rowReservations = row.id
                        ? reservations.filter(reservation => reservation.tableId === row.id)
                        : unassigned;
                    const busy = (slot: number) => rowReservations.some(reservation =>
                        reservation.startMinutes < slot + SLOT_MINUTES && reservation.startMinutes + reservation.durationMinutes > slot);

                    return (
                        <div key={row.id ?? "unassigned"} role="row" className="avail-grid-row" style={{ gridTemplateColumns: columns }}>
                            <div role="rowheader" className="avail-grid-table">
                                <span className="avail-grid-table-name">
                                    <span className="avail-grid-table-label">{row.label}</span>
                                    {row.seats !== null && <span className="adm-muted">{row.seats} seats</span>}
                                </span>
                                {row.area && <span className="adm-small adm-muted">{row.area}</span>}
                            </div>
                            {slots.map(slot => {
                                const half = slot % 60 ? "is-half" : "";
                                if (!isOpen(slot)) return <div key={slot} role="gridcell" aria-label="Kitchen closed" className={`avail-cell is-closed ${half}`} />;
                                if (busy(slot) || !row.id || !isBookable(slot)) return <div key={slot} role="gridcell" className={`avail-cell ${half}`} />;
                                return (
                                    <button
                                        key={slot}
                                        type="button"
                                        role="gridcell"
                                        className={`avail-cell avail-cell--open ${half}`}
                                        aria-label={`Add reservation, ${row.label}, ${formatMinutes(slot)}`}
                                        onClick={() => onSlot(row.id, slot)}
                                    >
                                        <span aria-hidden="true">+</span>
                                    </button>
                                );
                            })}
                            {rowReservations.map(reservation => {
                                const end = reservation.startMinutes + reservation.durationMinutes;
                                const label = RESERVATION_STATUS_LABELS[reservation.status];
                                const time = `${formatMinutes(reservation.startMinutes)}–${formatMinutes(end)}`;
                                return (
                                    <button
                                        key={reservation.id}
                                        type="button"
                                        className={`avail-block avail-block--${reservation.status}`}
                                        style={{ left: HEADER_WIDTH + offset(reservation.startMinutes) + 2, width: Math.max(offset(end) - offset(reservation.startMinutes) - 5, 24) }}
                                        aria-label={`${reservation.guestName}, party of ${reservation.partySize}, ${time}, ${label}`}
                                        onClick={() => onReservation(reservation)}
                                    >
                                        <span className="avail-block-title">
                                            <span className="avail-block-name">{reservation.guestName}</span>
                                            <span className="adm-tabular">· {reservation.partySize}</span>
                                        </span>
                                        <span className="avail-block-meta">{time} · {reservation.notes.split("\n")[0]?.slice(0, 40) || label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    );
                })}

                {showNow &&
                    <div className="avail-now" style={{ left: HEADER_WIDTH + offset(nowMinutes!) }} aria-hidden="true">
                        <span />
                    </div>}
            </div>
        </div>
    );
};

export default AvailabilityGrid;
