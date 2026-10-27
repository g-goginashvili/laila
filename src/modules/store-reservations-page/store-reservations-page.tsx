import "../../components/admin-ui/admin-ui.css";
// Shared reservation status chip colours.
import "../store-availability-page/store-availability-page.css";
import "./store-reservations-page.css";

import { useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";
import StoreTabs from "../../components/admin-ui/store-tabs";
import ReservationDrawer from "../store-availability-page/reservation-drawer";
import { RESERVATION_STATUS_LABELS } from "../store-availability-page/reservation-styles";
import useStoreReservationsPageController, { type ReservationsScopeType } from "./use-store-reservations-page-controller";
import { queryKeys } from "../../api/query-keys";
import { errorMessage } from "../../utility/validation";
import { formatMinutes, formatShortDate } from "../../utility/service-time";
import HeartbeatLoader from "../../components/heartbeat-loader/heartbeat-loader";

const SCOPES: { value: ReservationsScopeType, label: string }[] = [
    { value: "upcoming", label: "Upcoming" },
    { value: "past", label: "Past" },
];

const StoreReservationsPage = () => {
    const {
        storeId, store, uid, today, from, to, scope, setScope, isLoading, error,
        reservations, tableLabel, drawer, setDrawer,
    } = useStoreReservationsPageController();
    const queryClient = useQueryClient();

    const refreshReservations = () => {
        queryClient.invalidateQueries({ queryKey: ["reservations", uid, storeId] });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(uid) });
    };

    const drawerReservation = drawer?.reservationId
        ? reservations.find(reservation => reservation.id === drawer.reservationId) ?? null
        : null;

    return (
        <main className="adm-page">
            <Link to={`/stores/${storeId}/details`} className="adm-back-link"><span className="adm-back-link-arrow" aria-hidden="true">‹</span>Store details</Link>

            <header className="adm-page-header adm-page-header--top">
                <div className="adm-title-block">
                    <h1 className="adm-h1">{store?.storeName ?? "Reservations"}</h1>
                </div>
                {store &&
                    <button type="button" className="adm-btn adm-btn--primary" onClick={() => setDrawer({ reservationId: null })}>
                        <span className="adm-btn-glyph" aria-hidden="true">+</span>New reservation
                    </button>}
            </header>

            <StoreTabs storeId={storeId} />

            <div className="resv-toolbar">
                <div role="group" aria-label="Show" className="adm-segmented adm-segmented--compact">
                    {SCOPES.map(option => (
                        <button
                            key={option.value}
                            type="button"
                            aria-pressed={scope === option.value}
                            className={`adm-segmented-item ${scope === option.value ? "is-active" : ""}`}
                            onClick={() => setScope(option.value)}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
                {from &&
                    <span className="adm-muted adm-small">
                        {formatShortDate(from)} – {formatShortDate(to)} · {reservations.length} {reservations.length === 1 ? "reservation" : "reservations"}
                    </span>}
            </div>

            {isLoading && !reservations.length && <HeartbeatLoader label="Loading reservations" />}
            {error && <p className="adm-form-error" role="alert">{errorMessage(error, "Could not load reservations.")}</p>}

            {!isLoading && !error && reservations.length === 0 &&
                <div className="adm-card resv-empty" role="status">
                    <strong className="adm-card-title">{scope === "past" ? "No past reservations" : "No upcoming reservations"}</strong>
                    <span className="adm-muted">
                        {scope === "past"
                            ? "Nothing was booked in the last six weeks."
                            : "Bookings for the next six weeks will show up here as they come in."}
                    </span>
                </div>}

            {reservations.length > 0 &&
                <ol aria-label="Reservations" className="resv-list">
                    {reservations.map(reservation => {
                        const table = tableLabel(reservation.tableId);
                        const meta = [
                            table ? `Table ${table}` : "No table",
                            `${reservation.durationMinutes} min`,
                            reservation.phone,
                        ];
                        return (
                            <li key={reservation.id}>
                                <button
                                    type="button"
                                    className={`adm-card resv-card ${reservation.status === "cancelled" ? "is-cancelled" : ""}`}
                                    onClick={() => setDrawer({ reservationId: reservation.id })}
                                >
                                    <span className="resv-card-when">
                                        <span className="resv-card-time">{formatMinutes(reservation.startMinutes)}</span>
                                        <span className="adm-small adm-muted">
                                            {reservation.date === today ? "Today" : formatShortDate(reservation.date).slice(0, -5)}
                                        </span>
                                    </span>
                                    <span className="resv-card-guest">
                                        <span className="resv-card-name">
                                            <span className="resv-ellipsis">{reservation.guestName}</span>
                                            <span className="adm-muted">· {reservation.partySize} {reservation.partySize === 1 ? "guest" : "guests"}</span>
                                        </span>
                                        <span className="adm-small adm-muted resv-ellipsis">{meta.join(" · ")}</span>
                                        {reservation.notes && <span className="adm-small resv-card-notes">{reservation.notes}</span>}
                                    </span>
                                    <span className={`adm-chip adm-chip--medium avail-status-chip avail-status-chip--${reservation.status}`}>
                                        {RESERVATION_STATUS_LABELS[reservation.status]}
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ol>}

            {store && drawer &&
                <ReservationDrawer
                    store={store}
                    uid={uid}
                    date={drawerReservation?.date ?? today}
                    reservation={drawerReservation}
                    tableId={drawerReservation?.tableId ?? null}
                    startMinutes={drawerReservation?.startMinutes ?? null}
                    fromGrid={false}
                    onClose={() => setDrawer(null)}
                    onSaved={refreshReservations}
                />}
        </main>
    );
};

export default StoreReservationsPage;
