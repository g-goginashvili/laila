import { http } from "../utility/http-client"
import type { ReservationInputType, ReservationType } from "./types";

const reservationsPath = (storeId: string) => `/admin/stores/${encodeURIComponent(storeId)}/reservations`;

export const getReservations = async ({ storeId, from, to }: { storeId: string, from: string, to: string }) => {
    return await http.get<ReservationType[]>(`${reservationsPath(storeId)}?from=${from}&to=${to}`);
};

export const addReservation = async ({ storeId, values }: { storeId: string, values: ReservationInputType }) => {
    return await http.post<ReservationType>(reservationsPath(storeId), values);
};

export const updateReservation = async (
    { storeId, reservationId, values }: { storeId: string, reservationId: string, values: Partial<ReservationInputType> }
) => {
    return await http.patch<ReservationType>(`${reservationsPath(storeId)}/${encodeURIComponent(reservationId)}`, values);
};

export const deleteReservation = async ({ storeId, reservationId }: { storeId: string, reservationId: string }) => {
    return await http.delete<{ id: string }>(`${reservationsPath(storeId)}/${encodeURIComponent(reservationId)}`);
};
