import "../../styles/admin-page-layout.css";

import Typography from "../../components/typography/typography";
import StatusChip from "../../components/status-chip/status-chip";

const ComingSoonPage = ({
    title,
    description,
}: { title: string, description: string }) => {
    return (
        <div className="admin-page">
            <div className="admin-page-header-text">
                <Typography variant="headline" size="medium" weight="emphasis">{title}</Typography>
            </div>
            <div className="admin-page-empty">
                <StatusChip variant="info" textValue="Coming soon" />
                <Typography variant="body" color="secondary">{description}</Typography>
            </div>
        </div>
    );
};

export default ComingSoonPage;
