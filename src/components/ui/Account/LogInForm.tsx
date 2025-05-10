import styles from "./../../../styles/Account.module.css";
import React, { useState } from "react";

export default function LogInForm() {
  const [showPassword, setShowPassword] = useState(false);
  return (
      <div className={styles.rightPanel}>
        <div className={styles.top}>
          <h3 className={styles.aboveTitle}>Welcome back!</h3>
          <h2 className={styles.title}>Log in to your account</h2>
        </div>
        <div className={styles.middle}>
          <form className={styles.formContainer}>

            {/*email input*/}
            <div className={styles.formGroup}>
              <label  htmlFor="email" className={styles.inputTitle}>Email</label>
              <input
                id="email"
                type="text"
                placeholder="e.g. John99@gmail.com"
                className={styles.inputField}
              />
            </div>

            {/*password input*/}
            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.inputTitle}>Password</label>
              <div className={styles.passwordInput}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className={styles.inputField}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className={styles.passwordToggleButton}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <img
                    src={showPassword ? "/illustrations/hide_password.png" : "/illustrations/show_password.png"}
                    alt="password-icon"
                  />
                </button>

              </div>
            </div>
            <p className={styles.forgotPassword}>
              <a href="/forgotpassword" className={styles.forgotPassword}>
                Forgot password?
              </a>
            </p>

          </form>
        </div>
        <div className={styles.bottom}>
          <button className={styles.primaryButton}>Log in</button>

          <label className={styles.rememberMe}>
            <input type="checkbox" />{' '}
            Remember me
          </label>

          <p className={styles.footer}>
            Don't have an account?{' '}
            <a href="/signup">
              <button className={styles.secondaryButton}>Sign up</button>
            </a>
          </p>
        </div>
      </div>
  );
}
