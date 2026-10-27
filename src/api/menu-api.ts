import { http } from "../utility/http-client"
import type { MenuGroupType, MenuItemInputType, MenuItemType, MenuType } from "./types";

const menuPath = (storeId: string) => `/admin/stores/${encodeURIComponent(storeId)}/menu`;

export const getMenu = async (storeId: string) => {
    return await http.get<MenuType>(menuPath(storeId));
};

export const addMenuGroup = async ({ storeId, name }: { storeId: string, name: string }) => {
    return await http.post<Omit<MenuGroupType, "items">>(`${menuPath(storeId)}/groups`, { name });
};

export const renameMenuGroup = async ({ storeId, groupId, name }: { storeId: string, groupId: string, name: string }) => {
    return await http.patch<Omit<MenuGroupType, "items">>(`${menuPath(storeId)}/groups/${encodeURIComponent(groupId)}`, { name });
};

export const deleteMenuGroup = async ({ storeId, groupId }: { storeId: string, groupId: string }) => {
    return await http.delete<{ id: string }>(`${menuPath(storeId)}/groups/${encodeURIComponent(groupId)}`);
};

export const reorderMenuGroups = async ({ storeId, groupIds }: { storeId: string, groupIds: string[] }) => {
    return await http.put<MenuType>(`${menuPath(storeId)}/groups/order`, { groupIds });
};

export const addMenuItem = async ({ storeId, values }: { storeId: string, values: MenuItemInputType }) => {
    return await http.post<MenuItemType>(`${menuPath(storeId)}/items`, values);
};

export const updateMenuItem = async ({ storeId, itemId, values }: { storeId: string, itemId: string, values: Partial<MenuItemInputType> }) => {
    return await http.patch<MenuItemType>(`${menuPath(storeId)}/items/${encodeURIComponent(itemId)}`, values);
};

export const deleteMenuItem = async ({ storeId, itemId }: { storeId: string, itemId: string }) => {
    return await http.delete<{ id: string }>(`${menuPath(storeId)}/items/${encodeURIComponent(itemId)}`);
};
