import { createBrowserRouter } from "react-router";
import GvianoReservationsLanding from "../blob/Blob";
import { AdminAuthPage } from "../modules/admin-auth-page/admin-auth-page";
import AdminRequireGuard from "../utility/admin-panel-wrapper";


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
            {
                path: "/admin-panel",
                Component: GvianoReservationsLanding
            },
        ]
    }
]);