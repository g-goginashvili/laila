import { createBrowserRouter } from "react-router";
import { createElement } from "react";
import AdminAuthPage from "../modules/admin-auth-page/admin-auth-page";
import AdminRequireGuard from "../utility/admin-panel-wrapper";
import StoreDetailsPage from "../modules/store-details-page/store-details-page";
import AdminDashboardPage from "../modules/admin-dashboard-page/admin-dashboard-page";
// import LandingPage from "../modules/landing-page/landing-page";
import StoresPage from "../modules/stores-page/stores-page";
import ComingSoonPage from "../modules/coming-soon-page/coming-soon-page";
import StoreMenuPage from "../modules/store-menu-page/store-menu-page";
import StoreAvailabilityPage from "../modules/store-availability-page/store-availability-page";
import StoreTablesPage from "../modules/store-tables-page/store-tables-page";
import NotFoundPage from "../modules/not-found-page/not-found-page";
import AccountPage from "../modules/account-page/account-page";


const comingSoon = (title: string, description: string) =>
    createElement(ComingSoonPage, { title, description });

export const customRouter = createBrowserRouter([
    {
        path: "/",
        Component: AdminAuthPage,
    },
    {
        path: "/admin-auth",
        Component: AdminAuthPage,
    },
    {
        Component: AdminRequireGuard,
        children: [
            { path: "/dashboard", Component: AdminDashboardPage },
            { path: "/account", Component: AccountPage },
            { path: "/stores", Component: StoresPage },
            { path: "/stores/:storeId/details", Component: StoreDetailsPage },
            { path: "/stores/:storeId/tables", Component: StoreTablesPage },
            { path: "/stores/:storeId/menu", Component: StoreMenuPage },
            { path: "/stores/:storeId/availability", Component: StoreAvailabilityPage },
            {
                path: "/payments",
                element: comingSoon("Payments", "Deposits and pre-order payments, payouts and refunds will appear here once online payments are switched on."),
            },
        ]
    },
    {
        path: "*",
        Component: NotFoundPage,
    }
]);
