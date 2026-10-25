import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useParams } from "react-router";
import useStore from "../../hooks/use-store";
import { getMenu, reorderMenuGroups } from "../../api/menu-api";
import { queryKeys } from "../../api/query-keys";
import type { MenuType } from "../../api/types";
import { useSnackBar } from "../../components/snack-bar/snack-bar-context";
import { errorMessage } from "../../utility/validation";

export type MenuDrawerType =
    | { type: "item", itemId: string | null, groupId: string }
    | { type: "group", groupId: string | null }
    | null;

const useStoreMenuPageController = () => {
    const { storeId = "" } = useParams();
    const { store, uid } = useStore(storeId);
    const queryClient = useQueryClient();
    const { addSnackBar } = useSnackBar();
    const [drawer, setDrawer] = useState<MenuDrawerType>(null);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [previewOrder, setPreviewOrder] = useState<string[] | null>(null);

    const menuKey = queryKeys.menu(uid, storeId);
    const { data: menu, isLoading, error } = useQuery({
        queryKey: menuKey,
        queryFn: () => getMenu(storeId),
        enabled: !!uid && !!storeId,
    });

    const refresh = () => {
        queryClient.invalidateQueries({ queryKey: menuKey });
        queryClient.invalidateQueries({ queryKey: queryKeys.store(uid, storeId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(uid) });
    };

    const { mutate: saveOrder } = useMutation({
        mutationFn: reorderMenuGroups,
        onMutate: ({ groupIds }) => {
            const previous = queryClient.getQueryData<MenuType>(menuKey);
            if (previous) {
                queryClient.setQueryData<MenuType>(menuKey, {
                    ...previous,
                    groups: groupIds.map(id => previous.groups.find(group => group.id === id)!).filter(Boolean),
                });
            }
            return { previous };
        },
        onError: (mutationError, _variables, context) => {
            if (context?.previous) queryClient.setQueryData(menuKey, context.previous);
            addSnackBar(errorMessage(mutationError), { variant: "error" });
        },
        onSettled: refresh,
    });

    const groups = menu?.groups ?? [];
    const orderedGroups = previewOrder
        ? previewOrder.map(id => groups.find(group => group.id === id)!).filter(Boolean)
        : groups;

    const moveGroup = (order: string[], id: string, toIndex: number) => {
        const without = order.filter(entry => entry !== id);
        without.splice(Math.max(0, Math.min(toIndex, without.length)), 0, id);
        return without;
    };

    const commitOrder = (order: string[]) => {
        if (order.join() !== groups.map(group => group.id).join()) saveOrder({ storeId, groupIds: order });
    };

    const drag = {
        draggingId,
        start: (id: string) => {
            setDraggingId(id);
            setPreviewOrder(groups.map(group => group.id));
        },
        over: (targetId: string) => {
            if (!draggingId || !previewOrder || targetId === draggingId) return;
            setPreviewOrder(moveGroup(previewOrder, draggingId, previewOrder.indexOf(targetId)));
        },
        end: () => {
            if (previewOrder) commitOrder(previewOrder);
            setDraggingId(null);
            setPreviewOrder(null);
        },
        // Keyboard alternative to dragging: arrow keys on the handle.
        nudge: (id: string, direction: -1 | 1) => {
            const order = groups.map(group => group.id);
            const index = order.indexOf(id);
            if (index + direction < 0 || index + direction >= order.length) return;
            commitOrder(moveGroup(order, id, index + direction));
        },
    };

    const items = groups.flatMap(group => group.items);
    const allergenCount = items.filter(item => item.components.some(component => component.allergen)).length;
    const soldOutCount = items.filter(item => !item.available).length;

    return {
        storeId,
        store,
        menu,
        isLoading,
        error,
        groups: orderedGroups,
        allergenCount,
        soldOutCount,
        drawer,
        setDrawer,
        drag,
        refresh,
    };
};

export default useStoreMenuPageController;
