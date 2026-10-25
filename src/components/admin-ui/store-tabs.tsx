import "./admin-ui.css";

import { NavLink } from "react-router";

const SECTIONS = [
    { label: "Details", path: "details" },
    { label: "Menu", path: "menu" },
    { label: "Availability", path: "availability" },
] as const;

// Segmented Details / Menu / Availability switcher shown on every store page.
const StoreTabs = ({ storeId }: { storeId: string }) => {
    return (
        <nav aria-label="Store sections" className="adm-segmented">
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
