import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import Drawer from "../../components/admin-ui/drawer";
import Field from "../../components/admin-ui/field";
import Switch from "../../components/admin-ui/switch";
import { addMenuItem, deleteMenuItem, updateMenuItem } from "../../api/menu-api";
import type { MenuGroupType, MenuItemType } from "../../api/types";
import { errorMessage } from "../../utility/validation";
import { useSnackBar } from "../../components/snack-bar/snack-bar-context";

// Past this many components the list scrolls and the allergen filter appears.
const LONG_LIST = 8;

type ComponentRowType = { key: number, name: string, allergen: boolean };

type MenuItemDrawerPropType = {
    storeId: string;
    storeName: string;
    groups: MenuGroupType[];
    groupId: string;
    item: MenuItemType | null;
    onClose: () => void;
    onSaved: () => void;
};

const parsePrice = (value: string) => {
    const normalised = value.trim().replace(",", ".");
    return /^\d+(\.\d{1,2})?$/.test(normalised) ? Number(normalised) : null;
};

const MenuItemDrawer = ({ storeId, storeName, groups, groupId: initialGroupId, item, onClose, onSaved }: MenuItemDrawerPropType) => {
    const { addSnackBar } = useSnackBar();
    const nextKey = useRef(0);
    const listRef = useRef<HTMLOListElement>(null);

    const [name, setName] = useState<string>(item?.name ?? "");
    const [price, setPrice] = useState<string>(item ? item.price.toFixed(2).replace(".", ",") : "");
    const [description, setDescription] = useState<string>(item?.description ?? "");
    const [groupId, setGroupId] = useState<string>(item?.groupId ?? initialGroupId);
    const [available, setAvailable] = useState<boolean>(item?.available ?? true);
    const [components, setComponents] = useState<ComponentRowType[]>(() =>
        (item?.components ?? []).map((component, index) => ({ key: index, ...component })));
    const [allergensOnly, setAllergensOnly] = useState<boolean>(false);
    const [errors, setErrors] = useState<{ name?: string, price?: string, form?: string }>({});
    const [isConfirmingDelete, setIsConfirmingDelete] = useState<boolean>(false);

    const groupName = groups.find(group => group.id === groupId)?.name ?? "";

    const done = (message: string) => {
        addSnackBar(message);
        onSaved();
        onClose();
    };

    const onError = (error: unknown) => setErrors({ form: errorMessage(error) });
    const { mutate: create, isPending: isCreating } = useMutation({ mutationFn: addMenuItem, onSuccess: (created) => done(`${created.name} added.`), onError });
    const { mutate: update, isPending: isUpdating } = useMutation({ mutationFn: updateMenuItem, onSuccess: () => done("Item saved."), onError });
    const { mutate: remove, isPending: isDeleting } = useMutation({ mutationFn: deleteMenuItem, onSuccess: () => done(`${item?.name} deleted.`), onError });

    const allergenTotal = components.filter(component => component.allergen).length;
    const isLong = components.length > LONG_LIST;
    const filterOn = isLong && allergensOnly;
    const visible = components.map((component, index) => ({ ...component, index })).filter(component => !filterOn || component.allergen);

    const updateComponent = (key: number, patch: Partial<ComponentRowType>) =>
        setComponents(current => current.map(component => component.key === key ? { ...component, ...patch } : component));

    const addComponent = () => {
        setAllergensOnly(false);
        setComponents(current => {
            nextKey.current = Math.max(nextKey.current, current.length) + 1;
            return [...current, { key: nextKey.current, name: "", allergen: false }];
        });
        requestAnimationFrame(() => {
            const inputs = listRef.current?.querySelectorAll("input");
            const last = inputs?.[inputs.length - 1];
            last?.focus();
            last?.scrollIntoView({ block: "nearest" });
        });
    };

    const submit = () => {
        const parsedPrice = parsePrice(price);
        const nextErrors: typeof errors = {};
        if (!name.trim()) nextErrors.name = "Required";
        if (parsedPrice === null) nextErrors.price = "Price like 19,50";
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) return;

        const values = {
            groupId,
            name: name.trim(),
            description: description.trim(),
            price: parsedPrice!,
            available,
            components: components.filter(component => component.name.trim())
                .map(component => ({ name: component.name.trim(), allergen: component.allergen })),
        };
        if (item) update({ storeId, itemId: item.id, values });
        else create({ storeId, values });
    };

    return (
        <Drawer
            title={item ? "Edit item" : "New item"}
            subtitle={`${groupName} · ${storeName}`}
            onClose={onClose}
            onSubmit={submit}
            footer={isConfirmingDelete && item
                ? <>
                    <span className="adm-error">Delete {item.name}?</span>
                    <div className="adm-drawer-footer-end">
                        <button type="button" className="adm-btn adm-btn--outline" onClick={() => setIsConfirmingDelete(false)}>Keep</button>
                        <button type="button" className="adm-btn adm-btn--danger" disabled={isDeleting} onClick={() => remove({ storeId, itemId: item.id })}>Delete item</button>
                    </div>
                </>
                : <>
                    {item && <button type="button" className="adm-btn adm-btn--danger-text" onClick={() => setIsConfirmingDelete(true)}>Delete item</button>}
                    <div className="adm-drawer-footer-end">
                        <button type="button" className="adm-btn adm-btn--outline" onClick={onClose}>Cancel</button>
                        <button type="submit" className="adm-btn adm-btn--primary" disabled={isCreating || isUpdating}>{item ? "Save changes" : "Add item"}</button>
                    </div>
                </>}
        >
            {errors.form && <p className="adm-form-error" role="alert">{errors.form}</p>}

            <div className="menu-item-name-price">
                <Field label="Name" htmlFor="mi-name" required error={errors.name}>
                    <input id="mi-name" className={`adm-input ${errors.name ? "adm-input--invalid" : ""}`} value={name} maxLength={150}
                        onChange={(event) => { setName(event.target.value); setErrors(current => ({ ...current, name: undefined })); }} />
                </Field>
                <Field label="Price" htmlFor="mi-price" required error={errors.price} hint="Incl. VAT">
                    <div className="menu-price-field">
                        <span aria-hidden="true">€</span>
                        <input id="mi-price" inputMode="decimal" className={`adm-input adm-tabular ${errors.price ? "adm-input--invalid" : ""}`} value={price}
                            onChange={(event) => { setPrice(event.target.value); setErrors(current => ({ ...current, price: undefined })); }} />
                    </div>
                </Field>
            </div>

            <Field label="Description" htmlFor="mi-desc" optional="Optional">
                <textarea id="mi-desc" className="adm-input" rows={3} maxLength={1000} value={description}
                    placeholder="Shown under the name on the guest menu" onChange={(event) => setDescription(event.target.value)} />
            </Field>

            <div className="adm-form-grid">
                <Field label="Group" htmlFor="mi-group">
                    <select id="mi-group" className="adm-input" value={groupId} onChange={(event) => setGroupId(event.target.value)}>
                        {groups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}
                    </select>
                </Field>
                <div className="adm-field">
                    <span className="adm-label">Availability</span>
                    <label className="menu-item-available">
                        <Switch checked={available} label="Available to order" onChange={setAvailable} />
                        <span>{available ? "On the menu" : "Sold out — hidden from diners"}</span>
                    </label>
                </div>
            </div>

            <fieldset className="adm-form-section menu-components">
                <div className="menu-components-head">
                    <legend className="menu-components-legend">
                        <span className="adm-form-section-title">Components</span>
                        <span className="adm-muted">
                            {components.length
                                ? `${components.length} ${components.length === 1 ? "component" : "components"} · ${allergenTotal} marked as ${allergenTotal === 1 ? "allergen" : "allergens"}`
                                : "Ingredients diners may ask about"}
                        </span>
                    </legend>
                    {isLong &&
                        <button type="button" role="switch" aria-checked={filterOn} className={`menu-components-filter ${filterOn ? "is-on" : ""}`} onClick={() => setAllergensOnly(on => !on)}>
                            <span className="menu-components-filter-mark" aria-hidden="true">!</span>Allergens only
                        </button>}
                </div>

                {visible.length > 0 &&
                    <div className={`menu-components-box ${isLong ? "is-long" : ""}`}>
                        <ol ref={listRef} className="menu-components-list">
                            {visible.map(component => (
                                <li key={component.key} className="menu-component">
                                    <span className="adm-small adm-muted adm-tabular menu-component-number" aria-hidden="true">{component.index + 1}</span>
                                    <input
                                        className="adm-input menu-component-name"
                                        value={component.name}
                                        maxLength={100}
                                        aria-label={`Component ${component.index + 1} name`}
                                        onChange={(event) => updateComponent(component.key, { name: event.target.value })}
                                    />
                                    <span className={`menu-component-allergen ${component.allergen ? "is-on" : ""}`}>
                                        <span className="adm-small">Allergen</span>
                                        <Switch
                                            checked={component.allergen}
                                            tone="warning"
                                            label={`${component.name || `Component ${component.index + 1}`} is an allergen`}
                                            onChange={(allergen) => updateComponent(component.key, { allergen })}
                                        />
                                    </span>
                                    <button
                                        type="button"
                                        className="adm-icon-btn adm-icon-btn--danger menu-component-remove"
                                        aria-label={`Remove ${component.name || `component ${component.index + 1}`}`}
                                        onClick={() => setComponents(current => current.filter(entry => entry.key !== component.key))}
                                    >×</button>
                                </li>
                            ))}
                        </ol>
                        {isLong && <div className="menu-components-fade" aria-hidden="true" />}
                    </div>}
                {components.length > 0 && visible.length === 0 && <p className="adm-empty">No components are marked as allergens.</p>}
                {components.length === 0 && <p className="adm-empty">No components yet. Add each ingredient and mark the ones that are allergens.</p>}

                <button type="button" className="adm-btn adm-btn--dashed" onClick={addComponent}>
                    <span className="adm-btn-glyph" aria-hidden="true">+</span>Add component
                </button>
                <p className="adm-muted menu-components-note">
                    Items with at least one allergen show a <span role="img" aria-label="allergen marker" className="adm-allergen-marker adm-allergen-marker--inline" /> marker on the menu.
                </p>
            </fieldset>
        </Drawer>
    );
};

export default MenuItemDrawer;
