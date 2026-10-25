export const queryKeys = {
    organisation: (uid?: string) => ["organisation", uid] as const,
    account: (uid?: string) => ["account", uid] as const,
    stores: (uid?: string) => ["stores", uid] as const,
    store: (uid: string | undefined, id: string) => ["stores", uid, id] as const,
    menu: (uid: string | undefined, storeId: string) => ["menu", uid, storeId] as const,
    reservations: (uid: string | undefined, storeId: string, from?: string, to?: string) =>
        ["reservations", uid, storeId, from, to].filter(part => part !== undefined),
    dashboard: (uid?: string) => ["dashboard", uid] as const,
};
