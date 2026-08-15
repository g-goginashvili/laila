import "./status-chip.css";

import Typography from "../typography/typography";

type StatusChipVariantType =
    | "success"
    | "warning"
    | "error"
    | "info"
    | "neutral";

type StatusChipPropType = {
    variant: StatusChipVariantType;
    textValue: string;
}

const StatusChip = ({
    variant = "success",
    textValue
}: StatusChipPropType) => {

    return (
        <div className={`status-chip status-chip-${variant}`}>
            <div className={`status-chip-dot status-chip-dot-${variant}`} />
            <Typography
                variant="label"
                color="inherit"
                weight="emphasis"
            >
                {textValue}
            </Typography>
        </div>
    );
};

export default StatusChip;