
import * as Yup from 'yup';
import type { InputFieldType } from '../../components/custom-form/custom-form';
import { emailRule, phoneNumberRule, requiredText } from '../../utility/validation';

export const SignInSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Required"),
    password: Yup.string().required("Required"),
});

export const signInInitialValues = {
    email: "",
    password: "",
};

export const signInInputFields: InputFieldType[] = [
    { name: "email", type: "email", label: "Email" },
    { name: "password", type: "password", label: "Password" }
];

export const SignUpSchema = Yup.object().shape({
    name: requiredText(50),
    surname: requiredText(50),
    email: emailRule,
    phoneNumber: phoneNumberRule,
    orgName: requiredText(100),
    address: requiredText(200),
    numberOfStores: Yup.string().required("Choose one").oneOf(["single", "multiple"], "Choose one"),
    password: Yup.string()
        .min(8, "At least 8 characters")
        .max(128, "At most 128 characters")
        .required("Required"),
});

export const signUpInitialValues = {
    name: "",
    surname: "",
    email: "",
    phoneNumber: "",
    orgName: "",
    address: "",
    numberOfStores: "",
    password: "",
};

export const signUpInputFields: InputFieldType[] = [
    { name: "name", type: "text", label: "Name", width: "half" },
    { name: "surname", type: "text", label: "Surname", width: "half" },
    { name: "phoneNumber", type: "tel", label: "Phone Number", placeholder: "+302103614022", width: "half" },
    { name: "email", type: "email", label: "Email", width: "half" },
    { name: "orgName", type: "text", label: "Organisation", width: "half" },
    {
        name: "numberOfStores",
        type: "select",
        label: "Number of Stores",
        width: "half",
        options: [
            { value: "single", label: "Single location" },
            { value: "multiple", label: "Multiple locations" },
        ],
    },
    { name: "address", type: "text", label: "Address" },
    { name: "password", type: "password", label: "Password", helperText: "At least 8 characters" }
];
