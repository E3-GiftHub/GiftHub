import React, { useState } from "react";
import styles from "../../../styles/Account.module.css";
import Link from "next/link";

export default function ForgotPasswordForm() {
  const [email] = useState("");
  return (
    <div className={`${styles.rightPanel} ${styles.resetPasswordPage}`}>
    <div className={styles.top}>
          <h2 className={styles.title}>Forgot password?</h2>
          <p className={styles.belowTitle}>We&#39;ll send you the instructions shortly.</p>
        </div>

        <div className={styles.middle}>
          <form
            className={styles.formContainer}
            id="forgotPassword"
            onSubmit={(e) => {

              e.preventDefault();
              console.log("Email:", email);

              //TODO: check if email exists in database
            }}
          >

            {/*email input*/}
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.inputTitle}>Email</label>
              <input
                id="email"
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
            Back to{' '}
            <Link href="/login">
              <button className={styles.secondaryButton}>Log in</button>
            </Link>
          </p>

        </div>
      </div>
  );
}
