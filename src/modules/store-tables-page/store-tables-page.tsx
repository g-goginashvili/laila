import "../../components/admin-ui/admin-ui.css";
import "./store-tables-page.css";

import { Link } from "react-router";
import StoreTabs from "../../components/admin-ui/store-tabs";
import StoreTablesDrawer from "../store-details-page/store-tables-drawer";
import useStoreTablesPageController from "./use-store-tables-page-controller";
import { errorMessage } from "../../utility/validation";

const StoreTablesPage = () => {
    const {
        storeId, store, isLoading, error, applyStore, tables, freeCount,
        toggle, isToggling, isEditing, setIsEditing,
    } = useStoreTablesPageController();

    return (
        <main className="adm-page">
            <Link to={`/stores/${storeId}/details`} className="adm-back-link"><span className="adm-back-link-arrow" aria-hidden="true">‹</span>Store details</Link>

            <header className="adm-page-header adm-page-header--top">
                <div className="adm-title-block">
                    <h1 className="adm-h1">{store?.storeName ?? "Tables"}</h1>
                </div>
                {store &&
                    <button type="button" className="adm-btn adm-btn--primary" onClick={() => setIsEditing(true)}>Edit tables</button>}
            </header>

            <StoreTabs storeId={storeId} />

            {isLoading && !store && <p className="adm-muted">Loading tables…</p>}
            {error && !store && <p className="adm-form-error" role="alert">{errorMessage(error, "Could not load the tables.")}</p>}

            {store && tables.length === 0 &&
                <div className="adm-card tables-empty">
                    <strong className="adm-card-title">No tables yet</strong>
                    <span className="adm-muted">Add your tables to track which ones are occupied.</span>
                    <button type="button" className="adm-btn adm-btn--outline" onClick={() => setIsEditing(true)}>Add tables</button>
                </div>}

            {/* Same layout as Opening hours on the details page: tiles in a card, occupied styled like a closed day. */}
            {tables.length > 0 &&
                <section aria-labelledby="tables-title" className="adm-card adm-card--padded">
                    <div className="adm-card-header">
                        <h2 id="tables-title" className="adm-card-title">Tables</h2>
                        <span className="adm-muted">{freeCount} of {tables.length} free</span>
                    </div>

                    <ul className="tables-grid">
                        {tables.map(table => (
                            <li key={table.id}>
                                <button
                                    type="button"
                                    className={`tables-tile ${table.occupied ? "is-occupied" : ""}`}
                                    aria-pressed={table.occupied}
                                    aria-describedby={`table-${table.id}-hint`}
                                    disabled={isToggling(table.id)}
                                    onClick={() => toggle(table)}
                                >
                                    <span className="tables-tile-head">
                                        <span className="tables-tile-name">{table.label}</span>
                                        <span className={`adm-chip ${table.occupied ? "adm-chip--neutral" : "adm-chip--success"}`}>
                                            {table.occupied ? "Occupied" : "Free"}
                                        </span>
                                    </span>
                                    {/* Always present so free and occupied tiles line up. */}
                                    <span className={table.occupied ? "tables-tile-since" : "adm-muted"}>
                                        {table.occupiedLabel ?? "Timestamp not started"}
                                    </span>
                                    <span id={`table-${table.id}-hint`} className="adm-visually-hidden">
                                        {table.occupied ? "Click to free this table." : "Click to mark this table occupied."}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>

                    <p className="adm-muted tables-note">Click a table to mark it occupied. It can’t be booked until you click it again.</p>
                </section>}

            {isEditing && store && <StoreTablesDrawer store={store} onClose={() => setIsEditing(false)} onSaved={applyStore} />}
        </main>
    );
};

export default StoreTablesPage;
