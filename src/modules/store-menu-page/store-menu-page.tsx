import "../../components/admin-ui/admin-ui.css";
import "./store-menu-page.css";

import { Link } from "react-router";
import StoreTabs from "../../components/admin-ui/store-tabs";
import useStoreMenuPageController from "./use-store-menu-page-controller";
import MenuItemDrawer from "./menu-item-drawer";
import MenuGroupDrawer from "./menu-group-drawer";
import { errorMessage } from "../../utility/validation";
import { formatEuro } from "../../utility/service-time";

const StoreMenuPage = () => {
    const {
        storeId, store, menu, isLoading, error, groups, allergenCount, soldOutCount,
        drawer, setDrawer, drag, refresh,
    } = useStoreMenuPageController();

    const storeName = store?.storeName ?? "";
    const drawerGroup = drawer?.type === "group" ? groups.find(group => group.id === drawer.groupId) ?? null : null;
    const drawerItem = drawer?.type === "item"
        ? groups.flatMap(group => group.items).find(item => item.id === drawer.itemId) ?? null
        : null;

    return (
        <main className="adm-page">
            <Link to={`/stores/${storeId}/details`} className="adm-back-link"><span className="adm-back-link-arrow" aria-hidden="true">‹</span>Store details</Link>

            <header className="adm-page-header adm-page-header--top">
                <div className="adm-title-block">
                    <h1 className="adm-h1">{storeName || "Menu"}</h1>
                </div>
                <button type="button" className="adm-btn adm-btn--primary" onClick={() => setDrawer({ type: "group", groupId: null })}>
                    <span className="adm-btn-glyph" aria-hidden="true">+</span>New group
                </button>
            </header>

            <StoreTabs storeId={storeId} />

            {isLoading && <p className="adm-muted">Loading menu…</p>}
            {error && <p className="adm-form-error" role="alert">{errorMessage(error, "Could not load the menu.")}</p>}

            {menu && groups.length === 0 &&
                <div className="adm-card menu-empty">
                    <strong className="adm-card-title">No menu yet</strong>
                    <span className="adm-muted">Start with a group such as Starters, then add dishes to it. Diners see the menu once the store is accepting reservations.</span>
                    <button type="button" className="adm-btn adm-btn--outline" onClick={() => setDrawer({ type: "group", groupId: null })}>Add first group</button>
                </div>}

            {groups.length > 0 &&
                <div className="menu-hint">
                    <span className="adm-allergen-marker" role="img" aria-label="Allergen marker" />
                    <span>
                        Contains allergens · {allergenCount} {allergenCount === 1 ? "item" : "items"}
                        {soldOutCount > 0 && ` · ${soldOutCount} sold out`}.
                        {groups.length > 1 && " Drag a group header to reorder groups."}
                    </span>
                </div>}

            {groups.map(group => (
                <section
                    key={group.id}
                    aria-labelledby={`mg-${group.id}`}
                    className={`adm-card adm-card--list menu-group ${drag.draggingId === group.id ? "is-dragging" : ""}`}
                    onDragOver={(event) => { event.preventDefault(); drag.over(group.id); }}
                    onDrop={(event) => event.preventDefault()}
                >
                    <header
                        className="menu-group-header"
                        draggable={groups.length > 1}
                        onDragStart={(event) => { event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", group.id); drag.start(group.id); }}
                        onDragEnd={drag.end}
                    >
                        {groups.length > 1 &&
                            <button
                                type="button"
                                className="menu-drag-handle"
                                aria-label={`Reorder ${group.name}. Use the up and down arrow keys.`}
                                title="Drag to reorder"
                                onKeyDown={(event) => {
                                    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                                        event.preventDefault();
                                        drag.nudge(group.id, event.key === "ArrowUp" ? -1 : 1);
                                    }
                                }}
                            >
                                {Array.from({ length: 6 }, (_, index) => <span key={index} />)}
                            </button>}
                        <h2 id={`mg-${group.id}`} className="menu-group-title">
                            <button type="button" className="menu-group-name" onClick={() => setDrawer({ type: "group", groupId: group.id })} title="Rename or delete group">
                                {group.name}
                            </button>
                            <span className="menu-count-chip">{group.items.length} {group.items.length === 1 ? "item" : "items"}</span>
                        </h2>
                        <button type="button" className="adm-btn adm-btn--outline adm-btn--small" onClick={() => setDrawer({ type: "item", itemId: null, groupId: group.id })}>
                            <span className="adm-btn-glyph" aria-hidden="true">+</span>Add item
                        </button>
                    </header>
                    {group.items.length === 0 && <p className="menu-group-empty adm-muted">No items in this group yet.</p>}
                    <ul className="menu-items">
                        {group.items.map(item => {
                            const hasAllergen = item.components.some(component => component.allergen);
                            return (
                                <li key={item.id}>
                                    <button
                                        type="button"
                                        className={`menu-item ${item.available ? "" : "is-sold-out"}`}
                                        aria-label={`Edit ${item.name}`}
                                        onClick={() => setDrawer({ type: "item", itemId: item.id, groupId: group.id })}
                                    >
                                        <span className="menu-item-text">
                                            <span className="menu-item-name">
                                                {item.name}
                                                {!item.available && <span className="adm-chip adm-chip--neutral adm-chip--plain menu-sold-out">Sold out</span>}
                                            </span>
                                            {item.description && <span className="adm-muted">{item.description}</span>}
                                        </span>
                                        <span className="menu-item-marker">
                                            {hasAllergen && <span className="adm-allergen-marker" role="img" aria-label="Contains allergens" title="Contains allergens" />}
                                        </span>
                                        <span className="menu-item-price">{formatEuro(item.price)}</span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </section>
            ))}

            {drawer?.type === "group" &&
                <MenuGroupDrawer storeId={storeId} storeName={storeName} group={drawerGroup} onClose={() => setDrawer(null)} onSaved={refresh} />}
            {drawer?.type === "item" &&
                <MenuItemDrawer
                    storeId={storeId}
                    storeName={storeName}
                    groups={groups}
                    groupId={drawer.groupId}
                    item={drawerItem}
                    onClose={() => setDrawer(null)}
                    onSaved={refresh}
                />}
        </main>
    );
};

export default StoreMenuPage;
