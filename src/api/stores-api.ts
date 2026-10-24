import { http } from "../utility/http-client"
import type { StoreType, StoreValuesType } from "./types";

export const getStoresList = async () => {
    return await http.get<StoreType[]>("/stores");
};

export const getStore = async (id: string) => {
    return await http.get<StoreType>(`/stores/${encodeURIComponent(id)}`);
};

export const addStore = async (values: StoreValuesType) => {
    return await http.post<StoreType>("/stores", values);
};

export const updateStore = async ({ id, values }: { id: string, values: Partial<StoreValuesType> }) => {
    return await http.patch<StoreType>(`/stores/${encodeURIComponent(id)}`, values);
};

export const deleteStore = async (id: string) => {
    return await http.delete<{ id: string }>(`/stores/${encodeURIComponent(id)}`);
};
