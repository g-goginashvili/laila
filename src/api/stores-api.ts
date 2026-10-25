import { http } from "../utility/http-client"
import type {
    StoreClosureType, StoreShiftType, StoreTableInputType, StoreTableType, StoreType, StoreUpdateType, StoreValuesType
} from "./types";

const storePath = (id: string) => `/stores/${encodeURIComponent(id)}`;

export const getStoresList = async () => {
    return await http.get<StoreType[]>("/stores");
};

export const getStore = async (id: string) => {
    return await http.get<StoreType>(storePath(id));
};

export const addStore = async (values: StoreValuesType) => {
    return await http.post<StoreType>("/stores", values);
};

export const updateStore = async ({ id, values }: { id: string, values: StoreUpdateType }) => {
    return await http.patch<StoreType>(storePath(id), values);
};

export const deleteStore = async (id: string) => {
    return await http.delete<{ id: string }>(storePath(id));
};

export const replaceStoreHours = async ({ id, hours }: { id: string, hours: Omit<StoreShiftType, "id">[] }) => {
    return await http.put<StoreType>(`${storePath(id)}/hours`, { hours });
};

export const replaceStoreTables = async ({ id, tables }: { id: string, tables: StoreTableInputType[] }) => {
    return await http.put<StoreType>(`${storePath(id)}/tables`, { tables });
};

export const setTableOccupancy = async ({ id, tableId, occupied }: { id: string, tableId: string, occupied: boolean }) => {
    return await http.patch<StoreTableType>(`${storePath(id)}/tables/${encodeURIComponent(tableId)}`, { occupied });
};

export const addStoreClosure = async ({ id, date, note }: { id: string, date: string, note: string }) => {
    return await http.post<StoreClosureType>(`${storePath(id)}/closures`, { date, note });
};

export const deleteStoreClosure = async ({ id, closureId }: { id: string, closureId: string }) => {
    return await http.delete<{ id: string }>(`${storePath(id)}/closures/${encodeURIComponent(closureId)}`);
};
