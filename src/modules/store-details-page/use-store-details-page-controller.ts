import { useState } from "react";
import { useParams } from "react-router";
import useStore from "../../hooks/use-store";
import type { StoreTableType, StoreType } from "../../api/types";
import { addDays, formatDayMonthYear, formatTimestampDate, WEEKDAYS, weekdayOf } from "../../utility/service-time";
import { formatShift, seatCount, storeStatusChip, storeToday } from "../../utility/store-display";

type DrawerType = "edit" | "hours" | "tables" | null;

const SEATER_NAMES: Record<number, string> = { 1: "single seat", 2: "two-seater", 3: "three-seater", 4: "four-seater", 6: "six-seater", 8: "eight-seater" };

const tableGroups = (tables: StoreTableType[]) => {
    const bySeats = new Map<number, number>();
    for (const table of tables) bySeats.set(table.seats, (bySeats.get(table.seats) ?? 0) + 1);
    return [...bySeats.entries()].sort(([a], [b]) => a - b).map(([seats, count]) => ({
        label: `${count} × ${SEATER_NAMES[seats] ?? `${seats}-seater`}`,
        seats: seats * count,
    }));
};

const areaSummary = (tables: StoreTableType[]) => {
    const byArea = new Map<string, number>();
    for (const table of tables) {
        const area = table.area.trim() || "Main room";
        byArea.set(area, (byArea.get(area) ?? 0) + table.seats);
    }
    return byArea.size > 1 || tables.some(table => table.area.trim())
        ? [...byArea.entries()].map(([area, seats]) => `${area} ${seats}`).join(" · ")
        : null;
};

const euro = (cents: number) => `€${(cents / 100).toFixed(2).replace(".", ",").replace(",00", "")}`;

const policyRows = (store: StoreType) => {
    const hasDeposit = store.depositPerGuestCents > 0;
    return [
        { label: "Booking window", value: `Up to ${store.bookingWindowDays} days ahead · at least ${store.minNoticeHours} h before` },
        { label: "Deposit", value: hasDeposit ? `${euro(store.depositPerGuestCents)} per guest${store.depositMinParty ? ` for parties of ${store.depositMinParty}+` : ""}` : "None" },
        { label: "Cancellation", value: `Free until ${store.cancellationHours} h before${hasDeposit ? "; deposit kept after" : ""}` },
        { label: "Grace period", value: `${store.gracePeriodMinutes} min, then table released` },
    ];
};

const buildDetails = (store: StoreType) => {
    const today = storeToday(store);
    const todayWeekday = weekdayOf(today);
    const horizon = addDays(today, 13);
    const upcomingClosures = store.closures.filter(closure => closure.date <= horizon);
    const nextClosure = store.closures[0];

    return {
        chip: storeStatusChip(store, "details"),
        week: WEEKDAYS.map((day, weekday) => ({
            ...day,
            shifts: store.hours.filter(shift => shift.weekday === weekday).map(formatShift),
            isToday: weekday === todayWeekday,
        })),
        seats: seatCount(store),
        tableGroups: tableGroups(store.tables),
        areas: areaSummary(store.tables),
        policy: policyRows(store),
        addressLines: [
            store.address,
            [store.postcode, store.city].filter(Boolean).join(" "),
            [store.region, store.country].filter(Boolean).join(", "),
        ].filter(Boolean),
        websiteHref: store.website ? (/^https?:\/\//.test(store.website) ? store.website : `https://${store.website}`) : null,
        openedLabel: store.openedOn ? formatDayMonthYear(store.openedOn) : null,
        menuSummary: store.menuItemCount
            ? `${store.menuGroupCount} ${store.menuGroupCount === 1 ? "section" : "sections"} · ${store.menuItemCount} ${store.menuItemCount === 1 ? "dish" : "dishes"}${store.menuUpdatedAt ? ` · updated ${formatTimestampDate(store.menuUpdatedAt)}` : ""}`
            : "No dishes yet",
        availabilitySummary: `Next 14 days · ${upcomingClosures.length} blocked ${upcomingClosures.length === 1 ? "date" : "dates"}${nextClosure ? ` · ${formatDayMonthYear(nextClosure.date)} closed` : ""}`,
    };
};

const useStoreDetailsPageController = () => {
    const { storeId = "" } = useParams();
    const { store, isLoading, error, applyStore } = useStore(storeId);
    const [drawer, setDrawer] = useState<DrawerType>(null);

    return {
        store,
        details: store ? buildDetails(store) : null,
        isLoading,
        error,
        drawer,
        setDrawer,
        applyStore,
    };
};

export default useStoreDetailsPageController;
