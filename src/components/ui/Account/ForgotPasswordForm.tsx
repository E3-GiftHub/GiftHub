import React, { useState } from "react";
import styles from "../../../styles/Account.module.css";
import Link from "next/link";

export default function ForgotPasswordForm() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
          const response = await fetch("/api/forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });

          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const data = await response.json();

            if (response.ok) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
                setMessage(data.message);
                setError(null);
            } else {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
                setError(data.message ?? "Something went wrong.");
                setMessage(null);
            }
        } catch (err) {
            console.error("Error:", err);
            setError("Failed to send reset email.");
            setMessage(null);
        }
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
