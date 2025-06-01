import React, { useState } from "react";
import styles from "../../../styles/Account.module.css";
import Link from "next/link";
import {api} from "~/trpc/react";

const getForgotPasswordValidationMessages = () => ({
    emailRequired: "Email address is required",
    emailInvalid: "Invalid email address format",
    serverError: "An unexpected error occurred. Please try again.",
});
const forgotPasswordValidationMessages = getForgotPasswordValidationMessages();

export default function ForgotPasswordForm() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string | undefined> | null>(null);

    const requestResetMutation = api.auth.resetRequest.requestReset.useMutation({
        onSuccess: (data) => {
            setMessage(data.message);
            setErrors(null);
        },
        onError: (err) => {
            setErrors({ server: err.message || forgotPasswordValidationMessages.serverError });
            setMessage(null);
        }
    });

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!email.trim()) {
            newErrors.email = forgotPasswordValidationMessages.emailRequired;
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
            newErrors.email = forgotPasswordValidationMessages.emailInvalid;
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setErrors(null);
        if (!validateForm()) {
            return;
        }
        requestResetMutation.mutate({ email });
    };

    return (
        <div className={`${styles.rightPanel} ${styles.resetPasswordPage}`}>
            <div className={styles.top}>
                <h2 className={styles.title}>Forgot password?</h2>
                <p className={styles.belowTitle}>We&apos;ll send you the instructions shortly.</p>
            </div>

            <div className={styles.middle}>
                <form
                    id="forgotPasswordForm"
                    className={styles.formContainer}
                    onSubmit={handleSubmit}
                >
                    <div className={styles.formGroup}>
                        <label
                            htmlFor="email"
                            className={styles.inputTitle}
                        >
                            Email{" "}
                            {errors?.email && (<span className={styles.errorText}>{errors.email}</span>)}
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="e.g. John99@gmail.com"
                            className={styles.inputField}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    {message && <p className={styles.forgotPasswordMessage}>{message}</p>}
                    {errors?.server && <p className={styles.forgotPasswordMessage}>{errors.server}</p>}
                </form>
            </div>

            <div className={styles.bottom}>
                <button
                    form={"forgotPasswordForm"}
                    type="submit"
                    className={styles.primaryButton}
                    disabled={requestResetMutation.isPending}
                >
                    {requestResetMutation.isPending ? "Sending..." : "Confirm"}
                </button>
                <p className={styles.footer}>
                    Back to{" "}
                    <Link href="/login">
                        <button className={styles.secondaryButton}>Log in</button>
                    </Link>
                </p>
            </div>
        </div>
    );
}