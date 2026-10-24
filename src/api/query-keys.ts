export const queryKeys = {
    organisation: (uid?: string) => ["organisation", uid] as const,
    stores: (uid?: string) => ["stores", uid] as const,
    store: (uid: string | undefined, id: string) => ["stores", uid, id] as const,
};
