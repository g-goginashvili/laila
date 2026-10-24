export type OrganisationType = {
    id: string;
    adminUserId: string;
    orgName: string;
    address: string;
    singleLocation: boolean;
};

export type StoreType = {
    id: string;
    adminUserId: string;
    organisationId: string;
    storeName: string;
    storeManager: string;
    address: string;
    email: string;
    phoneNumber: string;
};

export type StoreValuesType = Pick<StoreType, "storeName" | "storeManager" | "address" | "email" | "phoneNumber">;
