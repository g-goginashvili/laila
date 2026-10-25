import "./not-found-page.css";

import { useNavigate } from "react-router";
import Typography from "../../components/typography/typography";
import CustomButton from "../../components/custom-button/custom-button";
import GvianoIcon from "../../icons/gviano-icon";

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <main className="not-found-page">
            <GvianoIcon size={96} className="not-found-page-icon" />
            <Typography variant="display" weight="emphasis" color="heading">
                404
            </Typography>
            <Typography variant="headline" size="small" color="primary">
                Page not found
            </Typography>
            <Typography variant="body" color="secondary" className="not-found-page-text">
                The page you are looking for doesn't exist or has been moved.
            </Typography>
            <CustomButton onClick={() => navigate("/", { replace: true })}>
                Back to Home
            </CustomButton>
        </main>
    );
};

export default NotFoundPage;
