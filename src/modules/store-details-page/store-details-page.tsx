import "../../components/admin-ui/admin-ui.css";
import "./store-details-page.css";

import { Fragment } from "react";
import { Link } from "react-router";
import StoreTabs from "../../components/admin-ui/store-tabs";
import useStoreDetailsPageController from "./use-store-details-page-controller";
import StoreEditDrawer from "./store-edit-drawer";
import StoreHoursDrawer from "./store-hours-drawer";
import StoreTablesDrawer from "./store-tables-drawer";
import { errorMessage } from "../../utility/validation";

const StoreDetailsPage = () => {
    const { store, details, isLoading, error, drawer, setDrawer, applyStore } = useStoreDetailsPageController();

    if (isLoading) return <main className="adm-page"><p className="adm-muted">Loading store…</p></main>;
    if (error || !store || !details) {
        return (
            <main className="adm-page">
                <Link to="/stores" className="adm-back-link"><span className="adm-back-link-arrow" aria-hidden="true">‹</span>Stores</Link>
                <p className="adm-form-error" role="alert">{errorMessage(error, "Store not found.")}</p>
            </main>
        );
    }

    const closeDrawer = () => setDrawer(null);

    return (
        <main className="adm-page">
            <Link to="/stores" className="adm-back-link"><span className="adm-back-link-arrow" aria-hidden="true">‹</span>Stores</Link>

            <header className="adm-page-header adm-page-header--top">
                <div className="adm-title-block store-details-title">
                    <h1 className="adm-h1">{store.storeName}</h1>
                </div>
                <button type="button" className="adm-btn adm-btn--primary store-details-edit" onClick={() => setDrawer("edit")}>Edit</button>
            </header>

            <StoreTabs storeId={store.id} />

            {store.status === "temporarily_closed" && store.closureNote &&
                <div className="adm-callout adm-callout--warning" role="status">
                    <span className="store-details-callout-mark" aria-hidden="true">!</span>
                    <span>Diners see “{store.closureNote}”{store.reopensOn ? ` · bookings reopen ${store.reopensOn}` : ""}.</span>
                </div>}

            <div className="store-details-grid">
                <section aria-labelledby="sd-hours" className="adm-card adm-card--padded store-details-wide">
                    <div className="adm-card-header">
                        <h2 id="sd-hours" className="adm-card-title">Opening hours</h2>
                        <span className="store-details-header-end">
                            <span className="adm-muted">{store.timezone} · last seating {store.lastSeatingMinutes} min before close</span>
                            <button type="button" className="adm-btn adm-btn--text" onClick={() => setDrawer("hours")}>Edit hours</button>
                        </span>
                    </div>
                    <ol className="store-details-week">
                        {details.week.map(day => (
                            <li
                                key={day.short}
                                aria-current={day.isToday ? "date" : undefined}
                                className={`store-details-day ${day.shifts.length ? "" : "is-closed"} ${day.isToday ? "is-today" : ""}`}
                            >
                                <div className="store-details-day-head">
                                    <span className="store-details-day-name"><abbr title={day.name}>{day.short}</abbr></span>
                                    {day.isToday && <span className="store-details-today">Today</span>}
                                </div>
                                {day.shifts.length
                                    ? <div className="store-details-shifts">{day.shifts.map(shift => <span key={shift}>{shift}</span>)}</div>
                                    : <span className="adm-muted">Closed</span>}
                            </li>
                        ))}
                    </ol>
                    <p className="adm-muted store-details-note">Closing times up to 06:00 count as the following morning. Whole-day closures are set under Availability.</p>
                </section>

                <section aria-labelledby="sd-contact" className="adm-card adm-card--padded">
                    <h2 id="sd-contact" className="adm-card-title">Address &amp; contact</h2>
                    <dl className="adm-dl">
                        <dt>Address</dt><dd>{details.addressLines.map(line => <span key={line} className="store-details-line">{line}</span>)}</dd>
                        <dt>Phone</dt><dd><a href={`tel:${store.phoneNumber}`}>{store.phoneNumber}</a></dd>
                        <dt>Reservations</dt><dd><a href={`mailto:${store.email}`}>{store.email}</a></dd>
                        <dt>Manager</dt><dd>{store.storeManager}</dd>
                        {details.websiteHref && <><dt>Website</dt><dd><a href={details.websiteHref} target="_blank" rel="noreferrer">{store.website}</a></dd></>}
                    </dl>
                </section>

                <section aria-labelledby="sd-capacity" className="adm-card adm-card--padded">
                    <div className="adm-card-header">
                        <h2 id="sd-capacity" className="adm-card-title">Capacity &amp; seating</h2>
                        <button type="button" className="adm-btn adm-btn--text" onClick={() => setDrawer("tables")}>Edit tables</button>
                    </div>
                    {store.tables.length === 0
                        ? <p className="adm-empty">No tables yet. Add them so diners can book.</p>
                        : <dl className="adm-dl">
                            <dt>Capacity</dt><dd><span className="store-details-strong">{details.seats} covers</span> per seating</dd>
                            {details.areas && <><dt>Areas</dt><dd>{details.areas}</dd></>}
                            <dt>Tables</dt>
                            <dd className="store-details-tables">
                                {details.tableGroups.map(group => <span key={group.label}>{group.label} <span className="adm-muted">({group.seats} seats)</span></span>)}
                                <span className="store-details-tables-total"><span className="store-details-strong">{details.seats} seats</span> across {store.tables.length} {store.tables.length === 1 ? "table" : "tables"}</span>
                            </dd>
                            <dt>Party size</dt><dd>{store.minPartySize}–{store.maxPartySize} guests · larger groups by phone</dd>
                            <dt>Table time</dt><dd>{store.tableTimeMinutes} min{store.lunchTableTimeMinutes ? ` · ${store.lunchTableTimeMinutes} min at lunch` : ""}</dd>
                            {store.floorAreaM2 && <><dt>Floor area</dt><dd>{store.floorAreaM2} m²</dd></>}
                        </dl>}
                </section>

                <section aria-labelledby="sd-about" className="adm-card adm-card--padded">
                    <h2 id="sd-about" className="adm-card-title">About</h2>
                    <dl className="adm-dl">
                        <dt>Description</dt><dd>{store.description || <span className="adm-muted">Not set</span>}</dd>
                        <dt>Cuisine</dt><dd>{store.cuisine || <span className="adm-muted">Not set</span>}</dd>
                        <dt>Price range</dt><dd>{store.priceRange || <span className="adm-muted">Not set</span>}</dd>
                        {details.openedLabel && <><dt>Opened</dt><dd>{details.openedLabel}</dd></>}
                        <dt>Store ID</dt><dd className="store-details-id">{store.id}</dd>
                    </dl>
                </section>

                <section aria-labelledby="sd-policies" className="adm-card adm-card--padded">
                    <h2 id="sd-policies" className="adm-card-title">Reservation policy</h2>
                    <dl className="adm-dl">
                        {details.policy.map(row => <Fragment key={row.label}><dt>{row.label}</dt><dd>{row.value}</dd></Fragment>)}
                    </dl>
                </section>

                <div className="store-details-wide store-details-links">
                    <Link to={`/stores/${store.id}/menu`} className="adm-card adm-link-card store-details-link-card">
                        <span className="store-details-link-text"><span className="adm-card-title">Menu</span><span className="adm-muted">{details.menuSummary}</span></span>
                        <span className="adm-chevron-badge" aria-hidden="true" />
                    </Link>
                    <Link to={`/stores/${store.id}/availability`} className="adm-card adm-link-card store-details-link-card">
                        <span className="store-details-link-text"><span className="adm-card-title">Availability</span><span className="adm-muted">{details.availabilitySummary}</span></span>
                        <span className="adm-chevron-badge" aria-hidden="true" />
                    </Link>
                </div>
            </div>

            {drawer === "edit" && <StoreEditDrawer store={store} onClose={closeDrawer} onSaved={applyStore} />}
            {drawer === "hours" && <StoreHoursDrawer store={store} onClose={closeDrawer} onSaved={applyStore} />}
            {drawer === "tables" && <StoreTablesDrawer store={store} onClose={closeDrawer} onSaved={applyStore} />}
        </main>
    );
};

export default StoreDetailsPage;
