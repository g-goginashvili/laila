import { useNavigate } from "react-router";

const useLandingPageContreller = () => {
    const navigate = useNavigate();

    const handleBusinessRedirect = () => {
        navigate("/admin-auth");
    };

    return {
        handleBusinessRedirect,
    };
};

export default useLandingPageContreller;