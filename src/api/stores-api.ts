import { http } from "../utility/http-client"

export const getStoresList = async (organisationId: string) => {
    return await http.get(
        `/store/stores-list?organisationId=${organisationId}`
    );
};