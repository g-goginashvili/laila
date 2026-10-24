import * as Yup from 'yup';
import type { InputFieldType } from '../../components/custom-form/custom-form';
import type { StoreType, StoreValuesType } from '../../api/types';
import { emailRule, phoneNumberRule, requiredText } from '../../utility/validation';

export const StoreSchema = Yup.object().shape({
    storeName: requiredText(255),
    storeManager: requiredText(255),
    email: emailRule,
    phoneNumber: phoneNumberRule,
    address: requiredText(200),
});

export const emptyStoreValues: StoreValuesType = {
    storeName: "",
    storeManager: "",
    email: "",
    phoneNumber: "",
    address: "",
};

export const storeToFormValues = (store?: StoreType): StoreValuesType => store ? {
    storeName: store.storeName,
    storeManager: store.storeManager,
    email: store.email,
    phoneNumber: store.phoneNumber,
    address: store.address,
} : emptyStoreValues;

export const formValuesToStore = (values: Record<string, string>): StoreValuesType => ({
    storeName: values.storeName.trim(),
    storeManager: values.storeManager.trim(),
    email: values.email.trim(),
    phoneNumber: values.phoneNumber.trim(),
    address: values.address.trim(),
});

export const storeInputFields: InputFieldType[] = [
    { name: "storeName", type: "text", label: "Store Name", width: "half" },
    { name: "storeManager", type: "text", label: "Store Manager", width: "half" },
    { name: "email", type: "email", label: "Email", width: "half" },
    { name: "phoneNumber", type: "tel", label: "Phone Number", placeholder: "+995555123456", width: "half" },
    { name: "address", type: "text", label: "Address" },
];
