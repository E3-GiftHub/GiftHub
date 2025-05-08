import styles from "./../../../styles/Account.module.css";
import React, { useState } from "react";
import { useRouter } from "next/router";
import {api} from "~/trpc/react";


export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [errors, setErrors] = useState<string | null>(null)
  const router = useRouter()

  const loginMutation = api.auth.login.login.useMutation({
    onSuccess: () => {
      router.push("/home");
    },
    onError: (err) => {
      setErrors(err.message);
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors(null);
    loginMutation.mutate(formData);
  }

  return (
      <div className={styles.rightPanel}>
        <div className={styles.top}>
          <h3 className={styles.aboveTitle}>Welcome back!</h3>
          <h2 className={styles.title}>Log in to your account</h2>
        </div>

        <div className={styles.middle}>
          <form className={styles.formContainer}>
            <div className={styles.formGroup}>
              <label className={styles.inputTitle}>Email</label>
              <input
                type="text"
                name="email"
                placeholder="e.g. John99@gmail.com"
                className={styles.inputField}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.inputTitle}>Password</label>
              <div className={styles.passwordInput}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className={styles.inputField}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <img
                  src={
                    showPassword
                      ? "/illustrations/hide_password.png"
                      : "illustrations/show_password.png"
                  }
                  alt="toggle visibility"
                  className={styles.passwordIcon}
                  onClick={() => setShowPassword((prev) => !prev)}
                />
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
          <button
            type="submit"
            className={styles.primaryButton}
            onClick={handleSubmit}
          >
            {loginMutation.isPending? "Loading...": "Log in"}
          </button>

          <p className={styles.footer}>
            Don't have an account?
            <a href="/signup">
              <button className={styles.secondaryButton}>Sign up</button>
            </a>
          </p>

        </div>
      </div>
  );
}
