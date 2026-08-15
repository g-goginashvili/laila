import "./snack-bar-context-provider.css"

import { useCallback, useLayoutEffect, useMemo, useRef, useState, type ReactElement, type ReactNode } from "react";
import SnackBar from "./snack-bar";
import { SnackBarContext, type AddSnackBarOptionsType, type SnackBarContextValueType } from "./snack-bar-context";

const SnackBarContextProvider = ({
    children
}: { children: ReactNode }): ReactElement => {

    const [snackBarArray, setSnackBarArray] = useState<SnackBarContextValueType[]>([]);

    const nodeMapRef = useRef(new Map<string, HTMLDivElement>());
    const refCallbacksRef = useRef(new Map<string, (node: HTMLDivElement | null) => void>());
    const positionsRef = useRef(new Map<string, number>());

    const refHandler = (id: string) => {
        if (!refCallbacksRef.current.has(id)) {
            refCallbacksRef.current.set(id, (node) => {
                if (node) nodeMapRef.current.set(id, node);
                else nodeMapRef.current.delete(id);
            });
        }
        return refCallbacksRef.current.get(id);
    };

    const onExpire = (id: string) => {
        setSnackBarArray((prev) => {
            const target = prev.find(item => item.id === id);
            if (!target || target.isExpired) return prev;
            return prev.map(item =>
                item.id === id ? { ...item, isExpired: true } : item
            );
        });
    };

    const addSnackBar = useCallback((
        message: string,
        options?: AddSnackBarOptionsType
    ) => {
        const id = self.crypto.randomUUID();
        setSnackBarArray(prev => [
            ...(prev ?? []),
            { id, message, ...options, isExpired: false }
        ]);
        return id;
    }, []);

    const removeSnackBar = useCallback((id: string) => {
        setSnackBarArray(prev => prev.filter(item => item.id !== id));
    }, []);

    const contextValue = useMemo(() => ({
        snackBars: snackBarArray,
        addSnackBar,
        removeSnackBar
    }), [snackBarArray, addSnackBar, removeSnackBar]);

    useLayoutEffect(() => {
        snackBarArray.length > 4 && snackBarArray.forEach((item, index) => {
            if (index < snackBarArray.length - 4) onExpire(item.id);
        });

        const prevPositions = positionsRef.current;
        const nextPositions = new Map<string, number>();

        snackBarArray.forEach(({ id, isExpired }) => {
            if (isExpired) return;

            const node = nodeMapRef.current.get(id);
            if (!node) return;

            const containerTop = node.offsetParent?.getBoundingClientRect().top ?? 0;
            const top = containerTop + node.offsetTop;
            nextPositions.set(id, top);

            const prevTop = prevPositions.get(id);
            if (prevTop === undefined || prevTop === top) return;

            const deltaY = prevTop - top;

            node.style.transition = "none";
            node.style.transform = `translateY(${deltaY}px)`;
            void node.offsetHeight;

            node.classList.add("snack-bar-reflow");
            node.style.transition = "";
            node.style.transform = "";

            const handleTransitionEnd = (event: TransitionEvent) => {
                if (event.propertyName !== "transform") return;
                node.classList.remove("snack-bar-reflow");
                node.removeEventListener("transitionend", handleTransitionEnd);
            };
            node.addEventListener("transitionend", handleTransitionEnd);
        });

        positionsRef.current = nextPositions;
    }, [snackBarArray]);

    return (
        <SnackBarContext.Provider value={contextValue}>
            {snackBarArray && <div className="snack-bar-context-provider">
                {snackBarArray.map(snackBar =>
                    <SnackBar
                        key={snackBar.id}
                        id={snackBar.id}
                        ref={refHandler(snackBar.id)}
                        onButtonClick={() => { onExpire(snackBar.id) }}
                        message={snackBar.message}
                        variant={snackBar.variant}
                        hasBorder={snackBar.hasBorder}
                        duration={snackBar.duration}
                        isExpired={snackBar.isExpired}
                        onExpire={onExpire}
                        onAnimationEnd={removeSnackBar}
                    />)}
            </div>}
            {children}
        </SnackBarContext.Provider>
    );
};

export default SnackBarContextProvider;

