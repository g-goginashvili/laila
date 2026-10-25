import "./heartbeat-loader.css";

import GvianoIcon from "../../icons/gviano-icon";

type HeartbeatLoaderPropType = {
    size?: number;
    label?: string;
    isFullScreen?: boolean;
};

const HeartbeatLoader = ({
    size = 56,
    label = "Loading",
    isFullScreen = false
}: HeartbeatLoaderPropType) => {

    return (
        <div className={`heartbeat-loader${isFullScreen ? " heartbeat-loader--full-screen" : ""}`} role="status" aria-label={label}>
            <GvianoIcon size={size} className="heartbeat-loader-icon" />
        </div>
    );
};

export default HeartbeatLoader;
