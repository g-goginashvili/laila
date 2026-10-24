import "./custom-form.css";

import { Formik, type FormikHelpers } from "formik";
import TextInput, { type TextInputOptionType } from "../text-input/text-input";
import type { AnySchema } from "yup";

export type InputFieldType = {
    name: string;
    type?: "text" | "password" | "email" | "tel" | "select";
    label?: string;
    placeholder?: string;
    helperText?: string;
    options?: TextInputOptionType[];
    width?: "full" | "half" | "third" | "quarter" | "auto";
};

type CustomFormPropType = {
    formName: string;
    initialValues: Record<string, string>;
    validationSchema: AnySchema;
    inputFields: InputFieldType[];
    layout?: "wrap" | "inline";
    disabled?: boolean;
    enableReinitialize?: boolean;
    onSubmit: (values: Record<string, string>, formikHelpers: FormikHelpers<Record<string, string>>) => void;
};

const CustomForm = ({
    formName,
    initialValues,
    validationSchema,
    inputFields,
    layout = "wrap",
    disabled = false,
    enableReinitialize = false,
    onSubmit,
}: CustomFormPropType) => {
    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            enableReinitialize={enableReinitialize}
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
                                    options={value.options}
                                    value={values[value.name]}
                                    helperText={value.helperText}
                                    errorText={touched[value.name] ? errors[value.name] : undefined}
                                    disabled={disabled}
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
