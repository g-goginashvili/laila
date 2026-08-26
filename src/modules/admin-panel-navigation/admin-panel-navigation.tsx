import Typography from "../../components/typography/typography";
import useAuth from "../../hooks/use-auth";
import Chevron from "../../icons/chevron";
import { firebaseAuth } from "../../utility/firebase";
import "./admin-panel-navigation.css";

import { useState, type ReactElement } from "react";

type NavItemType = {
    name: "Dashboard" | "Venues" | "Payments";
}

const navItems: NavItemType[] = [
    { name: "Dashboard" },
    { name: "Venues" },
    { name: "Payments" },
];

const venues = [
    "venue1", "venue2", "venue3"
];

const VenueList = ({ activeVenue, setActiveVenue }: { activeVenue: string, setActiveVenue: (value: string) => void }) => {
    const [activeOption, setActiveOption] = useState("");

    return (
        <ul className="admin-panel-navigation-sub-items-list" >
            {venues.map(venue => (
                <li key={venue}>
                    <button
                        type="button"
                        onClick={() => setActiveVenue(venue)}
                        className={`admin-panel-navigation-sub-item ${activeVenue === venue ? "admin-panel-navigation-active-sub-item" : ""}`}
                    >
                        <Typography variant="label" color="inherit">{venue}</Typography>
                    </button>

                    {activeVenue === venue &&
                        <ul className="admin-panel-navigation-sub-items-list">
                            {
                                ["Details", "Menu", "Availability"].map(option => (
                                    <li key={option}>
                                        <button
                                            type="button"
                                            onClick={() => setActiveOption(option)}
                                            className={`admin-panel-navigation-sub-item ${activeOption === option ? "admin-panel-navigation-active-sub-item" : ""}`}
                                        >
                                            {option}
                                        </button>
                                    </li>
                                ))
                            }
                        </ul>
                    }
                </li>
            ))}
        </ul>
    )
};

const AdminPanelNavigation = (): ReactElement => {
    const [activeItem, setActiveItem] = useState<"Dashboard" | "Venues" | "Payments">("Dashboard");
    const [activeVenue, setActiveVenue] = useState("");
    const [isOptionsActive, setIsOptionsActive] = useState<boolean>(false);
    const { user } = useAuth();

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
                        <Typography variant="title" size="medium">Gviano</Typography>
                        <Typography variant="body" size="medium">Admin panel</Typography>
                    </div>
                </div>

                <ul className="admin-panel-navigation-items-list">
                    {navItems.map(({ name }) => (
                        <li key={name}>
                            <button
                                type="button"
                                onClick={() => {
                                    setActiveItem(name)
                                    setActiveVenue("");
                                }}
                                className={`admin-panel-navigation-item ${activeItem === name ? "admin-panel-navigation-active-item" : ""}`}
                            >
                                <Typography variant="label">{name}</Typography>
                            </button>
                            {(name === "Venues" && activeItem === "Venues") && (
                                <>
                                    <div className="line-under-list-item-venue" />
                                    <VenueList activeVenue={activeVenue} setActiveVenue={setActiveVenue} />
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            </div>

            <div>
                {isOptionsActive &&
                    <div className="admin-panel-navigation-account-settings-details">
                        <button>
                            <Typography variant="label">Accunt Settings</Typography>
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
                        <Typography variant="body" color="on-primary" weight="emphasis">
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