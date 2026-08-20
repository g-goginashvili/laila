
import * as Yup from 'yup';
import type { InputFieldType } from '../../components/custom-form/custom-form';

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
    name: Yup.string().required("Required"),
    surname: Yup.string().required("Required"),
    email: Yup.string().email("Invalid email").required("Required"),
    phoneNumber: Yup.string().required("Required"),
    orgName: Yup.string().required("Required"),
    address: Yup.string().required("Required"),
    numberOfStores: Yup.string().required("Required"),
    password: Yup.string().required("Required"),
});

export const signUpInitialValues = {
    name: "",
    surname: "",
    email: "",
    phoneNumber: "",
    orgName: "",
    address: "",
    numberOfStores: "Single",
    password: "",
};

export const signUpInputFields: InputFieldType[] = [
    { name: "name", type: "text", label: "Name", width: "half" },
    { name: "surname", type: "text", label: "Surname", width: "half" },
    { name: "phoneNumber", type: "text", label: "Phone Number", width: "half" },
    { name: "email", type: "email", label: "Email", width: "half" },
    { name: "orgName", type: "text", label: "Organisation", width: "half" },
    { name: "numberOfStores", type: "text", label: "Number of Stores", width: "half" },
    { name: "address", type: "text", label: "Address" },
    { name: "password", type: "password", label: "Password" }
];