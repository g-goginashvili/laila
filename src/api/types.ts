export type OrganisationType = {
    id: string;
    adminUserId: string;
    orgName: string;
    address: string;
    singleLocation: boolean;
};

export type AccountType = {
    name: string;
    surname: string;
    email: string;
    phoneNumber: string;
    role: string;
};

export type StoreStatusType = "draft" | "open" | "temporarily_closed";

export type StoreShiftType = {
    id?: string;
    weekday: number; // 0 = Monday … 6 = Sunday
    opensMinutes: number;
    closesMinutes: number; // may exceed 1440 for after-midnight closing
};

export type StoreTableType = {
    id: string;
    label: string;
    seats: number;
    area: string;
    position: number;
    // ISO timestamp while guests sit at the table; null when free. Occupied tables can't be booked.
    occupiedSince: string | null;
    // Guest of the ongoing reservation seated here; while set the table can't be freed by hand.
    ongoingGuest: string | null;
};

export type StoreClosureType = {
    id: string;
    date: string;
    note: string;
};

export type StoreType = {
    id: string;
    adminUserId: string;
    organisationId: string;
    storeName: string;
    storeManager: string;
    address: string;
    postcode: string;
    city: string;
    region: string;
    country: string;
    email: string;
    phoneNumber: string;
    website: string;
    status: StoreStatusType;
    closureNote: string;
    reopensOn: string | null;
    timezone: string;
    description: string;
    cuisine: string;
    priceRange: string;
    openedOn: string | null;
    floorAreaM2: number | null;
    minPartySize: number;
    maxPartySize: number;
    tableTimeMinutes: number;
    lunchTableTimeMinutes: number | null;
    lastSeatingMinutes: number;
    bookingWindowDays: number;
    minNoticeHours: number;
    depositPerGuestCents: number;
    depositMinParty: number | null;
    cancellationHours: number;
    gracePeriodMinutes: number;
    menuUpdatedAt: string | null;
    createdAt: string;
    hours: StoreShiftType[];
    tables: StoreTableType[];
    closures: StoreClosureType[];
    menuGroupCount: number;
    menuItemCount: number;
};

export type StoreValuesType = Pick<StoreType, "storeName" | "storeManager" | "address" | "email" | "phoneNumber">
    & Partial<Pick<StoreType, "postcode" | "city" | "region" | "country">>;

export type StoreUpdateType = Partial<Omit<StoreType,
    "id" | "adminUserId" | "organisationId" | "menuUpdatedAt" | "createdAt" | "hours" | "tables" | "closures"
    | "menuGroupCount" | "menuItemCount">>;

export type StoreTableInputType = {
    id?: string;
    label: string;
    seats: number;
    area: string;
};

export type MenuComponentType = {
    name: string;
    allergen: boolean;
};

export type MenuItemType = {
    id: string;
    groupId: string;
    name: string;
    description: string;
    price: number;
    components: MenuComponentType[];
    available: boolean;
    position: number;
    updatedAt: string;
};

export type MenuGroupType = {
    id: string;
    name: string;
    position: number;
    items: MenuItemType[];
};

export type MenuType = {
    storeId: string;
    updatedAt: string | null;
    groups: MenuGroupType[];
};

export type MenuItemInputType = {
    groupId: string;
    name: string;
    description: string;
    price: number;
    components: MenuComponentType[];
    available: boolean;
};

export type ReservationStatusType = "upcoming" | "ongoing" | "completed" | "no_show" | "cancelled";

export type ReservationType = {
    id: string;
    storeId: string;
    tableId: string | null;
    date: string;
    startMinutes: number;
    durationMinutes: number;
    partySize: number;
    guestName: string;
    phone: string;
    email: string;
    notes: string;
    status: ReservationStatusType;
    createdAt: string;
    updatedAt: string;
};

export type ReservationInputType = Pick<ReservationType,
    "tableId" | "date" | "startMinutes" | "durationMinutes" | "partySize" | "guestName" | "phone" | "email" | "notes" | "status">;

export type ServiceNowType = {
    date: string;
    minutes: number;
};

export type DashboardStoreDayType = {
    date: string;
    covers: number;
    capacity: number;
    bookings: number;
    noShows: number;
    cancellations: number;
};

export type DashboardStoreType = {
    id: string;
    storeName: string;
    city: string;
    status: StoreStatusType;
    closureNote: string;
    reopensOn: string | null;
    now: ServiceNowType;
    isOpenToday: boolean;
    isServiceOver: boolean;
    seats: number;
    tableCount: number;
    capacityToday: number;
    coversToday: number;
    seatedCovers: number;
    seatedTables: number;
    seatsLeft: number;
    nextFree: { minutes: number, isNow: boolean, tableLabel: string, seats: number } | null;
    history: DashboardStoreDayType[];
};

export type DashboardAttentionType = {
    storeId: string;
    kind: "error" | "warning" | "info";
    title: string;
    body: string;
    action:
        | { type: "call", phone: string }
        | { type: "availability", date: string }
        | { type: "details" }
        | { type: "menu" };
};

export type DashboardType = {
    organisation: { id: string, orgName: string };
    now: ServiceNowType;
    stores: DashboardStoreType[];
    attention: DashboardAttentionType[];
    arrivals: (ReservationType & { tableLabel: string | null })[];
};
