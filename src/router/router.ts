import { createBrowserRouter } from "react-router";
import { createElement } from "react";
import AdminAuthPage from "../modules/admin-auth-page/admin-auth-page";
import AdminRequireGuard from "../utility/admin-panel-wrapper";
import StoreDetailsPage from "../modules/store-details-page/store-details-page";
import AdminDashboardPage from "../modules/admin-dashboard-page/admin-dashboard-page";
import LandingPage from "../modules/landing-page/landing-page";
import StoresPage from "../modules/stores-page/stores-page";
import ComingSoonPage from "../modules/coming-soon-page/coming-soon-page";


const comingSoon = (title: string, description: string) =>
    createElement(ComingSoonPage, { title, description });

export const customRouter = createBrowserRouter([
    {
        path: "/",
        Component: LandingPage,
    },
    {
        path: "/home",
        Component: LandingPage,
    },
    {
        path: "/admin-auth",
        Component: AdminAuthPage,
    },
    {
        Component: AdminRequireGuard,
        children: [
            { path: "/dashboard", Component: AdminDashboardPage },
            { path: "/stores", Component: StoresPage },
            { path: "/stores/:storeId/details", Component: StoreDetailsPage },
            {
                path: "/stores/:storeId/menu",
                element: comingSoon("Menu", "Menu categories, items and prices for this store will be managed here."),
            },
            {
                path: "/stores/:storeId/availability",
                element: comingSoon("Availability", "Opening hours, tables and bookable time slots will be managed here."),
            },
            {
                path: "/payments",
                element: comingSoon("Payments", "Pre-order payments and payouts will appear here."),
            },
        ]
    }
]);
