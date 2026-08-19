import "./custom-form.css";

import { Formik, type FormikHelpers } from "formik";
import TextInput from "../text-input/text-input";
import type { AnySchema } from "yup";

type InputFieldType = {
    name: string;
    type?: "text" | "password" | "email";
    label?: string;
    placeholder?: string;
    helperText?: string;
    width?: "full" | "half" | "third" | "quarter" | "auto";
};

type CustomFormPropType = {
    formName: string;
    initialValues: Record<string, string>;
    validationSchema: AnySchema;
    inputFields: InputFieldType[];
    layout?: "wrap" | "inline";
    onSubmit: (values: Record<string, string>, formikHelpers: FormikHelpers<Record<string, string>>) => void;
};

const CustomForm = ({
    formName,
    initialValues,
    validationSchema,
    inputFields,
    layout = "wrap",
    onSubmit,
}: CustomFormPropType) => {
    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
        >
            {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                handleSubmit,
            }) => (
                <form id={formName} onSubmit={handleSubmit}>
                    <div className={
                        `custom-form-fields-div ${layout === "inline" ? "custom-form-fields-div-inline" : ""}`
                    }>
                        {inputFields.map(value =>
                            <div
                                className={`input-width-modifier input-width-modifier-${value.width ?? "full"}`}
                                key={`text-input-${value.type}-${value.name}`}
                            >
                                <TextInput
                                    type={value.type}
                                    name={value.name}
                                    label={value.label}
                                    placeholder={value.placeholder}
                                    value={values[value.name]}
                                    helperText={value.helperText}
                                    errorText={touched[value.name] ? errors[value.name] : undefined}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                            </div>
                        )}
                    </div>
                </form>
            )}
        </Formik>
    )
};

export default CustomForm;