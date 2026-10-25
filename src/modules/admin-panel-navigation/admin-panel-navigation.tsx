import "../../components/admin-ui/admin-ui.css";
import "./admin-panel-navigation.css";

import { type ReactElement } from "react";
import { NavLink } from "react-router";
import useAdminPanelNavigationController from "./use-admin-panel-navigation-controller";
import type { AdminThemeModeType } from "../../hooks/use-admin-theme";

const STORE_SECTIONS = [
    { label: "Details", path: "details" },
    { label: "Tables", path: "tables" },
    { label: "Menu", path: "menu" },
    { label: "Availability", path: "availability" },
];

const THEME_OPTIONS: { value: AdminThemeModeType, label: string }[] = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "system", label: "Auto" },
];

const navClass = ({ isActive }: { isActive: boolean }) => `admin-nav-item ${isActive ? "is-active" : ""}`;

const AdminPanelNavigation = (): ReactElement => {
    const {
        organisation,
        stores,
        user,
        initials,
        activeStoreId,
        activeSection,
        isAccountMenuOpen,
        isMobileNavOpen,
        themeMode,
        setThemeMode,
        setIsAccountMenuOpen,
        setIsMobileNavOpen,
        closeMenus,
        handleSignOut,
    } = useAdminPanelNavigationController();

    const brand = (
        <div className="admin-nav-brand">
            <span className="admin-nav-logo"><img src="/gviano-icon.svg" alt="" /></span>
            <div className="admin-nav-brand-text">
                <span className="admin-nav-brand-title">Gviano Admin Panel</span>
                <span className="admin-nav-brand-org">{organisation?.orgName}</span>
            </div>
        </div>
    );

    const links = (
        <ul className="admin-nav-list">
            <li><NavLink to="/dashboard" className={navClass} onClick={closeMenus}>Dashboard</NavLink></li>
            <li className="admin-nav-group">
                <NavLink to="/stores" className={navClass} onClick={closeMenus}>Stores</NavLink>
                {stores.length > 0 && <>
                    <div className="admin-nav-divider" />
                    <ul className="admin-nav-sublist">
                        {stores.map(store => {
                            const isActiveStore = store.id === activeStoreId;
                            return (
                                <li key={store.id}>
                                    <NavLink
                                        to={`/stores/${store.id}/details`}
                                        className={`admin-nav-subitem ${isActiveStore ? "is-current" : ""}`}
                                        onClick={closeMenus}
                                    >
                                        {store.storeName}
                                    </NavLink>
                                    {isActiveStore &&
                                        <ul className="admin-nav-sublist admin-nav-sublist--sections">
                                            {STORE_SECTIONS.map(section => (
                                                <li key={section.path}>
                                                    <NavLink
                                                        to={`/stores/${store.id}/${section.path}`}
                                                        className={`admin-nav-subitem ${activeSection === section.path ? "is-current" : ""}`}
                                                        aria-current={activeSection === section.path ? "page" : undefined}
                                                        onClick={closeMenus}
                                                    >
                                                        {section.label}
                                                    </NavLink>
                                                </li>
                                            ))}
                                        </ul>
                                    }
                                </li>
                            );
                        })}
                    </ul>
                </>}
            </li>
            <li><NavLink to="/payments" className={navClass} onClick={closeMenus}>Payments</NavLink></li>
        </ul>
    );

    const account = (
        <div className="admin-nav-account">
            {isAccountMenuOpen &&
                <div className="admin-nav-account-menu" role="menu">
                    <div className="admin-nav-theme" role="group" aria-label="Theme">
                        <span className="adm-small adm-muted">Theme</span>
                        <div className="adm-segmented adm-segmented--compact">
                            {THEME_OPTIONS.map(option => (
                                <button
                                    key={option.value}
                                    type="button"
                                    role="menuitemradio"
                                    aria-checked={themeMode === option.value}
                                    className={`adm-segmented-item ${themeMode === option.value ? "is-active" : ""}`}
                                    onClick={() => setThemeMode(option.value)}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button type="button" role="menuitem" className="admin-nav-menu-item admin-nav-menu-item--danger" onClick={handleSignOut}>
                        Sign out
                    </button>
                </div>
            }
            <button
                type="button"
                className="admin-nav-account-button"
                aria-expanded={isAccountMenuOpen}
                aria-haspopup="menu"
                onClick={() => setIsAccountMenuOpen(open => !open)}
            >
                <span className="admin-nav-avatar" aria-hidden="true">{initials}</span>
                <span className="admin-nav-account-text">
                    <span>{user?.displayName}</span>
                    <span className="adm-muted admin-nav-ellipsis">{user?.email}</span>
                </span>
                <span className={`admin-nav-caret ${isAccountMenuOpen ? "is-open" : ""}`} aria-hidden="true" />
            </button>
        </div>
    );

    const panel = (
        <>
            <div className="admin-nav-top">
                {brand}
                {links}
            </div>
            {account}
        </>
    );

    return (
        <>
            <nav aria-label="Admin" className="admin-nav admin-nav--sidebar">{panel}</nav>

            <header className="admin-topbar">
                <button
                    type="button"
                    className="admin-topbar-menu"
                    aria-label="Open navigation"
                    aria-expanded={isMobileNavOpen}
                    onClick={() => setIsMobileNavOpen(true)}
                >
                    <span aria-hidden="true" /><span aria-hidden="true" /><span aria-hidden="true" />
                </button>
                <span className="admin-nav-logo admin-nav-logo--small"><img src="/gviano-icon.svg" alt="" /></span>
                <span className="admin-topbar-title">{organisation?.orgName}</span>
                <span className="admin-nav-avatar admin-nav-avatar--small" aria-hidden="true">{initials}</span>
            </header>

            {isMobileNavOpen && <>
                <div className="adm-drawer-overlay" aria-hidden="true" onClick={() => setIsMobileNavOpen(false)} />
                <nav aria-label="Admin" className="admin-nav admin-nav--drawer">
                    <button type="button" className="adm-icon-btn admin-nav-close" aria-label="Close navigation" onClick={() => setIsMobileNavOpen(false)}>×</button>
                    {panel}
                </nav>
            </>}
        </>
    );
};

export default AdminPanelNavigation;
