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
};

type CustomFormPropType = {
    formName: string;
    initialValues: Record<string, string>;
    validationSchema: AnySchema;
    inputFields: InputFieldType[];
    onSubmit: (values: Record<string, string>, formikHelpers: FormikHelpers<Record<string, string>>) => void;
};

const CustomForm = ({
    formName,
    initialValues,
    validationSchema,
    inputFields,
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
                    <div className="custom-form-fields-div" >
                        {inputFields.map(value =>
                            <TextInput
                                key={`text-input-${value.type}-${value.name}`}
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
                        )}
                    </div>
                </form>
            )}
        </Formik>
    )
}

export default CustomForm;