import type { ReservationStatusType } from "../../api/types";

export const RESERVATION_STATUS_LABELS: Record<ReservationStatusType, string> = {
    upcoming: "Upcoming",
    ongoing: "Ongoing",
    completed: "Completed",
    no_show: "No show",
    cancelled: "Cancelled",
};

export const LEGEND_STATUSES: ReservationStatusType[] = ["upcoming", "ongoing", "completed", "no_show"];
