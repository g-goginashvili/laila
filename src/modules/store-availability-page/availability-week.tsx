import type { ReservationType, StoreType } from "../../api/types";
import { addDays, formatShortDate } from "../../utility/service-time";
import { shiftsOn } from "../../utility/availability";
import { formatShift } from "../../utility/store-display";

type AvailabilityWeekPropType = {
    store: StoreType;
    weekStart: string;
    today: string | undefined;
    reservations: ReservationType[];
    onOpenDay: (date: string) => void;
};

const AvailabilityWeek = ({ store, weekStart, today, reservations, onOpenDay }: AvailabilityWeekPropType) => {
    const days = Array.from({ length: 7 }, (_, index) => {
        const date = addDays(weekStart, index);
        const booked = reservations.filter(reservation => reservation.date === date && reservation.status !== "cancelled");
        const shifts = shiftsOn(store, date);
        return {
            date,
            shifts,
            closure: store.closures.find(closure => closure.date === date),
            bookings: booked.length,
            covers: booked.filter(reservation => reservation.status !== "no_show").reduce((total, reservation) => total + reservation.partySize, 0),
            unconfirmed: booked.filter(reservation => reservation.status === "unconfirmed").length,
        };
    });

    return (
        <ol className="avail-week">
            {days.map(day => (
                <li key={day.date}>
                    <button type="button" className={`adm-card avail-week-day ${day.date === today ? "is-today" : ""} ${day.shifts.length ? "" : "is-closed"}`} onClick={() => onOpenDay(day.date)}>
                        <span className="avail-week-date">
                            {formatShortDate(day.date).slice(0, -5)}
                            {day.date === today && <span className="avail-today-pill">Today</span>}
                        </span>
                        <span className="adm-small adm-muted adm-tabular">
                            {day.closure ? `Closed${day.closure.note ? ` · ${day.closure.note}` : ""}` : day.shifts.length ? day.shifts.map(formatShift).join(" · ") : "Closed"}
                        </span>
                        <span className="avail-week-figures">
                            <span><span className="avail-week-number">{day.bookings}</span> <span className="adm-muted">{day.bookings === 1 ? "booking" : "bookings"}</span></span>
                            <span><span className="avail-week-number">{day.covers}</span> <span className="adm-muted">{day.covers === 1 ? "cover" : "covers"}</span></span>
                        </span>
                        {day.unconfirmed > 0 && <span className="adm-chip adm-chip--warning adm-chip--medium">{day.unconfirmed} unconfirmed</span>}
                    </button>
                </li>
            ))}
        </ol>
    );
};

export default AvailabilityWeek;
