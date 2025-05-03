import React, { useState } from "react";
import styles from "./../../../styles/Account.module.css";


export default function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  return (
      <div className={styles.rightPanel}>

        <div className={styles.top}>
          <h3 className={styles.aboveTitle}>Welcome to GiftHub!</h3>
          <h2 className={styles.title}>Create your account</h2>
        </div>

        <div className={styles.middle}>
          <form className={styles.formContainer}>

            <div className={styles.formGroup}>
              <label className={styles.inputTitle}>Username</label>
              <input type="text" placeholder="e.g. John99" className={styles.inputField}/>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.inputTitle}>Email</label>
              <input type="text" placeholder="e.g. John99@gmail.com" className={styles.inputField}/>
            </div>

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
          <button className={styles.primaryButton}>Sign up</button>

          <p className={styles.footer}>
            Already have an account?
            <a href="/login">
              <button className={styles.secondaryButton}>Log in</button>
            </a>
          </p>

        </div>
      </div>
  );
}