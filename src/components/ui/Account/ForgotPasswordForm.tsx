import React, { useState } from "react";
import styles from "../../../styles/Account.module.css";
import Link from "next/link";
import { api } from "~/trpc/react";
import { forgotPasswordMessages } from "~/models/messages";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string | undefined> | null>(null);

  const requestResetMutation = api.auth.resetRequest.requestReset.useMutation({
    onSuccess: () => {
      setMessage(forgotPasswordMessages.success); 
      setErrors(null);
    },
    onError: (err) => {
      setErrors({ server: err.message || forgotPasswordMessages.serverError });
      setMessage(null);
    }
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) {
      newErrors.email = forgotPasswordMessages.emailRequired;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      newErrors.email = forgotPasswordMessages.emailInvalid;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const isValid = validateForm();
    if (isValid) {
      requestResetMutation.mutate({ email });
    }
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
          data-testid="forgot-password-form"
          className={styles.formContainer}
          onSubmit={handleSubmit}
        >
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
            {errors?.email && (
              <div className={styles.errorText} role="alert">
                {errors.email}
              </div>
            )}
          </div>

          {message && (
            <p className={styles.forgotPasswordMessage} role="alert">
              {message}
            </p>
          )}
          {errors?.server && (
            <p className={styles.forgotPasswordMessage} role="alert">
              {errors.server}
            </p>
          )}
        </form>
      </div>

      <div className={styles.bottom}>
        <button
          form="forgotPasswordForm"
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
