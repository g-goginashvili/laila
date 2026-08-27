import "./admin-auth-page-forgot-password.css";

import * as Yup from 'yup';
import CustomButton from "../../components/custom-button/custom-button";
import Typography from "../../components/typography/typography";
import CustomForm from "../../components/custom-form/custom-form";
import useAdminAuthPageController from './use-admin-auth-page-controller';
import { useState } from "react";

const ForgotPasswordModal = ({ handleClose }: { handleClose: () => void }) => {
    const {
        handlePasswordReset
    } = useAdminAuthPageController();

    const [isClosing, setIsClosing] = useState<boolean>(false);

    return (
        <div
            className={`password-resset-screen${isClosing ? " is-closing" : ""}`}
            onAnimationEnd={(e) => {
                if (isClosing && e.target === e.currentTarget) handleClose();
            }}
        >
            <div className="password-resset-popup">
                <div className="password-resset-popup-decorative-line" />
                <Typography
                    variant="title"
                    color="primary"
                    weight="emphasis"
                >
                    Resset your password
                </Typography>
                <Typography
                    variant="body"
                    color="secondary"
                    size="medium"
                >
                    Please enter your email to reset your password
                </Typography>
                <CustomForm
                    key="ressetPasswordCustomForm"
                    formName="ressetPasswordCustomForm"
                    initialValues={{ email: "" }}
                    validationSchema={Yup.object().shape({
                        email: Yup.string().email("Invalid email").required("Required"),
                    })}
                    inputFields={[{ name: "email", type: "email", label: "Email", width: "full" }]}
                    onSubmit={(values) => { handlePasswordReset(values.email) }}
                />
                <CustomButton
                    isFitContent={false}
                    type="submit"
                    form="ressetPasswordCustomForm"
                    className="password-resset-verification-button"
                >
                    Send Verification Email
                </CustomButton>
                <CustomButton
                    variant="text"
                    onClick={() => { setIsClosing(true) }}
                    className="password-resset-return-button"
                >
                    Close
                </CustomButton>
            </div>
        </div>
    );
};

export default ForgotPasswordModal;