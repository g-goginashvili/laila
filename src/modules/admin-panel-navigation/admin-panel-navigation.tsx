import Typography from "../../components/typography/typography";
import Chevron from "../../icons/chevron";
import { firebaseAuth } from "../../utility/firebase";
import "./admin-panel-navigation.css";

import { type ReactElement } from "react";
import useAdminPanelNavigationController from "./use-admin-panel-navigation-controller";
import { NavLink } from "react-router";

type NavItemType = {
    name: "Dashboard" | "Stores" | "Payments";
    route: string;
};

const navItems: NavItemType[] = [
    { name: "Dashboard", route: "/dashboard" },
    { name: "Stores", route: "/stores" },
    { name: "Payments", route: "/payments" },
];

const AdminPanelNavigation = (): ReactElement => {

    const {
        organisation,
        stores,
        isOptionsActive,
        user,
        isStoresSection,
        storesMatch,
        setIsOptionsActive
    } = useAdminPanelNavigationController();

    return (
        <nav className="admin-panel-navigation">

            <div>
                <div className="admin-panel-navigation-header">
                    <img
                        src="../../../Mascot.png"
                        alt="Company logo"
                        className="admin-panel-navigation-header-icon"
                    />
                    <div className="admin-panel-navigation-header-text">
                        <Typography variant="title" size="medium">Gviano Admin Panel</Typography>
                        <Typography variant="body" size="medium">{organisation?.orgName}</Typography>
                    </div>
                </div>

                <ul className="admin-panel-navigation-items-list">
                    {navItems.map(({ name, route }) => (
                        <li key={name}>
                            <NavLink
                                to={route}
                                className={({ isActive }) =>
                                    `admin-panel-navigation-item ${isActive
                                        ? "admin-panel-navigation-active-item" : ""}`}
                            >
                                <Typography variant="label" color="inherit">{name}</Typography>
                            </NavLink>

                            {(name === "Stores" && isStoresSection && stores.length > 0) &&
                                <>
                                    <div className="line-under-list-item-store" />
                                    <ul className="admin-panel-navigation-sub-items-list" >
                                        {stores.map((store: any) => (
                                            <li key={store.id}>
                                                <NavLink
                                                    to={`/stores/${store.id}/details`}
                                                    className={`admin-panel-navigation-sub-item ${storesMatch?.params.storeId === store.id
                                                        ? "admin-panel-navigation-active-sub-item" : ""}`}
                                                >
                                                    <Typography variant="label" color="inherit">{store.storeName}</Typography>
                                                </NavLink>

                                                {storesMatch?.params.storeId === store.id &&
                                                    <ul className="admin-panel-navigation-sub-items-list">
                                                        {
                                                            ["Details", "Menu", "Availability"].map(option => (
                                                                <li key={option}>
                                                                    <NavLink
                                                                        to={`/stores/${store.id}/${option}`}
                                                                        className={({ isActive }) =>
                                                                            `admin-panel-navigation-sub-item ${isActive
                                                                                ? "admin-panel-navigation-active-sub-item" : ""}`}
                                                                    >
                                                                        <Typography variant="label" color="inherit">{option}</Typography>
                                                                    </NavLink>
                                                                </li>
                                                            ))
                                                        }
                                                    </ul>
                                                }
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            }
                        </li>
                    ))}
                </ul>

            </div>

            <div>
                {isOptionsActive &&
                    <div className="admin-panel-navigation-account-settings-details">
                        <button>
                            <Typography variant="label">Account Settings</Typography>
                        </button>
                        <button
                            onClick={() => { firebaseAuth.signOut() }}
                        >
                            <Typography variant="label" color="error">Sign Out</Typography>
                        </button>
                    </div>
                }

                <button
                    onClick={() => { setIsOptionsActive(prev => !prev) }}
                    className="admin-panel-navigation-account-settings"
                >
                    <div className="admin-panel-navigation-account-avatar-holder">
                        <Typography variant="body" color="inherit" weight="emphasis">
                            {
                                user?.displayName
                                    ?.split(" ")
                                    .filter((_, index, arr) => index === 0 || index === arr.length - 1)
                                    .map(item => item[0])
                                    .join("")
                            }
                        </Typography>
                    </div>
                    <div className="admin-panel-navigation-account-settings-text">
                        <Typography variant="body" size="small">{user?.displayName}</Typography>
                        <Typography variant="body" size="small" color="secondary">{user?.email}</Typography>
                    </div>
                    <Chevron facing={isOptionsActive ? "up" : "down"} />
                </button>
            </div>
        </nav>
    );
};

export default AdminPanelNavigation;