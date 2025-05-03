import React from "react";
import styles from "./../../../styles/Account.module.css";

export default function ForgotPasswordForm() {
  return (
      <div className={styles.rightPanel}>

        <div className={styles.top}>
          <h2 className={styles.title}>Forgot password?</h2>
          <p className={styles.belowTitle}>We'll send you the instructions shortly.</p>
        </div>

        <div className={styles.middle}>
          <form className={styles.formContainer}>
            <div className={styles.formGroup}>
              <label className={styles.inputTitle}>Email</label>
              <input
                type="text"
                placeholder="e.g. John99@gmail.com"
                className={styles.inputField}
              />
            </div>
          </form>
        </div>

        <div className={styles.bottom}>
          <button className={styles.primaryButton}>Confirm</button>

          <p className={styles.footer}>
            <button className={styles.secondaryButton}>Go back to log in</button>
          </p>
        </div>
      </div>
  );
}
