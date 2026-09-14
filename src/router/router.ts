import { createBrowserRouter } from "react-router";
import AdminAuthPage from "../modules/admin-auth-page/admin-auth-page";
import AdminRequireGuard from "../utility/admin-panel-wrapper";
import StoreDetailsPage from "../modules/store-details-page/store-details-page";
import AdminDashboardPage from "../modules/admin-dashboard-page/admin-dashboard-page";
import LandingPage from "../modules/landing-page/landing-page";


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
            { path: "/stores", },
            { path: "/stores/:storeId/details", Component: StoreDetailsPage },
            { path: "/stores/:storeId/menu", },
            { path: "/stores/:storeId/availability", },
            { path: "/payments", },
        ]
    }
]);