import { useState } from "react";
import { ValidationError, type AnySchema } from "yup";

type ErrorsType<T> = Partial<Record<keyof T | "form", string>>;

// Small form helper for the admin drawers: controlled values + Yup validation on submit.
const useFormState = <T extends Record<string, unknown>>(initialValues: T, schema?: AnySchema) => {
    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<ErrorsType<T>>({});

    const setField = <K extends keyof T>(key: K, value: T[K]) => {
        setValues(current => ({ ...current, [key]: value }));
        setErrors(current => (current[key] ? { ...current, [key]: undefined } : current));
    };

    const validate = (): boolean => {
        if (!schema) return true;
        try {
            schema.validateSync(values, { abortEarly: false });
            setErrors({});
            return true;
        } catch (error) {
            if (!(error instanceof ValidationError)) throw error;
            const next: ErrorsType<T> = {};
            for (const issue of error.inner) {
                const key = issue.path as keyof T | undefined;
                if (key && !next[key]) next[key] = issue.message;
            }
            setErrors(next);
            return false;
        }
    };

    const setFormError = (message: string) => setErrors(current => ({ ...current, form: message }));

    return { values, errors, setField, setValues, validate, setFormError };
};

export default useFormState;
