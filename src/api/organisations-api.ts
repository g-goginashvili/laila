import { http } from "../utility/http-client"

export const getOrganisationDetails = async (uid: string) => {
    return await http.get(
        `/org/organisation-details?id=${uid}`
    );
};