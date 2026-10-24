import "./landing-page.css";
import CustomButton from "../../components/custom-button/custom-button";
import Typography from "../../components/typography/typography";
import StatusChip from "../../components/status-chip/status-chip";
import TextInput from "../../components/text-input/text-input";
import useLandingPageController from "./use-landing-page-controller";

const LandingPage = () => {
    const {
        waitlistEmail,
        waitlistError,
        isJoiningWaitlist,
        handleBusinessRedirect,
        handleWaitlistEmailChange,
        handleJoinWaitlist,
    } = useLandingPageController();
    return (
        <div className="landing-page-root-div">
            <nav className="landing-page-nav">
                <div className="landing-page-icon-div">
                    <img
                        src="/gviano-icon.svg"
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
            <div className="landing-page-wrapper-div">
                <main className="landing-page-main">
                    <section className="landing-page-left-section">
                        <StatusChip variant="info" textValue="User Application * Coming Soon" />
                        <Typography weight="emphasis">Book a spot hassle-free.</Typography>
                        <Typography variant="body" color="secondary">
                            Gviano lets you book a spot at your favorite place.
                            Choose the table and reserve it. Might as well
                            preorder from the menu while you're at it.
                            Just remember, don't be late — you get rated too.
                        </Typography>
                        <Typography variant="body" color="secondary">
                            Leave us your email and we will let you know about the launch.
                        </Typography>
                        <form
                            className="landing-page-email-div"
                            noValidate
                            onSubmit={(e) => { e.preventDefault(); handleJoinWaitlist(); }}
                        >
                            <TextInput
                                type="email"
                                name="customer-email"
                                label="Email address"
                                placeholder="your-email@example.com"
                                value={waitlistEmail}
                                errorText={waitlistError}
                                disabled={isJoiningWaitlist}
                                onChange={(e) => handleWaitlistEmailChange(e.target.value)}
                                helperText="One email on launch day. No newsletter, and we never share it."
                            />
                            <CustomButton type="submit" disabled={isJoiningWaitlist}>Notify Me</CustomButton>
                        </form>
                    </section>
                    <section className="landing-page-right-section">
                        <div className="landing-page-web-app-placeholder" />
                        <div className="landing-page-mobile-app-placeholder" />
                        <Typography
                            variant="title"
                            className="landing-page-drawing-placeholder-text"
                        >
                            User Application Coming Soon ...
                        </Typography>
                    </section>
                </main>
                <footer className="landing-page-footer">

                    <div className="landing-page-footer-wrapper-grid">

                        <div className="landing-page-footer-left-div">
                            <div className="landing-page-icon-div">
                                <img
                                    src="/gviano-icon.svg"
                                    alt="Company logo"
                                    className="landing-page-footer-icon"
                                />
                                <Typography
                                    variant="title"
                                    weight="emphasis"
                                    color="on-inverse"
                                >
                                    Gviano
                                </Typography>
                            </div>
                            <Typography variant="body" size="small" color="disabled">
                                Table reservations for diners. Launching soon on iOS, Android and the web.
                            </Typography>
                        </div>

                        <div className="landing-page-footer-right-div">
                            <Typography variant="body" weight="emphasis" color="on-inverse" size="medium">Running a restaurant?</Typography>
                            <Typography variant="body" color="disabled" size="medium">
                                The Gviano admin panel is already live. Sign in to manage tables, hours and bookings.
                            </Typography>
                            <CustomButton size="small" onClick={handleBusinessRedirect}>For Restaurants</CustomButton>
                        </div>

                    </div>

                    <Typography variant="body" size="small" color="muted">
                        © {new Date().getFullYear()} Gviano. All rights reserved.
                    </Typography>
                </footer>
            </div>
        </div>
    );
};

export default LandingPage;