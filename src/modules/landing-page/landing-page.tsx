import "./landing-page.css";
import CustomButton from "../../components/custom-button/custom-button";
import Typography from "../../components/typography/typography";
import StatusChip from "../../components/status-chip/status-chip";
import TextInput from "../../components/text-input/text-input";
import useLandingPageContreller from "./use-landing-page-controller";

const LandingPage = () => {
    const {
        handleBusinessRedirect,
    } = useLandingPageContreller();
    return (
        <div className="landing-page-wrapper-div">
            <nav className="landing-page-nav">
                <div className="landing-page-nav-div">
                    <img
                        src="../../../favicon.svg"
                        alt="Company logo"
                        className="landing-page-nav-icon"
                    />
                    <Typography
                        variant="headline"
                        weight="emphasis"
                        color="primary"
                    >
                        Gviano
                    </Typography>
                </div>
                <CustomButton size="medium" onClick={handleBusinessRedirect}>For Restaurants</CustomButton>
            </nav>
            <main className="landing-page-main">
                <section className="landing-page-left-section">
                    <StatusChip variant="info" textValue="User Application * Coming Soon" />
                    <Typography weight="emphasis">Book a spot hustle free.</Typography>
                    <Typography variant="body" color="secondary">
                        Gviano lets you book a spot at your favorite place.
                        Choose the table and reserve it. Might as well
                        preorder from the menu while you're at it.
                        Just remember, don't be late — you get rated too.
                    </Typography>
                    <Typography variant="body" color="secondary">
                        Leave us your email and we will let you know the lounch.
                    </Typography>
                    <div className="landing-page-email-div">
                        <TextInput
                            name="customer-email"
                            label="Email address"
                            placeholder="your-email@example.com"
                            helperText="One email on launch day. No newsletter, and we never share it."
                        />
                        <CustomButton>Notife Me</CustomButton>
                    </div>
                </section>
                <section className="landing-page-right-section">
                    <div className="landing-page-web-app-paceholder" />
                    <div className="landing-page-mobile-app-paceholder" />
                    <Typography
                        variant="title"
                        className="landing-page-drawing-paceholder-text"
                    >
                        User Application Coming Soon ...
                    </Typography>
                </section>
            </main>
        </div>
    );
};

export default LandingPage;