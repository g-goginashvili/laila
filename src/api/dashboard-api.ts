import { http } from "../utility/http-client"
import type { DashboardType } from "./types";

export const getDashboard = async () => {
    return await http.get<DashboardType>("/admin/dashboard");
};
