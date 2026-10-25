import type { ReservationStatusType } from "../../api/types";

export const RESERVATION_STATUS_LABELS: Record<ReservationStatusType, string> = {
    unconfirmed: "Unconfirmed",
    confirmed: "Confirmed",
    seated: "Seated",
    finished: "Finished",
    no_show: "No-show",
    cancelled: "Cancelled",
};

export const LEGEND_STATUSES: ReservationStatusType[] = ["unconfirmed", "confirmed", "seated", "finished", "no_show"];
