import React, { useState } from "react";
import { useRouter } from "next/router";
import styles from "../../../styles/Account.module.css";
import { api } from "~/trpc/react";
import { resetPasswordMessages } from "~/models/messages";
import { useSession } from "next-auth/react";

export default function ResetPasswordFormLogged() {
  const resetPasswordValidationMessages = resetPasswordMessages;
  const router = useRouter();
  const { data: session } = useSession();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<
    string,
    string | undefined
  > | null>(null);

  const resetPasswordMutation = api.auth.update.updateLogged.useMutation({
    onSuccess: (data) => {
      setMessage("Your password has been successfully reset!");
      setErrors(null);
      setTimeout(() => {
        void router.push("/login");
      }, 3000);
    },
    onError: (err) => {
      const newErrors: Record<string, string> = {};
      const errorText = err.message || "Failed to reset password.";

      if (errorText === "Passwords don't match") {
        newErrors.confirmPassword =
          resetPasswordValidationMessages.passwordMismatch;
      } else if (errorText.includes("Invalid or expired password reset link")) {
        newErrors.token = errorText;
      } else {
        newErrors.server = resetPasswordValidationMessages.serverError;
      }
      setErrors(newErrors);
      setMessage(null);
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!password) {
      newErrors.password = resetPasswordValidationMessages.passwordRequired;
    } else if (password.length < 8) {
      newErrors.password = resetPasswordValidationMessages.passwordMinLength;
    } else if (!/\d/.test(password)) {
      newErrors.password =
        resetPasswordValidationMessages.passwordStrengthDigit;
    } else if (!/[a-z]/.test(password)) {
      newErrors.password =
        resetPasswordValidationMessages.passwordStrengthLowercase;
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password =
        resetPasswordValidationMessages.passwordStrengthUppercase;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword =
        resetPasswordValidationMessages.passwordRequired;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword =
        resetPasswordValidationMessages.passwordMismatch;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setErrors(null);

    if (!validateForm()) {
      return;
    }

    resetPasswordMutation.mutate({
      username: session?.user?.name ?? "",
      pass: password,
      word: confirmPassword,
    });
  };

  return (
    <div className={`${styles.rightPanel} ${styles.resetPasswordPage}`}>
      <div className={styles.top}>
        <h2 className={styles.title}>Reset password</h2>
      </div>

      <div className={styles.middle}>
        <form
          className={styles.formContainer}
          id="resetPassword"
          onSubmit={handleSubmit}
        >
          {/* New password input */}
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.inputTitle}>
              Password{" "}
            </label>
            {errors?.password && (
              <div className={styles.errorText} role={"alert"}>
                {errors.password}
              </div>
            )}
            <div className={styles.passwordInput}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your new password"
                className={styles.inputField}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className={styles.passwordToggleButton}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <img
                  src={
                    showPassword
                      ? "/illustrations/visibilityOff.svg"
                      : "/illustrations/visibility.svg"
                  }
                  alt="password-icon"
                />
              </button>
            </div>
          </div>

          {/* Confirm password input */}
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.inputTitle}>
              Confirm password
            </label>
            {errors?.confirmPassword && (
              <div className={styles.errorText} role={"alert"}>
                {errors.confirmPassword}
              </div>
            )}
            <div className={styles.passwordInput}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your new password"
                className={styles.inputField}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className={styles.passwordToggleButton}
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                <img
                  src={
                    showConfirmPassword
                      ? "/illustrations/visibilityOff.svg"
                      : "/illustrations/visibility.svg"
                  }
                  alt="password-icon"
                />
              </button>
            </div>
          </div>

          {message && <p className={styles.forgotPasswordMessage}>{message}</p>}
          {errors?.server && (
            <p className={styles.forgotPasswordMessage}>{errors.server}</p>
          )}
          {errors?.token && (
            <p className={styles.forgotPasswordMessage}>{errors.token}</p>
          )}
        </form>
      </div>

      <div className={styles.bottom}>
        <button
          type="submit"
          form="resetPassword"
          className={styles.primaryButton}
          disabled={resetPasswordMutation.isPending}
        >
          {resetPasswordMutation.isPending ? "Resetting..." : "Reset password"}
        </button>
      </div>
    </div>
  );
}
