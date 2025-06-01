import React, { useState } from "react";
import styles from "../../../styles/Account.module.css";
import Link from "next/link";
import {api} from "~/trpc/react";

export default function ForgotPasswordForm() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const requestResetMutation = api.auth.resetRequest.requestReset.useMutation({
        onSuccess: (data) => {
            setMessage(data.message);
            setError(null);
        },
        onError: (err) => {
            setError(err.message || "Something went wrong.");
            setMessage(null);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setError(null);

        requestResetMutation.mutate({ email });
    };

    return (
        <div className={`${styles.rightPanel} ${styles.resetPasswordPage}`}>
            <div className={styles.top}>
                <h2 className={styles.title}>Forgot password?</h2>
                <p className={styles.belowTitle}>We&apos;ll send you the instructions shortly.</p>
            </div>

            <div className={styles.middle}>
                <form className={styles.formContainer} onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="email" className={styles.inputTitle}>Email</label>
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
                    <button type="submit" className={styles.primaryButton}>Confirm</button>
                </form>

                {message && <p className={styles.successMessage}>{message}</p>}
                {error && <p className={styles.errorMessage}>{error}</p>}
            </div>

            <div className={styles.bottom}>
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
