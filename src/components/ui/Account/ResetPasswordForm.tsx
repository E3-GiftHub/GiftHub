import React, { useState } from "react";
import styles from "./../../../styles/Account.module.css";

export default function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  return (
      <div className={styles.rightPanel}>

        <div className={styles.top}>
          <h2 className={styles.title}>Reset password</h2>
        </div>

        <div className={styles.middle}>
          <form className={styles.formContainer}>
            <div className={styles.formGroup}>
              <label className={styles.inputTitle}>Password</label>
              <div className={styles.passwordInput}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={"Enter your password"}
                  className={styles.inputField}
                />
                <img
                  src={showPassword ? "/illustrations/hide_password.png" : "/illustrations/show_password.png"}
                  alt={"toggle visibility"}
                  className={styles.passwordIcon}
                  onClick={() => setShowPassword((prev) => !prev)}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.inputTitle}>Confirm password</label>
              <div className={styles.passwordInput}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={"Confirm your password"}
                  className={styles.inputField}
                />
                <img
                  src={showConfirmPassword ? "/illustrations/hide_password.png" : "/illustrations/show_password.png"}
                  alt="toggle visibility"
                  className={styles.passwordIcon}
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                />
              </div>
            </div>

          </form>
        </div>

        <div className={styles.bottom}>
          <button className={styles.primaryButton}>Reset password</button>

          <p className={styles.footer}>
            <button className={styles.secondaryButton}>Go to log in</button>
          </p>
        </div>
      </div>
  );
}
