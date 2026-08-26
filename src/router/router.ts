import { createBrowserRouter } from "react-router";
import GvianoReservationsLanding from "../blob/Blob";
import { AdminAuthPage } from "../modules/admin-auth-page/admin-auth-page";
import AdminRequireGuard from "../utility/admin-panel-wrapper";
import StoreDetailsPage from "../modules/store-details-page/store-details-page";
import AdminDashboardPage from "../modules/admin-dashboard-page/admin-dashboard-page";


export const customRouter = createBrowserRouter([
    {
        path: "/",
        Component: GvianoReservationsLanding,
    },
    {
        path: "/home",
        Component: GvianoReservationsLanding,
    },
    {
        path: "/admin-auth",
        Component: AdminAuthPage,
    },
    {
        Component: AdminRequireGuard,
        children: [
            { path: "/dashboard", Component: AdminDashboardPage },
            { path: "/stores",  },
            { path: "/stores/:storeId/details", Component: StoreDetailsPage },
            { path: "/stores/:storeId/menu",  },
            { path: "/stores/:storeId/availability",  },
            { path: "/payments", },
        ]
    }
]);