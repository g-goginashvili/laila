import "./admin-ui.css";

import { NavLink } from "react-router";

const SECTIONS = [
    { label: "Details", path: "details" },
    { label: "Tables", path: "tables" },
    { label: "Menu", path: "menu" },
    { label: "Availability", path: "availability" },
    { label: "Reservations", path: "reservations" },
] as const;

// Segmented Details / Tables / Menu / Availability / Reservations switcher shown on every store page.
const StoreTabs = ({ storeId }: { storeId: string }) => {
    return (
        <nav aria-label="Store sections" className="adm-segmented adm-segmented--fill">
            {SECTIONS.map(section => (
                <NavLink
                    key={section.path}
                    to={`/stores/${storeId}/${section.path}`}
                    className={({ isActive }) => `adm-segmented-item ${isActive ? "is-active" : ""}`}
                >
                    {section.label}
                </NavLink>
            ))}
        </nav>
    );
};

export default StoreTabs;
