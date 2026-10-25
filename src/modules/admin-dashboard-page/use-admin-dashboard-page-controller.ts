import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import useAuth from "../../hooks/use-auth";
import { getDashboard } from "../../api/dashboard-api";
import { queryKeys } from "../../api/query-keys";
import type { DashboardAttentionType, DashboardStoreDayType, DashboardStoreType } from "../../api/types";
import { formatDayLabel, formatLongDate, formatMinutes, formatShortDate } from "../../utility/service-time";
import { SLOT_MINUTES } from "../../utility/availability";

const REFRESH_MS = 60_000;
const NEARLY_FULL_SEATS = 12;
const BUSY_PERCENT = 85;

const sum = <T,>(items: T[], pick: (item: T) => number) => items.reduce((total, item) => total + pick(item), 0);
const percent = (part: number, whole: number) => whole > 0 ? (part / whole) * 100 : 0;

const formatPercent = (value: number, digits = 0) => `${value.toFixed(digits)}%`;
const formatSignedPoints = (value: number, digits = 0) => {
    const rounded = Number(value.toFixed(digits));
    return `${rounded > 0 ? "+" : rounded < 0 ? "−" : "±"}${Math.abs(rounded).toFixed(digits)} pt`;
};

const actionFor = (item: DashboardAttentionType) => {
    switch (item.action.type) {
        case "call": return { label: `Call ${item.action.phone}`, href: `tel:${item.action.phone.replace(/[^+\d]/g, "")}`, external: true };
        case "availability": return { label: "Open availability", href: `/stores/${item.storeId}/availability?date=${item.action.date}`, external: false };
        case "menu": return { label: "Edit menu", href: `/stores/${item.storeId}/menu`, external: false };
        case "details": return { label: "Edit store", href: `/stores/${item.storeId}/details`, external: false };
    }
};

const sumDays = (stores: DashboardStoreType[], from: number, to: number) => {
    const days: DashboardStoreDayType[] = [];
    const length = stores[0]?.history.length ?? 0;
    for (let index = 0; index < length; index++) {
        if (index < from || index >= to) continue;
        days.push({
            date: stores[0]!.history[index]!.date,
            covers: sum(stores, store => store.history[index]?.covers ?? 0),
            capacity: sum(stores, store => store.history[index]?.capacity ?? 0),
            bookings: sum(stores, store => store.history[index]?.bookings ?? 0),
            noShows: sum(stores, store => store.history[index]?.noShows ?? 0),
            cancellations: sum(stores, store => store.history[index]?.cancellations ?? 0),
        });
    }
    return days;
};

const useAdminDashboardPageController = () => {
    const user = useAuth((state) => state.user);
    const [searchParams, setSearchParams] = useSearchParams();

    const { data, isLoading, error } = useQuery({
        queryKey: queryKeys.dashboard(user?.uid),
        queryFn: getDashboard,
        enabled: !!user,
        refetchInterval: REFRESH_MS,
    });

    const allStores = data?.stores ?? [];
    const requestedScope = searchParams.get("store") ?? "all";
    const current = allStores.find(store => store.id === requestedScope);
    const scope = current ? current.id : "all";
    const isAll = scope === "all";
    const inScope = current ? [current] : allStores;
    const setScope = (value: string) => setSearchParams(value === "all" ? {} : { store: value }, { replace: true });

    const now = current?.now ?? data?.now;
    const openStores = inScope.filter(store => store.isOpenToday);
    const hasLiveStore = allStores.some(store => store.status === "open");

    const covers = sum(inScope, store => store.coversToday);
    const seatedTables = sum(inScope, store => store.seatedTables);
    const capacity = sum(inScope, store => store.capacityToday);
    const occupancy = Math.round(percent(covers, capacity));
    const servingStores = openStores.filter(store => !store.isServiceOver);
    const isServiceOver = openStores.length > 0 && servingStores.length === 0;
    const seatsLeft = sum(servingStores, store => store.seatsLeft);
    const nearlyFull = servingStores.filter(store => store.seatsLeft <= NEARLY_FULL_SEATS).length;
    const fromSlot = now ? formatMinutes(Math.ceil(now.minutes / SLOT_MINUTES) * SLOT_MINUTES) : "";

    const nextFreeLabel = (store: DashboardStoreType) => store.nextFree
        ? `${store.nextFree.isNow ? "Now" : formatMinutes(store.nextFree.minutes)} · ${store.nextFree.tableLabel} (${store.nextFree.seats})`
        : "—";

    const attention = (data?.attention ?? [])
        .filter(item => isAll || item.storeId === scope)
        .map(item => ({ ...item, action: actionFor(item) }));
    const urgentCount = attention.filter(item => item.kind === "error").length;

    const storeName = (id: string) => allStores.find(store => store.id === id)?.storeName ?? "";
    const arrivals = (data?.arrivals ?? [])
        .filter(reservation => isAll || reservation.storeId === scope)
        .slice(0, 6)
        .map(reservation => ({
            ...reservation,
            time: formatMinutes(reservation.startMinutes),
            meta: [isAll ? storeName(reservation.storeId) : null, reservation.tableLabel, reservation.notes.slice(0, 40) || null]
                .filter(Boolean).join(" · "),
        }));
    const arrivalsStoreId = current?.id ?? arrivals[0]?.storeId ?? openStores[0]?.id ?? allStores[0]?.id;

    const storeRows = [...allStores]
        .sort((a, b) => Number(!a.isOpenToday) - Number(!b.isOpenToday) || a.seatsLeft - b.seatsLeft)
        .map(store => {
            const pct = Math.round(percent(store.coversToday, store.capacityToday));
            const closedNote = store.status === "draft" ? "Draft — not live"
                : store.status === "temporarily_closed" ? `Temporarily closed${store.reopensOn ? ` until ${formatShortDate(store.reopensOn).slice(0, -5)}` : ""}`
                : "Closed today";
            return {
                ...store,
                pct,
                subtitle: store.isOpenToday ? store.city : closedNote,
                isBusy: pct >= BUSY_PERCENT,
                isServing: store.isOpenToday && !store.isServiceOver,
                isNearlyFull: store.isOpenToday && !store.isServiceOver && store.seatsLeft <= NEARLY_FULL_SEATS,
                nextFreeLabel: !store.isOpenToday ? "—" : store.isServiceOver ? "Service ended" : nextFreeLabel(store),
            };
        });

    const historyLength = inScope[0]?.history.length ?? 0;
    const week = sumDays(inScope, historyLength - 7, historyLength);
    const previousWeek = sumDays(inScope, historyLength - 14, historyLength - 7);
    const chartMax = Math.max(1, ...week.map(day => Math.max(day.covers, day.capacity)));
    const bars = week.map((day, index) => ({
        ...day,
        label: formatDayLabel(day.date),
        isToday: index === week.length - 1,
        heightPct: (day.covers / chartMax) * 100,
        capacityPct: (day.capacity / chartMax) * 100,
    }));

    const totals = (days: DashboardStoreDayType[]) => ({
        covers: sum(days, day => day.covers),
        capacity: sum(days, day => day.capacity),
        bookings: sum(days, day => day.bookings),
        noShows: sum(days, day => day.noShows),
        cancellations: sum(days, day => day.cancellations),
    });
    const thisWeek = totals(week);
    const lastWeek = totals(previousWeek);
    const occupancyNow = percent(thisWeek.covers, thisWeek.capacity);
    const occupancyBefore = percent(lastWeek.covers, lastWeek.capacity);
    const noShowRate = percent(thisWeek.noShows, thisWeek.bookings - thisWeek.cancellations);
    const noShowBefore = percent(lastWeek.noShows, lastWeek.bookings - lastWeek.cancellations);
    const coversChange = percent(thisWeek.covers - lastWeek.covers, lastWeek.covers);

    const metrics = [
        { label: "Occupancy", value: formatPercent(occupancyNow), delta: `${formatSignedPoints(occupancyNow - occupancyBefore)} vs previous week`, good: occupancyNow >= occupancyBefore },
        { label: "No-show rate", value: formatPercent(noShowRate, 1), delta: `${formatSignedPoints(noShowRate - noShowBefore, 1)} · ${thisWeek.noShows} ${thisWeek.noShows === 1 ? "party" : "parties"}`, good: noShowRate <= noShowBefore },
        { label: "Cancellations", value: String(thisWeek.cancellations), delta: `${formatPercent(percent(thisWeek.cancellations, thisWeek.bookings), 1)} of bookings · ${thisWeek.cancellations - lastWeek.cancellations >= 0 ? "+" : "−"}${Math.abs(thisWeek.cancellations - lastWeek.cancellations)}`, good: thisWeek.cancellations <= lastWeek.cancellations },
        { label: "Covers", value: thisWeek.covers.toLocaleString("en-GB"), delta: lastWeek.covers ? `${coversChange >= 0 ? "+" : "−"}${Math.abs(Math.round(coversChange))}% vs previous week` : "No bookings the week before", good: thisWeek.covers >= lastWeek.covers },
    ];

    const setupSteps = [
        { title: "Add a store", body: "Name, address, phone and opening hours. Takes two minutes.", done: allStores.length > 0 },
        { title: "Set tables and capacity", body: "How many tables, how many seats, how long a party keeps one.", done: allStores.some(store => store.tableCount > 0) },
        { title: "Publish the menu and go live", body: "Switch the store to “Accepting reservations”. Diners can book from that moment.", done: hasLiveStore },
    ];
    const firstStoreId = allStores[0]?.id;

    return {
        isLoading,
        error,
        orgName: data?.organisation.orgName ?? "",
        firstName: user?.displayName?.split(" ")[0] ?? "",
        hasLiveStore,
        setupSteps,
        firstStoreId,
        allStores,
        current,
        isAll,
        scope,
        setScope,
        headline: now ? formatLongDate(now.date) : "",
        nowLabel: now ? formatMinutes(now.minutes) : "",
        subtitle: current
            ? [current.storeName, current.city, `${current.seats} seats`].filter(Boolean).join(" · ")
            : `${data?.organisation.orgName ?? ""} · ${allStores.length} ${allStores.length === 1 ? "store" : "stores"} · ${openStores.length} open tonight`,
        tiles: {
            covers, capacity, occupancy,
            seatsLeft,
            fromSlot: isServiceOver ? "" : fromSlot,
            seatsLeftLabel: openStores.length === 0 ? "No store is taking bookings today"
                : isServiceOver ? "Service has ended for today"
                : isAll ? `Across ${servingStores.length} open ${servingStores.length === 1 ? "store" : "stores"} · ${nearlyFull} nearly full`
                : seatsLeft <= NEARLY_FULL_SEATS ? "Nearly full — consider closing online bookings"
                : `Next free table ${current ? nextFreeLabel(current) : ""}`,
            seatsLeftUrgent: servingStores.length > 0 && seatsLeft <= NEARLY_FULL_SEATS,
            seatedCovers: sum(inScope, store => store.seatedCovers),
            seatedLabel: `${seatedTables} ${seatedTables === 1 ? "table" : "tables"} in service${isAll ? ` · ${openStores.length} ${openStores.length === 1 ? "store" : "stores"}` : ""}`,
            attentionCount: attention.length,
            urgentCount,
        },
        attention,
        arrivals,
        arrivalsStoreId,
        arrivalsStoreName: arrivalsStoreId ? storeName(arrivalsStoreId) : "",
        storeRows,
        weekLabel: week.length ? `Last 7 days · ${formatDayLabel(week[0]!.date)} – ${formatDayLabel(week[week.length - 1]!.date)}` : "Last 7 days",
        bars,
        metrics,
    };
};

export default useAdminDashboardPageController;
