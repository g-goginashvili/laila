import "./admin-ui.css";
import "./drawer.css";

import { useEffect, useId, useRef, type FormEvent, type ReactNode } from "react";

type DrawerPropType = {
    title: string;
    subtitle?: ReactNode;
    onClose: () => void;
    onSubmit?: () => void;
    footer: ReactNode;
    children: ReactNode;
};

// Right-hand slide-over used for every create/edit form in the admin.
const Drawer = ({
    title,
    subtitle,
    onClose,
    onSubmit,
    footer,
    children,
}: DrawerPropType) => {
    const titleId = useId();
    const formRef = useRef<HTMLFormElement>(null);
    const onCloseRef = useRef(onClose);

    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        const previousFocus = document.activeElement as HTMLElement | null;
        formRef.current?.querySelector<HTMLElement>(".adm-drawer-body :is(input:not([type=hidden]), select, textarea, button)")?.focus();

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onCloseRef.current();
        };
        document.addEventListener("keydown", onKeyDown);
        const { overflow } = document.body.style;
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = overflow;
            previousFocus?.focus?.();
        };
    }, []);

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        onSubmit?.();
    };

    return (
        <>
            <div className="adm-drawer-overlay" aria-hidden="true" onClick={onClose} />
            <form
                ref={formRef}
                className="adm-drawer"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                onSubmit={handleSubmit}
                noValidate
            >
                <header className="adm-drawer-header">
                    <div className="adm-drawer-heading">
                        <h2 id={titleId} className="adm-drawer-title">{title}</h2>
                        {subtitle && <div className="adm-drawer-subtitle">{subtitle}</div>}
                    </div>
                    <button type="button" className="adm-icon-btn" aria-label="Close" onClick={onClose}>×</button>
                </header>
                <div className="adm-drawer-body">{children}</div>
                <footer className="adm-drawer-footer">{footer}</footer>
            </form>
        </>
    );
};

export default Drawer;
