import "../../components/admin-ui/admin-ui.css";
import "./account-page.css";

import Field from "../../components/admin-ui/field";
import HeartbeatLoader from "../../components/heartbeat-loader/heartbeat-loader";
import { errorMessage } from "../../utility/validation";
import useAccountPageController from "./use-account-page-controller";

const ROLE_LABELS: Record<string, string> = {
    admin: "Administrator",
};

const AccountPage = () => {
    const {
        account,
        organisation,
        isEmailVerified,
        isLoading,
        error,
        passwordForm,
        isChangingPassword,
        handleChangePassword,
    } = useAccountPageController();

    const { values, errors, setField } = passwordForm;

    if (isLoading) return <main className="adm-page"><HeartbeatLoader label="Loading account" /></main>;

    const passwordInput = (key: keyof typeof values, autoComplete: string) => (
        <input
            id={`ap-${key}`}
            type="password"
            className={`adm-input ${errors[key] ? "adm-input--invalid" : ""}`}
            value={values[key]}
            onChange={(event) => setField(key, event.target.value)}
            autoComplete={autoComplete}
            aria-invalid={!!errors[key]}
        />
    );

    return (
        <main className="adm-page">
            <header className="adm-page-header">
                <div className="adm-title-block">
                    <h1 className="adm-h1">Account</h1>
                    <p className="adm-subtitle">Your personal details and sign-in settings</p>
                </div>
            </header>

            {error && <p className="adm-form-error" role="alert">{errorMessage(error, "Could not load your account.")}</p>}

            <div className="account-page-grid">
                {account &&
                    <section aria-labelledby="ap-personal" className="adm-card adm-card--padded">
                        <h2 id="ap-personal" className="adm-card-title">Personal details</h2>
                        <dl className="adm-dl">
                            <dt>Name</dt><dd>{account.name}</dd>
                            <dt>Surname</dt><dd>{account.surname}</dd>
                            <dt>Email</dt>
                            <dd>
                                {account.email}{" "}
                                <span className={`adm-chip adm-chip--${isEmailVerified ? "success" : "warning"}`}>{isEmailVerified ? "Verified" : "Not verified"}</span>
                            </dd>
                            <dt>Phone</dt><dd>{account.phoneNumber}</dd>
                            <dt>Role</dt><dd>{ROLE_LABELS[account.role] ?? account.role}</dd>
                        </dl>
                    </section>}

                {organisation &&
                    <section aria-labelledby="ap-organisation" className="adm-card adm-card--padded">
                        <h2 id="ap-organisation" className="adm-card-title">Organisation</h2>
                        <dl className="adm-dl">
                            <dt>Name</dt><dd>{organisation.orgName}</dd>
                            <dt>Address</dt><dd>{organisation.address}</dd>
                            <dt>Locations</dt><dd>{organisation.singleLocation ? "Single location" : "Multiple locations"}</dd>
                        </dl>
                    </section>}

                <section aria-labelledby="ap-password" className="adm-card adm-card--padded">
                    <h2 id="ap-password" className="adm-card-title">Change password</h2>
                    <form
                        className="account-page-password-form"
                        noValidate
                        onSubmit={(event) => { event.preventDefault(); handleChangePassword(); }}
                    >
                        {errors.form && <p className="adm-form-error" role="alert">{errors.form}</p>}
                        <Field label="Current password" htmlFor="ap-currentPassword" required error={errors.currentPassword}>
                            {passwordInput("currentPassword", "current-password")}
                        </Field>
                        <Field label="New password" htmlFor="ap-newPassword" required hint="At least 8 characters." error={errors.newPassword}>
                            {passwordInput("newPassword", "new-password")}
                        </Field>
                        <Field label="Confirm new password" htmlFor="ap-confirmPassword" required error={errors.confirmPassword}>
                            {passwordInput("confirmPassword", "new-password")}
                        </Field>
                        <button type="submit" className="adm-btn adm-btn--primary account-page-password-submit" disabled={isChangingPassword}>
                            {isChangingPassword ? "Changing…" : "Change password"}
                        </button>
                    </form>
                </section>
            </div>
        </main>
    );
};

export default AccountPage;
