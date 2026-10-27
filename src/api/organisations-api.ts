import { http } from "../utility/http-client"
import type { OrganisationType } from "./types";

export const getOrganisationDetails = async () => {
    return await http.get<OrganisationType>("/admin/org");
};
