import * as Yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import Drawer from "../../components/admin-ui/drawer";
import Field from "../../components/admin-ui/field";
import DatePicker from "../../components/date-picker/date-picker";
import { serviceNow } from "../../utility/service-time";
import useFormState from "../../components/admin-ui/use-form-state";
import { deleteStore, updateStore } from "../../api/stores-api";
import type { StoreStatusType, StoreType, StoreUpdateType } from "../../api/types";
import { emailRule, errorMessage, phoneNumberRule, requiredText } from "../../utility/validation";
import { useSnackBar } from "../../components/snack-bar/snack-bar-context";

const STATUS_OPTIONS: { value: StoreStatusType, label: string, hint: string }[] = [
    { value: "open", label: "Accepting reservations", hint: "Diners can book." },
    { value: "temporarily_closed", label: "Temporarily closed", hint: "Diners see your note and can’t book." },
    { value: "draft", label: "Draft", hint: "Hidden from diners." },
];

// Mirrors the backend check, so a typo shows on the field instead of as a server error.
const isValidTimeZone = (timeZone: string) => {
    try {
        new Intl.DateTimeFormat("en", { timeZone });
        return true;
    } catch {
        return false;
    }
};

const optionalText = (max: number) => Yup.string().trim().max(max, `At most ${max} characters`);
const wholeNumber = (min: number, max: number) => Yup.string().trim().required("Required")
    .matches(/^\d+$/, "Whole number").test("range", `${min}–${max}`, value => Number(value) >= min && Number(value) <= max);
const optionalWholeNumber = (min: number, max: number) => Yup.string().trim()
    .test("range", `Whole number, ${min}–${max}`, value => !value || (/^\d+$/.test(value) && Number(value) >= min && Number(value) <= max));

const EditStoreSchema = Yup.object({
    storeName: requiredText(255),
    storeManager: requiredText(255),
    email: emailRule,
    phoneNumber: phoneNumberRule,
    website: optionalText(255),
    address: requiredText(200),
    postcode: optionalText(20),
    city: optionalText(100),
    region: optionalText(100),
    country: optionalText(100),
    closureNote: optionalText(255),
    description: optionalText(1000),
    cuisine: optionalText(100),
    priceRange: optionalText(100),
    floorAreaM2: optionalWholeNumber(1, 100000),
    minPartySize: wholeNumber(1, 100),
    maxPartySize: wholeNumber(1, 100).test("min-max", "Must be at least the minimum", function (value) {
        return Number(value) >= Number(this.parent.minPartySize);
    }),
    tableTimeMinutes: wholeNumber(15, 600),
    lunchTableTimeMinutes: optionalWholeNumber(15, 600),
    lastSeatingMinutes: wholeNumber(0, 600),
    bookingWindowDays: wholeNumber(1, 730),
    minNoticeHours: wholeNumber(0, 168),
    depositPerGuest: Yup.string().trim().test("money", "Amount like 20 or 12,50", value => !value || /^\d+([.,]\d{1,2})?$/.test(value)),
    depositMinParty: optionalWholeNumber(1, 100),
    cancellationHours: wholeNumber(0, 720),
    gracePeriodMinutes: wholeNumber(0, 240),
    timezone: Yup.string().trim().required("Required")
        .test("time-zone", "Unknown time zone, e.g. Europe/Athens", value => !value || isValidTimeZone(value.trim())),
});

const toFormValues = (store: StoreType) => ({
    status: store.status,
    storeName: store.storeName,
    storeManager: store.storeManager,
    email: store.email,
    phoneNumber: store.phoneNumber,
    website: store.website,
    address: store.address,
    postcode: store.postcode,
    city: store.city,
    region: store.region,
    country: store.country,
    closureNote: store.closureNote,
    reopensOn: store.reopensOn ?? "",
    description: store.description,
    cuisine: store.cuisine,
    priceRange: store.priceRange,
    openedOn: store.openedOn ?? "",
    floorAreaM2: store.floorAreaM2?.toString() ?? "",
    minPartySize: String(store.minPartySize),
    maxPartySize: String(store.maxPartySize),
    tableTimeMinutes: String(store.tableTimeMinutes),
    lunchTableTimeMinutes: store.lunchTableTimeMinutes?.toString() ?? "",
    lastSeatingMinutes: String(store.lastSeatingMinutes),
    bookingWindowDays: String(store.bookingWindowDays),
    minNoticeHours: String(store.minNoticeHours),
    depositPerGuest: store.depositPerGuestCents ? (store.depositPerGuestCents / 100).toFixed(2).replace(".", ",").replace(",00", "") : "",
    depositMinParty: store.depositMinParty?.toString() ?? "",
    cancellationHours: String(store.cancellationHours),
    gracePeriodMinutes: String(store.gracePeriodMinutes),
    timezone: store.timezone,
});

type FormValuesType = ReturnType<typeof toFormValues>;

const toUpdate = (values: FormValuesType): StoreUpdateType => {
    const text = (value: string) => value.trim();
    const optionalNumber = (value: string) => value.trim() ? Number(value) : null;
    return {
        status: values.status,
        storeName: text(values.storeName),
        storeManager: text(values.storeManager),
        email: text(values.email),
        phoneNumber: text(values.phoneNumber),
        website: text(values.website),
        address: text(values.address),
        postcode: text(values.postcode),
        city: text(values.city),
        region: text(values.region),
        country: text(values.country),
        closureNote: text(values.closureNote),
        reopensOn: values.reopensOn || null,
        description: text(values.description),
        cuisine: text(values.cuisine),
        priceRange: text(values.priceRange),
        openedOn: values.openedOn || null,
        floorAreaM2: optionalNumber(values.floorAreaM2),
        minPartySize: Number(values.minPartySize),
        maxPartySize: Number(values.maxPartySize),
        tableTimeMinutes: Number(values.tableTimeMinutes),
        lunchTableTimeMinutes: optionalNumber(values.lunchTableTimeMinutes),
        lastSeatingMinutes: Number(values.lastSeatingMinutes),
        bookingWindowDays: Number(values.bookingWindowDays),
        minNoticeHours: Number(values.minNoticeHours),
        depositPerGuestCents: values.depositPerGuest.trim() ? Math.round(Number(values.depositPerGuest.replace(",", ".")) * 100) : 0,
        depositMinParty: optionalNumber(values.depositMinParty),
        cancellationHours: Number(values.cancellationHours),
        gracePeriodMinutes: Number(values.gracePeriodMinutes),
        timezone: text(values.timezone),
    };
};

const StoreEditDrawer = ({ store, onClose, onSaved }: { store: StoreType, onClose: () => void, onSaved: (store: StoreType) => void }) => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { addSnackBar } = useSnackBar();
    const [isConfirmingDelete, setIsConfirmingDelete] = useState<boolean>(false);
    const { values, errors, setField, validate, setFormError } = useFormState(toFormValues(store), EditStoreSchema);

    const { mutate: save, isPending: isSaving } = useMutation({
        mutationFn: updateStore,
        onSuccess: (updated) => {
            addSnackBar("Store updated.");
            onSaved(updated);
            onClose();
        },
        onError: (error) => setFormError(errorMessage(error)),
    });

    const { mutate: remove, isPending: isDeleting } = useMutation({
        mutationFn: deleteStore,
        onSuccess: () => {
            addSnackBar(`${store.storeName} deleted.`);
            queryClient.removeQueries({ queryKey: ["stores"] });
            queryClient.invalidateQueries();
            navigate("/stores", { replace: true });
        },
        onError: (error) => setFormError(errorMessage(error)),
    });

    const submit = () => {
        if (validate()) save({ id: store.id, values: toUpdate(values) });
    };

    const input = (key: keyof FormValuesType, props: { type?: string, inputMode?: "numeric" | "decimal", autoComplete?: string, placeholder?: string } = {}) => (
        <input
            id={`se-${key}`}
            className={`adm-input ${errors[key] ? "adm-input--invalid" : ""}`}
            value={values[key]}
            onChange={(event) => setField(key, event.target.value)}
            aria-invalid={!!errors[key]}
            {...props}
        />
    );

    // Optional dates, so the calendar offers Clear.
    const dateInput = (key: "reopensOn" | "openedOn") => (
        <DatePicker
            id={`se-${key}`}
            className={`adm-input ${errors[key] ? "adm-input--invalid" : ""}`}
            value={values[key]}
            invalid={!!errors[key]}
            clearable
            placeholder="Not set"
            today={serviceNow(values.timezone || store.timezone).date}
            onChange={(next) => setField(key, next)}
        />
    );

    const field = (key: keyof FormValuesType, label: string, control: ReactNode, extra: { required?: boolean, hint?: string, optional?: string } = {}) => (
        <Field label={label} htmlFor={`se-${key}`} error={errors[key]} {...extra}>{control}</Field>
    );

    return (
        <Drawer
            title="Edit store"
            subtitle={store.storeName}
            onClose={onClose}
            onSubmit={submit}
            footer={isConfirmingDelete
                ? <>
                    <span className="adm-error store-edit-confirm">Delete {store.storeName}, its menu and reservations?</span>
                    <div className="adm-drawer-footer-end">
                        <button type="button" className="adm-btn adm-btn--outline" onClick={() => setIsConfirmingDelete(false)}>Keep store</button>
                        <button type="button" className="adm-btn adm-btn--danger" disabled={isDeleting} onClick={() => remove(store.id)}>{isDeleting ? "Deleting…" : "Delete store"}</button>
                    </div>
                </>
                : <>
                    <button type="button" className="adm-btn adm-btn--danger-text" onClick={() => setIsConfirmingDelete(true)}>Delete store</button>
                    <div className="adm-drawer-footer-end">
                        <button type="button" className="adm-btn adm-btn--outline" onClick={onClose}>Cancel</button>
                        <button type="submit" className="adm-btn adm-btn--primary" disabled={isSaving}>{isSaving ? "Saving…" : "Save changes"}</button>
                    </div>
                </>}
        >
            {errors.form && <p className="adm-form-error" role="alert">{errors.form}</p>}

            <fieldset className="adm-form-section">
                <legend className="adm-form-section-title">Status</legend>
                <div className="store-edit-status" role="radiogroup" aria-label="Store status">
                    {STATUS_OPTIONS.map(option => (
                        <label key={option.value} className={`store-edit-status-option ${values.status === option.value ? "is-selected" : ""}`}>
                            <input type="radio" name="status" value={option.value} checked={values.status === option.value} onChange={() => setField("status", option.value)} />
                            <span className="store-edit-status-text"><span>{option.label}</span><span className="adm-small adm-muted">{option.hint}</span></span>
                        </label>
                    ))}
                </div>
                {values.status === "temporarily_closed" && <div className="adm-form-grid">
                    {field("closureNote", "Note for diners", input("closureNote", { placeholder: "Renovation until 21 Sep" }), { optional: "Optional" })}
                    {field("reopensOn", "Reopens on", dateInput("reopensOn"), { optional: "Optional", hint: "Bookings open again from this date." })}
                </div>}
            </fieldset>

            <fieldset className="adm-form-section">
                <legend className="adm-form-section-title">About</legend>
                {field("storeName", "Store name", input("storeName"), { required: true })}
                <div className="adm-form-grid">
                    {field("cuisine", "Cuisine", input("cuisine", { placeholder: "Modern Greek" }), { optional: "Optional" })}
                    {field("priceRange", "Price range", input("priceRange", { placeholder: "€35–55 per guest" }), { optional: "Optional" })}
                </div>
                {field("description", "Description",
                    <textarea id="se-description" className="adm-input" rows={3} value={values.description} onChange={(event) => setField("description", event.target.value)} />,
                    { optional: "Optional" })}
                <div className="adm-form-grid">
                    {field("openedOn", "Opened", dateInput("openedOn"), { optional: "Optional" })}
                    {field("timezone", "Time zone", input("timezone", { placeholder: "Europe/Athens" }), { required: true })}
                </div>
            </fieldset>

            <fieldset className="adm-form-section">
                <legend className="adm-form-section-title">Address &amp; contact</legend>
                {field("address", "Street", input("address", { autoComplete: "address-line1" }), { required: true })}
                <div className="adm-form-grid adm-form-grid--narrow">
                    {field("postcode", "Postcode", input("postcode", { autoComplete: "postal-code" }))}
                    {field("city", "City", input("city", { autoComplete: "address-level2" }))}
                </div>
                <div className="adm-form-grid adm-form-grid--narrow">
                    {field("region", "Region", input("region", { autoComplete: "address-level1" }))}
                    {field("country", "Country", input("country", { autoComplete: "country-name" }))}
                </div>
                <div className="adm-form-grid">
                    {field("phoneNumber", "Phone", input("phoneNumber", { type: "tel", autoComplete: "tel" }), { required: true })}
                    {field("email", "Reservations email", input("email", { type: "email", autoComplete: "email" }), { required: true })}
                </div>
                <div className="adm-form-grid">
                    {field("storeManager", "Manager", input("storeManager"), { required: true })}
                    {field("website", "Website", input("website", { placeholder: "gviano.com/kolonaki" }), { optional: "Optional" })}
                </div>
            </fieldset>

            <fieldset className="adm-form-section">
                <legend className="adm-form-section-title">Seating</legend>
                <div className="adm-form-grid adm-form-grid--narrow">
                    {field("minPartySize", "Smallest party", input("minPartySize", { inputMode: "numeric" }), { required: true })}
                    {field("maxPartySize", "Largest party", input("maxPartySize", { inputMode: "numeric" }), { required: true, hint: "Larger groups book by phone." })}
                </div>
                <div className="adm-form-grid adm-form-grid--narrow">
                    {field("tableTimeMinutes", "Table time (min)", input("tableTimeMinutes", { inputMode: "numeric" }), { required: true })}
                    {field("lunchTableTimeMinutes", "At lunch (min)", input("lunchTableTimeMinutes", { inputMode: "numeric" }), { optional: "Optional", hint: "Bookings before 16:00." })}
                </div>
                <div className="adm-form-grid adm-form-grid--narrow">
                    {field("lastSeatingMinutes", "Last seating (min before close)", input("lastSeatingMinutes", { inputMode: "numeric" }), { required: true })}
                    {field("floorAreaM2", "Floor area (m²)", input("floorAreaM2", { inputMode: "numeric" }), { optional: "Optional" })}
                </div>
            </fieldset>

            <fieldset className="adm-form-section">
                <legend className="adm-form-section-title">Reservation policy</legend>
                <div className="adm-form-grid adm-form-grid--narrow">
                    {field("bookingWindowDays", "Book up to (days ahead)", input("bookingWindowDays", { inputMode: "numeric" }), { required: true })}
                    {field("minNoticeHours", "At least (hours before)", input("minNoticeHours", { inputMode: "numeric" }), { required: true })}
                </div>
                <div className="adm-form-grid adm-form-grid--narrow">
                    {field("depositPerGuest", "Deposit per guest (€)", input("depositPerGuest", { inputMode: "decimal", placeholder: "0" }), { optional: "Optional" })}
                    {field("depositMinParty", "For parties of", input("depositMinParty", { inputMode: "numeric", placeholder: "Any size" }), { optional: "Optional" })}
                </div>
                <div className="adm-form-grid adm-form-grid--narrow">
                    {field("cancellationHours", "Free cancellation (hours before)", input("cancellationHours", { inputMode: "numeric" }), { required: true })}
                    {field("gracePeriodMinutes", "Grace period (min)", input("gracePeriodMinutes", { inputMode: "numeric" }), { required: true, hint: "Then the table is released." })}
                </div>
            </fieldset>
        </Drawer>
    );
};

export default StoreEditDrawer;
