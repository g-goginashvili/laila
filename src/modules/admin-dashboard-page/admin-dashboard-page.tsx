import "../../components/admin-ui/admin-ui.css";
import "./admin-dashboard-page.css";

import { Link } from "react-router";
import Dropdown from "../../components/dropdown/dropdown";
import useAdminDashboardPageController from "./use-admin-dashboard-page-controller";
import { errorMessage } from "../../utility/validation";

const AdminDashboardPage = () => {
    const {
        isLoading, error, orgName, firstName, hasLiveStore, setupSteps, firstStoreId,
        allStores, current, isAll, scope, setScope,
        headline, nowLabel, subtitle, tiles, attention, arrivals, arrivalsStoreId, arrivalsStoreName,
        storeRows, weekLabel, bars, metrics,
    } = useAdminDashboardPageController();

    if (isLoading) return <main className="adm-page"><p className="adm-muted">Loading dashboard…</p></main>;
    if (error) return <main className="adm-page"><p className="adm-form-error" role="alert">{errorMessage(error, "Could not load the dashboard.")}</p></main>;

    if (!hasLiveStore) {
        const nextStep = setupSteps.findIndex(step => !step.done);
        return (
            <main className="adm-page">
                <header className="adm-title-block">
                    <h1 className="adm-h1">Welcome{firstName ? `, ${firstName}` : ""}</h1>
                    <p className="adm-subtitle">{orgName} · nothing is live yet</p>
                </header>
                <div className="dash-setup-grid">
                    <section className="adm-card dash-setup-card" aria-labelledby="dash-setup-h">
                        <div className="dash-setup-heading">
                            <span className="dash-setup-logo"><img src="/gviano-icon.svg" alt="" /></span>
                            <div>
                                <h2 id="dash-setup-h" className="dash-title-large">Set up your first restaurant</h2>
                                <span className="adm-muted">Three steps · about 15 minutes</span>
                            </div>
                        </div>
                        <ol className="dash-setup-steps">
                            {setupSteps.map((step, index) => (
                                <li key={step.title} className={`dash-setup-step ${step.done ? "is-done" : index === nextStep ? "is-next" : ""}`}>
                                    <span className="dash-setup-number" aria-hidden="true">{step.done ? "✓" : index + 1}</span>
                                    <div>
                                        <span className="dash-setup-step-title">{step.title}{step.done && <span className="adm-visually-hidden"> (done)</span>}</span>
                                        <span className="adm-muted">{step.body}</span>
                                    </div>
                                </li>
                            ))}
                        </ol>
                        {firstStoreId && setupSteps[0]!.done
                            ? <Link to={`/stores/${firstStoreId}/details`} className="adm-btn adm-btn--primary dash-setup-cta">Continue setting up</Link>
                            : <Link to="/stores?new=1" className="adm-btn adm-btn--primary dash-setup-cta"><span className="adm-btn-glyph" aria-hidden="true">+</span>Add your first store</Link>}
                    </section>
                    <section className="dash-setup-preview" aria-labelledby="dash-preview-h">
                        <h2 id="dash-preview-h" className="adm-card-title">What will appear here</h2>
                        <ul className="dash-bullets">
                            <li>Today’s covers, seats left tonight and who is arriving next</li>
                            <li>Anything that needs a decision — unconfirmed parties, no-shows holding tables, sold-out dishes</li>
                            <li>Occupancy, no-shows and cancellations for the last 7 days, per store or for the whole group</li>
                        </ul>
                        <p className="adm-muted">
                            Reservations start flowing as soon as a store is set to <strong className="dash-strong">Accepting reservations</strong>. Until then this page stays quiet.
                        </p>
                    </section>
                </div>
            </main>
        );
    }

    return (
        <main className="adm-page">
            <header className="adm-page-header">
                <div className="adm-title-block">
                    <h1 className="adm-h1">{headline}</h1>
                    <p className="adm-subtitle">{subtitle}</p>
                </div>
                <div className="adm-field dash-scope">
                    <label htmlFor="dash-scope" className="adm-small adm-muted dash-scope-label">Showing</label>
                    <Dropdown
                        id="dash-scope"
                        className="adm-input adm-input--raised dash-scope-select"
                        value={scope}
                        onChange={setScope}
                        options={[
                            { value: "all", label: `All stores (${allStores.length})` },
                            ...allStores.map(store => ({ value: store.id, label: store.storeName })),
                        ]}
                    />
                </div>
            </header>

            <nav aria-label="Shortcuts" className="dash-shortcuts">
                {isAll ? <>
                    <Link to="/stores" className="adm-btn adm-btn--outline">All stores<span className="adm-btn-glyph" aria-hidden="true">›</span></Link>
                    <Link to="/stores?new=1" className="adm-btn adm-btn--outline">New store<span className="adm-btn-glyph" aria-hidden="true">›</span></Link>
                    <Link to="/payments" className="adm-btn adm-btn--outline">Payments<span className="adm-btn-glyph" aria-hidden="true">›</span></Link>
                </> : <>
                    <Link to={`/stores/${current!.id}/details`} className="adm-btn adm-btn--outline">Store details<span className="adm-btn-glyph" aria-hidden="true">›</span></Link>
                    <Link to={`/stores/${current!.id}/availability`} className="adm-btn adm-btn--outline">Availability<span className="adm-btn-glyph" aria-hidden="true">›</span></Link>
                    <Link to={`/stores/${current!.id}/menu`} className="adm-btn adm-btn--outline">Menu<span className="adm-btn-glyph" aria-hidden="true">›</span></Link>
                </>}
            </nav>

            <section aria-labelledby="dash-today-h" className="dash-section">
                <h2 id="dash-today-h" className="adm-overline">Today · now {nowLabel}</h2>
                <div className="dash-tiles">
                    <div className="adm-card dash-tile">
                        <span className="adm-muted">Covers booked today</span>
                        <span className="dash-tile-value"><span className="dash-big-number">{tiles.covers}</span><span className="adm-muted">of {tiles.capacity}</span></span>
                        <div className="adm-bar" aria-hidden="true"><div className="adm-bar-fill" style={{ width: `${Math.min(tiles.occupancy, 100)}%` }} /></div>
                        <span className="adm-small adm-muted">{tiles.occupancy}% of today’s capacity</span>
                    </div>
                    <div className="adm-card dash-tile">
                        <span className="adm-muted">Seats left tonight</span>
                        <span className="dash-tile-value"><span className="dash-big-number">{tiles.seatsLeft}</span>{tiles.fromSlot && <span className="adm-muted">from {tiles.fromSlot}</span>}</span>
                        <span className={`adm-small ${tiles.seatsLeftUrgent ? "dash-text-error" : "adm-muted"}`}>{tiles.seatsLeftLabel}</span>
                    </div>
                    <div className="adm-card dash-tile">
                        <span className="adm-muted">Seated right now</span>
                        <span className="dash-tile-value"><span className="dash-big-number">{tiles.seatedCovers}</span><span className="adm-muted">guests</span></span>
                        <span className="adm-small adm-muted">{tiles.seatedLabel}</span>
                    </div>
                    <div className={`adm-card dash-tile ${tiles.urgentCount ? "dash-tile--urgent" : ""}`}>
                        <span>Needs attention</span>
                        <span className="dash-tile-value"><span className="dash-big-number">{tiles.attentionCount}</span><span>{tiles.attentionCount === 1 ? "item" : "items"}</span></span>
                        <span className="adm-small">{tiles.urgentCount ? `${tiles.urgentCount} urgent · holding tables right now` : "Nothing urgent"}</span>
                    </div>
                </div>
            </section>

            <div className="dash-two-col">
                <section aria-labelledby="dash-attn-h" className="adm-card adm-card--list">
                    <header className="adm-card-header">
                        <h2 id="dash-attn-h" className="adm-card-title">Needs attention</h2>
                        <span className="adm-card-meta">Most urgent first</span>
                    </header>
                    {attention.length === 0 && <p className="dash-list-empty">Nothing waiting on you. Enjoy the service.</p>}
                    <ul className="dash-list">
                        {attention.map((item, index) => (
                            <li key={`${item.storeId}-${index}`} className="dash-attention-item">
                                <span className={`adm-dot adm-dot--${item.kind}`} aria-hidden="true" />
                                <div className="dash-attention-text">
                                    <span className="dash-strong">{item.title}</span>
                                    <span className="adm-muted">{item.body}</span>
                                </div>
                                {item.action.external
                                    ? <a href={item.action.href} className="adm-btn adm-btn--text">{item.action.label}</a>
                                    : <Link to={item.action.href} className="adm-btn adm-btn--text">{item.action.label}</Link>}
                            </li>
                        ))}
                    </ul>
                </section>

                <section aria-labelledby="dash-next-h" className="adm-card adm-card--list">
                    <header className="adm-card-header">
                        <h2 id="dash-next-h" className="adm-card-title">Arriving next</h2>
                        <span className="adm-card-meta">Next 90 min · {arrivals.length} {arrivals.length === 1 ? "party" : "parties"}</span>
                    </header>
                    {arrivals.length === 0 && <p className="dash-list-empty">No one is due in the next 90 minutes.</p>}
                    <ul className="dash-list">
                        {arrivals.map(reservation => {
                            const unconfirmed = reservation.status === "unconfirmed";
                            return (
                                <li key={reservation.id} className="dash-arrival">
                                    <span className="dash-arrival-time">{reservation.time}</span>
                                    <div className="dash-arrival-guest">
                                        <span className="dash-arrival-name"><span className="dash-strong dash-ellipsis">{reservation.guestName}</span><span className="adm-muted">· {reservation.partySize}</span></span>
                                        {reservation.meta && <span className="adm-small adm-muted dash-ellipsis">{reservation.meta}</span>}
                                    </div>
                                    <span className={`adm-chip adm-chip--medium adm-chip--${unconfirmed ? "warning" : "secondary"}`}>{unconfirmed ? "Unconfirmed" : "Confirmed"}</span>
                                </li>
                            );
                        })}
                    </ul>
                    {arrivalsStoreId &&
                        <Link to={`/stores/${arrivalsStoreId}/availability`} className="dash-more-link">
                            {isAll ? `Open ${arrivalsStoreName} availability` : "Open availability"}<span aria-hidden="true">›</span>
                        </Link>}
                </section>
            </div>

            {isAll &&
                <section aria-labelledby="dash-stores-h" className="adm-card adm-card--list">
                    <header className="adm-card-header">
                        <h2 id="dash-stores-h" className="adm-card-title">Stores today</h2>
                        <span className="adm-card-meta">Sorted by seats left · fullest first</span>
                    </header>
                    <div className="dash-table-scroll">
                        <table className="dash-table">
                            <thead>
                                <tr>
                                    <th scope="col">Store</th>
                                    <th scope="col" className="dash-col-covers">Covers today</th>
                                    <th scope="col" className="dash-num">Left tonight</th>
                                    <th scope="col">Next free table</th>
                                    <th scope="col" className="dash-num"><span className="adm-visually-hidden">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {storeRows.map(row => (
                                    <tr key={row.id}>
                                        <td>
                                            <button type="button" className="dash-store-button" onClick={() => setScope(row.id)}>
                                                <span className="dash-strong">{row.storeName}</span>
                                                <span className="adm-small adm-muted">{row.subtitle}</span>
                                            </button>
                                        </td>
                                        <td>
                                            <div className="dash-covers">
                                                <span className="dash-covers-figures">
                                                    <span>{row.isOpenToday ? <><span className="dash-strong">{row.coversToday}</span><span className="adm-muted"> / {row.capacityToday}</span></> : <span className="adm-muted">— / —</span>}</span>
                                                    <span className="adm-muted">{row.isOpenToday ? `${row.pct}%` : "Closed"}</span>
                                                </span>
                                                <div className="adm-bar" aria-hidden="true"><div className={`adm-bar-fill ${row.isBusy ? "dash-bar-busy" : "dash-bar-normal"}`} style={{ width: `${Math.min(row.pct, 100)}%` }} /></div>
                                            </div>
                                        </td>
                                        <td className="dash-num"><span className={`dash-strong ${row.isNearlyFull ? "dash-text-error" : ""}`}>{row.isServing ? row.seatsLeft : "—"}</span></td>
                                        <td className="adm-muted adm-tabular">{row.nextFreeLabel}</td>
                                        <td className="dash-num dash-row-actions">
                                            <Link to={`/stores/${row.id}/availability`} className="adm-btn adm-btn--text">Availability</Link>
                                            <Link to={`/stores/${row.id}/menu`} className="adm-btn adm-btn--text">Menu</Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            }

            <section aria-labelledby="dash-week-h" className="dash-section">
                <h2 id="dash-week-h" className="adm-overline">{weekLabel}</h2>
                <div className="dash-week">
                    <figure className="adm-card dash-chart" aria-labelledby="dash-chart-h">
                        <figcaption className="dash-chart-caption">
                            <span id="dash-chart-h" className="adm-card-title">Covers per day</span>
                            <span className="dash-legend adm-small adm-muted">
                                <span><span className="dash-legend-swatch" aria-hidden="true" />Booked</span>
                                <span><span className="dash-legend-line" aria-hidden="true" />Capacity</span>
                            </span>
                        </figcaption>
                        <div className="dash-bars" role="img" aria-label={`Covers per day: ${bars.map(bar => `${bar.label}: ${bar.covers} of ${bar.capacity}`).join("; ")}`}>
                            {bars.map(bar => (
                                <div key={bar.date} className="dash-bar-column">
                                    {bar.capacity > 0 && <div className="dash-capacity-line" style={{ bottom: `${bar.capacityPct}%` }} aria-hidden="true" />}
                                    <span className="adm-small adm-muted adm-tabular dash-bar-value">{bar.covers}</span>
                                    <div className={`dash-bar ${bar.isToday ? "is-today" : ""}`} style={{ height: `${bar.heightPct}%` }} />
                                </div>
                            ))}
                        </div>
                        <div className="dash-bar-labels adm-small">
                            {bars.map(bar => <span key={bar.date} className={bar.isToday ? "is-today" : ""}>{bar.label}</span>)}
                        </div>
                    </figure>
                    <dl className="dash-metrics">
                        {metrics.map(metric => (
                            <div key={metric.label} className="adm-card dash-metric">
                                <dt className="adm-muted">{metric.label}</dt>
                                <dd>
                                    <span className="dash-metric-value">{metric.value}</span>
                                    <span className={`adm-small ${metric.good ? "dash-text-success" : "dash-text-error"}`}>{metric.delta}</span>
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </section>
        </main>
    );
};

export default AdminDashboardPage;
