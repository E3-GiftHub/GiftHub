import React, { useState } from "react";
import styles from "../../../styles/Account.module.css";
import Link from "next/link";

export default function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  return (
    <div className={`${styles.rightPanel} ${styles.resetPasswordPage}`}>
      <div className={styles.top}>
        <h2 className={styles.title}>Reset password</h2>
      </div>

      <div className={styles.middle}>
        <form
          className={styles.formContainer}
          id="resetPassword"

          onSubmit={(e) => {
            if(password.length < 8) {
              alert("Password must be at least 8 character long.");
              return;
            }

            if(!/\d/.test(password)) {
              alert("Password must contain at least a digit.");
              return;
            }

            if (password !== confirmPassword) {
              alert("Passwords do not match.");
              return;
            }

            e.preventDefault();
            console.log("Password:", password);
            //TODO: submit data
          }}
        >

          {/*new password input*/}
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.inputTitle}>Password</label>
            <div className={styles.passwordInput}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className={styles.inputField}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className={styles.passwordToggleButton}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <img
                  src={showPassword ? "/illustrations/visibilityOff.svg" : "/illustrations/visibility.svg"}
                  alt="password-icon"
                />
              </button>

            </div>
          </div>

          {/*confirm password input*/}
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.inputTitle}>Confirm password</label>
            <div className={styles.passwordInput}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                className={styles.inputField}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className={styles.passwordToggleButton}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <img
                  src={showConfirmPassword ? "/illustrations/visibilityOff.svg" : "/illustrations/visibility.svg"}
                  alt="password-icon"
                />
              </button>
            </div>
          </div>

        </form>
      </div>

      <div className={styles.bottom}>
        <button type="submit" form="resetPassword" className={styles.primaryButton}>Reset password</button>

        <p className={styles.footer}>
          Back to{' '}
          <Link href="/login">
            <button className={styles.secondaryButton}>Log in</button>
          </Link>
        </p>
      </div>
    </div>
  );
}