import "./typography.css";

import type { ElementType, HTMLAttributes, ReactElement } from "react";

type TypographyVariantType = "display" | "headline" | "title" | "body" | "label";
type TypographySizeType = "large" | "medium" | "small";
type TypographyWeightType = "baseline" | "emphasis";
type TypographyColorType =
    | "primary"
    | "secondary"
    | "muted"
    | "disabled"
    | "heading"
    | "on-primary"
    | "on-inverse"
    | "link"
    | "success"
    | "warning"
    | "error"
    | "info"
    | "inherit";

type TypographyPropType =
    Omit<HTMLAttributes<HTMLElement>, "color"> & {
        variant?: TypographyVariantType;
        size?: TypographySizeType;
        color?: TypographyColorType;
        weight?: TypographyWeightType;
        htmlFor?: string;
        // Overrides the element picked from the variant, e.g. a span inside a button.
        as?: ElementType;
    };

const variantMap = {
    display: "h1",
    headline: "h2",
    title: "h3",
    body: "p",
    label: "label"
};

const Typography = ({
    variant = "display",
    color = "primary",
    size = "large",
    weight = "baseline",
    children,
    className,
    as,
    ...rest
}: TypographyPropType): ReactElement => {

    const TypographyTag = as ?? variantMap[variant] as ElementType;
    const preciseClass =
        `typography ` +
        `typography-${color} ` +
        `typography-${variant}-${size} ` +
        `typography-${variant}-${size}-${weight} ` +
        `${className ?? ""}`;

    return (
        <TypographyTag
            {...rest}
            className={preciseClass}
        >
            {children}
        </TypographyTag>
    );
};

export default Typography;