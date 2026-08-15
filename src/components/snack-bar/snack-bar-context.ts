import { createContext, useContext } from "react";
import type { SnackBarVariantType } from "./snack-bar";

type SnackBarContextValueType = {
    id: string;
    message: string;
    buttonText?: string;
    onButtonClick?: (...args: any[]) => any;
    variant?: SnackBarVariantType;
    hasBorder?: boolean;
    duration?: number;
    isExpired?: boolean;
};

type AddSnackBarOptionsType = Omit<
    SnackBarContextValueType, "id" | "message" | "isExpired"
>;

type SnackBarContextType = {
    snackBars: SnackBarContextValueType[];
    addSnackBar: (
        message: string,
        options?: AddSnackBarOptionsType
    ) => string;
    removeSnackBar: (id: string) => void;
};

const SnackBarContext = createContext<SnackBarContextType | undefined>(undefined);

const useSnackBar = (): SnackBarContextType => {
    const context = useContext(SnackBarContext);
    if (!context) throw new Error("useSnackBar must be used within SnackBarContextProvider");
    return context;
};

export { SnackBarContext, useSnackBar };
export type { SnackBarContextValueType, AddSnackBarOptionsType, SnackBarContextType };
