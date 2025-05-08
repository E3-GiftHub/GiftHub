import React, { useState } from "react";
import styles from "./../../../styles/Account.module.css";
import { api } from "~/trpc/react";
import {useRouter} from "next/router";



export default function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
    email: ""
  });

  const [errors, setErrors] = useState<string | null>(null)
  const router = useRouter()

  const update = api.auth.update.update.useMutation({
    onSuccess: () => {
      router.push("/login");
    },
    onError: (err) => {
      setErrors(err.message);
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors(null);
    update.mutate(formData);
  };


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
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
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
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
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
          <button
            className={styles.primaryButton}
            onClick={handleSubmit}
          >
            {update.isPending? "Loading...": "Reset password"}
          </button>

          <p className={styles.footer}>
            Back to
            <a href="/login">
              <button className={styles.secondaryButton}>Log in</button>
            </a>
          </p>
        </div>
      </div>
  );
}
