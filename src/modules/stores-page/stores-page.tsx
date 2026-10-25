import "../../components/admin-ui/admin-ui.css";
import "./stores-page.css";

import { Link } from "react-router";
import useStoresPageController from "./use-stores-page-controller";
import NewStoreDrawer from "./new-store-drawer";
import { errorMessage } from "../../utility/validation";
import StoreAvatar from "../../components/admin-ui/store-avatar";
import { isAcceptingReservations, storeOpenTodayChip, streetLine } from "../../utility/store-display";
import HeartbeatLoader from "../../components/heartbeat-loader/heartbeat-loader";

const StoresPage = () => {
    const {
        stores,
        acceptingCount,
        isLoading,
        error,
        isAdding,
        setIsAdding,
    } = useStoresPageController();

    return (
        <main className="adm-page">
            <header className="adm-page-header">
                <div className="adm-title-block">
                    <h1 className="adm-h1">Stores</h1>
                    {!isLoading &&
                        <p className="adm-subtitle">
                            {`${stores.length} ${stores.length === 1 ? "store" : "stores"} · ${acceptingCount} accepting reservations`}
                        </p>}
                </div>
                <button type="button" className="adm-btn adm-btn--primary" onClick={() => setIsAdding(true)}>
                    <span className="adm-btn-glyph" aria-hidden="true">+</span>New store
                </button>
            </header>

            {isLoading && <HeartbeatLoader label="Loading stores" />}
            {error && <p className="adm-form-error" role="alert">{errorMessage(error, "Could not load stores.")}</p>}

            {!isLoading && !error && stores.length === 0 &&
                <p className="adm-empty">No stores yet. Add your first location to start taking reservations.</p>}

            {stores.length > 0 &&
                <ul className="stores-page-grid">
                    {stores.map(store => {
                        const chip = storeOpenTodayChip(store);
                        const accepting = isAcceptingReservations(store);
                        return (
                            <li key={store.id}>
                                <Link
                                    to={`/stores/${store.id}/details`}
                                    className="adm-card adm-link-card stores-page-card"
                                    aria-label={`${store.storeName}${store.city ? `, ${store.city}` : ""} — open store details`}
                                >
                                    <div className="stores-page-card-top">
                                        <StoreAvatar name={store.storeName} />
                                        <div className="stores-page-card-title">
                                            <span className="stores-page-card-name">{store.storeName}</span>
                                            <span className="adm-muted">{streetLine(store)}</span>
                                        </div>
                                    </div>
                                    <div className="stores-page-card-footer">
                                        <span className={`adm-chip adm-chip--${chip.tone}`}>{chip.label}</span>
                                        <dl className="stores-page-card-facts">
                                            <div><dt>Tables</dt><dd>{store.tables.length}</dd></div>
                                            <div><dt>Reservations</dt><dd className={accepting ? "" : "adm-muted"}>{accepting ? "Accepting" : "Not accepting"}</dd></div>
                                        </dl>
                                    </div>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            }

            {isAdding && <NewStoreDrawer onClose={() => setIsAdding(false)} />}
        </main>
    );
};

export default StoresPage;
