import "../../components/admin-ui/admin-ui.css";
import "./store-availability-page.css";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import { Link } from "react-router";
import StoreTabs from "../../components/admin-ui/store-tabs";
import StoreAvatar from "../../components/admin-ui/store-avatar";
import DatePopover from "../../components/date-picker/date-popover";
import { popoverRoot } from "../../components/popover/use-anchored-position";
import useStoreAvailabilityPageController from "./use-store-availability-page-controller";
import AvailabilityGrid from "./availability-grid";
import AvailabilityWeek from "./availability-week";
import ReservationDrawer from "./reservation-drawer";
import ClosureDrawer from "./closure-drawer";
import { deleteStoreClosure } from "../../api/stores-api";
import { queryKeys } from "../../api/query-keys";
import { useSnackBar } from "../../components/snack-bar/snack-bar-context";
import { errorMessage } from "../../utility/validation";
import { formatMinutes, formatShortDate, addDays, localToday } from "../../utility/service-time";
import { LEGEND_STATUSES, RESERVATION_STATUS_LABELS } from "./reservation-styles";
import useAuth from "../../hooks/use-auth";
import HeartbeatLoader from "../../components/heartbeat-loader/heartbeat-loader";

const StoreAvailabilityPage = () => {
    const {
        storeId, store, applyStore, isLoading, error, now, date, dateLabel, isToday, view,
        goToDate, shiftDate, goToToday, setView, openDay, reservations, dayReservations, cancelledCount,
        range, shifts, closure, weekStart, drawer, setDrawer,
    } = useStoreAvailabilityPageController();
    const uid = useAuth((state) => state.user?.uid);
    const queryClient = useQueryClient();
    const { addSnackBar } = useSnackBar();
    const dateNavRef = useRef<HTMLDivElement>(null);
    const dateButtonRef = useRef<HTMLButtonElement>(null);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [pickerContainer, setPickerContainer] = useState<HTMLElement | null>(null);
    const togglePicker = () => {
        if (!isPickerOpen) setPickerContainer(popoverRoot(dateNavRef.current));
        setIsPickerOpen(!isPickerOpen);
    };
    const closePicker = useCallback((returnFocus: boolean) => {
        setIsPickerOpen(false);
        if (returnFocus) dateButtonRef.current?.focus();
    }, []);

    const refreshReservations = () => {
        queryClient.invalidateQueries({ queryKey: ["reservations", uid, storeId] });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(uid) });
    };
    const refreshStore = () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.store(uid, storeId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(uid) });
    };

    const { mutate: reopen, isPending: isReopening } = useMutation({
        mutationFn: deleteStoreClosure,
        onSuccess: () => {
            addSnackBar(`${dateLabel} reopened.`);
            if (store && closure) applyStore({ ...store, closures: store.closures.filter(entry => entry.id !== closure.id) });
            refreshStore();
        },
        onError: (mutationError) => addSnackBar(errorMessage(mutationError), { variant: "error" }),
    });

    if (isLoading && !store) return <main className="adm-page"><HeartbeatLoader label="Loading availability" /></main>;
    if (!store) return <main className="adm-page"><p className="adm-form-error" role="alert">{errorMessage(error, "Store not found.")}</p></main>;

    const openNew = () => setDrawer({ type: "reservation", reservationId: null, tableId: null, startMinutes: null, fromGrid: false });
    const drawerReservation = drawer?.type === "reservation" && drawer.reservationId
        ? reservations.find(reservation => reservation.id === drawer.reservationId) ?? null
        : null;

    const policyNote = `Table time ${store.tableTimeMinutes} min${store.lunchTableTimeMinutes ? ` · ${store.lunchTableTimeMinutes} min at lunch` : ""}. Last seating ${store.lastSeatingMinutes} min before close.`;

    return (
        <main className="adm-page">
            <Link to={`/stores/${storeId}/details`} className="adm-back-link"><span className="adm-back-link-arrow" aria-hidden="true">‹</span>Store details</Link>

            <header className="adm-page-header adm-page-header--top">
                <div className="adm-title-block">
                    <h1 className="adm-h1">{store.storeName}</h1>
                </div>
                <button type="button" className="adm-btn adm-btn--primary" onClick={openNew}>
                    <span className="adm-btn-glyph" aria-hidden="true">+</span>New reservation
                </button>
            </header>

            <StoreTabs storeId={storeId} />

            <div className="avail-toolbar">
                <div className="avail-toolbar-start">
                    <div className="avail-date-nav" ref={dateNavRef}>
                        <button type="button" aria-label={view === "week" ? "Previous week" : "Previous day"} onClick={() => shiftDate(-1)}>‹</button>
                        <button
                            ref={dateButtonRef}
                            type="button"
                            className="avail-date-button"
                            aria-haspopup="dialog"
                            aria-expanded={isPickerOpen}
                            onClick={togglePicker}
                        >
                            {view === "week" ? `${formatShortDate(weekStart).slice(0, -5)} – ${formatShortDate(addDays(weekStart, 6))}` : dateLabel}
                            <span className="avail-date-caret" aria-hidden="true" />
                        </button>
                        <button type="button" aria-label={view === "week" ? "Next week" : "Next day"} onClick={() => shiftDate(1)}>›</button>
                    </div>
                    <DatePopover
                        isOpen={isPickerOpen}
                        anchorRef={dateNavRef}
                        container={pickerContainer}
                        onClose={closePicker}
                        value={date}
                        onSelect={goToDate}
                        today={now?.date ?? localToday()}
                        highlight={view === "week" ? { from: weekStart, to: addDays(weekStart, 6) } : undefined}
                        label={view === "week" ? "Choose week" : "Choose date"}
                    />
                    <button type="button" className="adm-btn adm-btn--outline" onClick={goToToday} aria-current={isToday ? "date" : undefined}>Today</button>
                </div>
                <div className="avail-toolbar-end">
                    {view === "day" && (closure
                        ? <button type="button" className="adm-btn adm-btn--text" disabled={isReopening} onClick={() => reopen({ id: storeId, closureId: closure.id })}>Reopen this date</button>
                        : <button type="button" className="adm-btn adm-btn--text" onClick={() => setDrawer({ type: "closure" })}>Close this date</button>)}
                    <div role="group" aria-label="View" className="adm-segmented adm-segmented--compact">
                        <button type="button" aria-pressed={view === "day"} className={`adm-segmented-item ${view === "day" ? "is-active" : ""}`} onClick={() => setView("day")}>Day</button>
                        <button type="button" aria-pressed={view === "week"} className={`adm-segmented-item ${view === "week" ? "is-active" : ""}`} onClick={() => setView("week")}>Week</button>
                    </div>
                </div>
            </div>

            {error && <p className="adm-form-error" role="alert">{errorMessage(error, "Could not load reservations.")}</p>}

            {view === "week"
                ? <AvailabilityWeek store={store} weekStart={weekStart} today={now?.date} reservations={reservations} onOpenDay={openDay} />
                : <>
                    <ul aria-label="Legend" className="avail-legend">
                        {LEGEND_STATUSES.map(status => (
                            <li key={status}><span className={`avail-swatch avail-swatch--${status}`} aria-hidden="true" />{RESERVATION_STATUS_LABELS[status]}</li>
                        ))}
                        <li><span className="avail-swatch avail-swatch--closed" aria-hidden="true" />Kitchen closed</li>
                        {isToday && now && <li><span className="avail-swatch avail-swatch--now" aria-hidden="true" />Now · {formatMinutes(now.minutes)}</li>}
                    </ul>

                    {closure &&
                        <div className="adm-callout adm-callout--warning" role="status">
                            <strong aria-hidden="true">!</strong>
                            <span>Closed on {dateLabel}{closure.note ? ` — ${closure.note}` : ""}. Diners can’t book this date.</span>
                        </div>}

                    {store.tables.length === 0 &&
                        <div className="adm-card avail-empty" role="status">
                            <div className="avail-empty-text">
                                <strong className="adm-card-title">No tables yet</strong>
                                <span className="adm-muted">Add tables and seats on the store’s details page to start taking reservations.</span>
                            </div>
                            <Link to={`/stores/${storeId}/details`} className="adm-btn adm-btn--outline">Set up tables</Link>
                        </div>}

                    {store.tables.length > 0 && dayReservations.length === 0 && !closure &&
                        <div className="adm-card avail-empty" role="status">
                            <StoreAvatar name={store.storeName} size="large" />
                            <div className="avail-empty-text">
                                <strong className="adm-card-title">No reservations on {dateLabel}</strong>
                                <span className="adm-muted">
                                    {shifts.length
                                        ? `All ${store.tables.length} tables are free. Click any open slot below to add the first one.`
                                        : "The store is closed on this day of the week. Change the opening hours to take bookings."}
                                </span>
                            </div>
                            {shifts.length > 0 && <button type="button" className="adm-btn adm-btn--outline" onClick={openNew}>Add reservation</button>}
                        </div>}

                    {store.tables.length > 0 &&
                        <AvailabilityGrid
                            tables={store.tables}
                            reservations={dayReservations}
                            shifts={shifts}
                            lastSeatingMinutes={store.lastSeatingMinutes}
                            range={range}
                            nowMinutes={isToday && now ? now.minutes : null}
                            dateLabel={dateLabel}
                            onSlot={(tableId, startMinutes) => setDrawer({ type: "reservation", reservationId: null, tableId, startMinutes, fromGrid: true })}
                            onReservation={(reservation) => setDrawer({ type: "reservation", reservationId: reservation.id, tableId: reservation.tableId, startMinutes: reservation.startMinutes, fromGrid: false })}
                        />}

                    <p className="adm-muted avail-footnote">
                        {policyNote} Scroll sideways for later slots; the table column stays pinned.
                        {cancelledCount > 0 && ` ${cancelledCount} cancelled ${cancelledCount === 1 ? "booking is" : "bookings are"} hidden.`}
                    </p>
                </>}

            {drawer?.type === "reservation" &&
                <ReservationDrawer
                    store={store}
                    uid={uid}
                    date={date}
                    reservation={drawerReservation}
                    tableId={drawer.tableId}
                    startMinutes={drawer.startMinutes}
                    fromGrid={drawer.fromGrid}
                    onClose={() => setDrawer(null)}
                    onSaved={refreshReservations}
                />}
            {drawer?.type === "closure" &&
                <ClosureDrawer
                    store={store}
                    date={date}
                    bookingCount={dayReservations.length}
                    onClose={() => setDrawer(null)}
                    onSaved={refreshStore}
                />}
        </main>
    );
};

export default StoreAvailabilityPage;
