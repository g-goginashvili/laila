import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import Drawer from "../../components/admin-ui/drawer";
import Field from "../../components/admin-ui/field";
import { addMenuGroup, deleteMenuGroup, renameMenuGroup } from "../../api/menu-api";
import type { MenuGroupType } from "../../api/types";
import { errorMessage } from "../../utility/validation";
import { useSnackBar } from "../../components/snack-bar/snack-bar-context";

type MenuGroupDrawerPropType = {
    storeId: string;
    storeName: string;
    group: MenuGroupType | null;
    onClose: () => void;
    onSaved: () => void;
};

const MenuGroupDrawer = ({ storeId, storeName, group, onClose, onSaved }: MenuGroupDrawerPropType) => {
    const { addSnackBar } = useSnackBar();
    const [name, setName] = useState<string>(group?.name ?? "");
    const [error, setError] = useState<string>("");
    const [isConfirmingDelete, setIsConfirmingDelete] = useState<boolean>(false);

    const done = (message: string) => {
        addSnackBar(message);
        onSaved();
        onClose();
    };

    const { mutate: create, isPending: isCreating } = useMutation({
        mutationFn: addMenuGroup,
        onSuccess: (created) => done(`${created.name} added.`),
        onError: (mutationError) => setError(errorMessage(mutationError)),
    });
    const { mutate: rename, isPending: isRenaming } = useMutation({
        mutationFn: renameMenuGroup,
        onSuccess: () => done("Group renamed."),
        onError: (mutationError) => setError(errorMessage(mutationError)),
    });
    const { mutate: remove, isPending: isDeleting } = useMutation({
        mutationFn: deleteMenuGroup,
        onSuccess: () => done(`${group?.name} deleted.`),
        onError: (mutationError) => setError(errorMessage(mutationError)),
    });

    const submit = () => {
        const trimmed = name.trim();
        if (!trimmed) return setError("Give the group a name.");
        if (trimmed.length > 100) return setError("At most 100 characters.");
        if (group) rename({ storeId, groupId: group.id, name: trimmed });
        else create({ storeId, name: trimmed });
    };

    const itemCount = group?.items.length ?? 0;

    return (
        <Drawer
            title={group ? "Edit group" : "New group"}
            subtitle={storeName}
            onClose={onClose}
            onSubmit={submit}
            footer={isConfirmingDelete && group
                ? <>
                    <span className="adm-error">Delete {group.name}{itemCount ? ` and its ${itemCount} ${itemCount === 1 ? "item" : "items"}` : ""}?</span>
                    <div className="adm-drawer-footer-end">
                        <button type="button" className="adm-btn adm-btn--outline" onClick={() => setIsConfirmingDelete(false)}>Keep</button>
                        <button type="button" className="adm-btn adm-btn--danger" disabled={isDeleting} onClick={() => remove({ storeId, groupId: group.id })}>Delete group</button>
                    </div>
                </>
                : <>
                    {group && <button type="button" className="adm-btn adm-btn--danger-text" onClick={() => setIsConfirmingDelete(true)}>Delete group</button>}
                    <div className="adm-drawer-footer-end">
                        <button type="button" className="adm-btn adm-btn--outline" onClick={onClose}>Cancel</button>
                        <button type="submit" className="adm-btn adm-btn--primary" disabled={isCreating || isRenaming}>{group ? "Save changes" : "Add group"}</button>
                    </div>
                </>}
        >
            <Field label="Group name" htmlFor="mg-name" required error={error} hint="For example Starters, Mains, Desserts or Wine list.">
                <input
                    id="mg-name"
                    className={`adm-input ${error ? "adm-input--invalid" : ""}`}
                    value={name}
                    maxLength={100}
                    onChange={(event) => { setName(event.target.value); setError(""); }}
                />
            </Field>
        </Drawer>
    );
};

export default MenuGroupDrawer;
