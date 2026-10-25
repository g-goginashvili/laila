import "./admin-ui.css";
import "./switch.css";

type SwitchPropType = {
    checked: boolean;
    label: string;
    tone?: "primary" | "warning";
    disabled?: boolean;
    onChange: (checked: boolean) => void;
};

const Switch = ({
    checked,
    label,
    tone = "primary",
    disabled = false,
    onChange,
}: SwitchPropType) => {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            disabled={disabled}
            className={`adm-switch adm-switch--${tone}`}
            onClick={() => onChange(!checked)}
        >
            <span className="adm-switch-track" aria-hidden="true" />
            <span className="adm-switch-knob" aria-hidden="true" />
        </button>
    );
};

export default Switch;
