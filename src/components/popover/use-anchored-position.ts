import { useLayoutEffect, useState, type CSSProperties, type RefObject } from "react";

const GAP = 4;
const VIEWPORT_MARGIN = 8;
const MIN_HEIGHT = 120;

type OptionsType = {
    // At least as wide as the anchor (lists); otherwise the content keeps its own width (calendars).
    matchWidth?: boolean;
    maxHeight?: number;
};

// Popovers render in a portal; use the themed shell so admin colour tokens still apply.
export const popoverRoot = (anchor: HTMLElement | null) =>
    anchor?.closest<HTMLElement>(".admin-theme") ?? document.body;

// Fixed position for a popover under its anchor (or above when there's more room there),
// kept inside the viewport and updated on scroll and resize.
const useAnchoredPosition = (
    isOpen: boolean,
    anchorRef: RefObject<HTMLElement | null>,
    contentRef: RefObject<HTMLElement | null>,
    { matchWidth = false, maxHeight = 400 }: OptionsType = {}
) => {
    const [style, setStyle] = useState<CSSProperties>({});

    useLayoutEffect(() => {
        if (!isOpen) return;

        const place = () => {
            const anchor = anchorRef.current;
            if (!anchor) return;
            const rect = anchor.getBoundingClientRect();
            const content = contentRef.current;

            const below = window.innerHeight - rect.bottom - GAP - VIEWPORT_MARGIN;
            const above = rect.top - GAP - VIEWPORT_MARGIN;
            const wanted = Math.min(maxHeight, content?.scrollHeight ?? maxHeight);
            const openUp = below < wanted && above > below;

            const maxWidth = window.innerWidth - VIEWPORT_MARGIN * 2;
            const ownWidth = content?.offsetWidth ?? rect.width;
            const width = Math.min(matchWidth ? Math.max(rect.width, ownWidth) : ownWidth, maxWidth);

            setStyle({
                left: Math.max(VIEWPORT_MARGIN, Math.min(rect.left, window.innerWidth - VIEWPORT_MARGIN - width)),
                ...(matchWidth && { minWidth: rect.width }),
                maxWidth,
                maxHeight: Math.max(MIN_HEIGHT, Math.min(maxHeight, openUp ? above : below)),
                ...(openUp ? { bottom: window.innerHeight - rect.top + GAP } : { top: rect.bottom + GAP }),
            });
        };

        place();
        window.addEventListener("resize", place);
        window.addEventListener("scroll", place, true);
        return () => {
            window.removeEventListener("resize", place);
            window.removeEventListener("scroll", place, true);
        };
    }, [isOpen, anchorRef, contentRef, matchWidth, maxHeight]);

    return style;
};

export default useAnchoredPosition;
