import "./admin-ui.css";

import type { ReactNode } from "react";

type FieldPropType = {
    label: ReactNode;
    htmlFor?: string;
    required?: boolean;
    optional?: ReactNode;
    hint?: ReactNode;
    error?: string | undefined;
    className?: string;
    children: ReactNode;
};

// Label above the control, optional hint/error below — the admin form pattern.
const Field = ({
    label,
    htmlFor,
    required = false,
    optional,
    hint,
    error,
    className,
    children,
}: FieldPropType) => {
    return (
        <div className={`adm-field ${className ?? ""}`}>
            <label htmlFor={htmlFor} className="adm-label">
                <span>{label}{required && <span className="adm-required" aria-hidden="true"> *</span>}</span>
                {optional && <span className="adm-label-optional">{optional}</span>}
            </label>
            {children}
            {error ? <span className="adm-error" role="alert">{error}</span> : hint && <span className="adm-hint">{hint}</span>}
        </div>
    );
};

export default Field;
