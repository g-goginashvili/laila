import * as Yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import Drawer from "../../components/admin-ui/drawer";
import Field from "../../components/admin-ui/field";
import useFormState from "../../components/admin-ui/use-form-state";
import { addStore } from "../../api/stores-api";
import { queryKeys } from "../../api/query-keys";
import useAuth from "../../hooks/use-auth";
import { useSnackBar } from "../../components/snack-bar/snack-bar-context";
import { emailRule, errorMessage, phoneNumberRule, requiredText } from "../../utility/validation";

const NewStoreSchema = Yup.object({
    storeName: requiredText(255),
    storeManager: requiredText(255),
    email: emailRule,
    phoneNumber: phoneNumberRule,
    address: requiredText(200),
    postcode: Yup.string().trim().max(20, "At most 20 characters"),
    city: Yup.string().trim().max(100, "At most 100 characters"),
});

const NewStoreDrawer = ({ onClose }: { onClose: () => void }) => {
    const uid = useAuth((state) => state.user?.uid);
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { addSnackBar } = useSnackBar();

    const { values, errors, setField, validate, setFormError } = useFormState({
        storeName: "", storeManager: "", email: "", phoneNumber: "", address: "", postcode: "", city: "",
    }, NewStoreSchema);

    const { mutate, isPending } = useMutation({
        mutationFn: addStore,
        onSuccess: (store) => {
            addSnackBar(`${store.storeName} added as a draft.`);
            queryClient.invalidateQueries({ queryKey: queryKeys.stores(uid) });
            queryClient.invalidateQueries({ queryKey: queryKeys.organisation(uid) });
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(uid) });
            navigate(`/stores/${store.id}/details`);
        },
        onError: (error) => setFormError(errorMessage(error)),
    });

    const submit = () => {
        if (!validate()) return;
        mutate(Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim()])) as typeof values);
    };

    const input = (key: keyof typeof values, props: { type?: string, autoComplete?: string, placeholder?: string } = {}) => (
        <input
            id={`ns-${key}`}
            className={`adm-input ${errors[key] ? "adm-input--invalid" : ""}`}
            value={values[key]}
            onChange={(event) => setField(key, event.target.value)}
            aria-invalid={!!errors[key]}
            {...props}
        />
    );

    return (
        <Drawer
            title="New store"
            subtitle="Starts as a draft — hidden from diners until you open it."
            onClose={onClose}
            onSubmit={submit}
            footer={<div className="adm-drawer-footer-end">
                <button type="button" className="adm-btn adm-btn--outline" onClick={onClose}>Cancel</button>
                <button type="submit" className="adm-btn adm-btn--primary" disabled={isPending}>{isPending ? "Adding…" : "Add store"}</button>
            </div>}
        >
            {errors.form && <p className="adm-form-error" role="alert">{errors.form}</p>}
            <section className="adm-form-section">
                <h3 className="adm-form-section-title">Store</h3>
                <Field label="Store name" htmlFor="ns-storeName" required error={errors.storeName}>{input("storeName")}</Field>
                <Field label="Manager" htmlFor="ns-storeManager" required error={errors.storeManager}>{input("storeManager", { autoComplete: "name" })}</Field>
                <div className="adm-form-grid">
                    <Field label="Reservations email" htmlFor="ns-email" required error={errors.email}>{input("email", { type: "email", autoComplete: "email" })}</Field>
                    <Field label="Phone" htmlFor="ns-phoneNumber" required error={errors.phoneNumber}>{input("phoneNumber", { type: "tel", autoComplete: "tel", placeholder: "+302103614022" })}</Field>
                </div>
            </section>
            <section className="adm-form-section">
                <h3 className="adm-form-section-title">Address</h3>
                <Field label="Street" htmlFor="ns-address" required error={errors.address}>{input("address", { autoComplete: "address-line1" })}</Field>
                <div className="adm-form-grid adm-form-grid--narrow">
                    <Field label="Postcode" htmlFor="ns-postcode" error={errors.postcode}>{input("postcode", { autoComplete: "postal-code" })}</Field>
                    <Field label="City" htmlFor="ns-city" error={errors.city}>{input("city", { autoComplete: "address-level2" })}</Field>
                </div>
            </section>
            <p className="adm-hint">Opening hours, tables and the menu are set up from the store’s page after it’s created.</p>
        </Drawer>
    );
};

export default NewStoreDrawer;
