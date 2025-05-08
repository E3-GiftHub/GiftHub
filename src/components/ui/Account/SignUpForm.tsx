import React, { useState } from "react";
import styles from "./../../../styles/Account.module.css";
import { api } from "~/trpc/react";
import {useRouter} from "next/router";
import { signupRouter } from "~/server/api/routers/userManagement/signup";


export default function SignupForm() {

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  })

  const [errors, setErrors] = useState<string | null>(null)
  const router = useRouter()

  const signupMutation = api.auth.signup.signup.useMutation({
    onSuccess: () => {
      router.push("/login");
    },
    onError: (err) => {
      setErrors(err.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors(null);
    signupMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }


  return (
      <div className={styles.rightPanel}>

        <div className={styles.top}>
          <h3 className={styles.aboveTitle}>Welcome to GiftHub!</h3>
          <h2 className={styles.title}>Create your account</h2>
        </div>

        <div className={styles.middle}>
          {errors && (<div className="txt-red-500">
            {errors}
          </div>)}

          <form className={styles.formContainer}>

            <div className={styles.formGroup}>
              <label className={styles.inputTitle}>Username</label>
              <input
                type="text"
                name="username"
                placeholder="e.g. John99"
                className={styles.inputField}
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.inputTitle}>Email</label>
              <input
                type="text"
                name="email"
                placeholder="e.g. John99@gmail.com"
                className={styles.inputField}
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.inputTitle}>Password</label>
              <div className={styles.passwordInput}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder={"Enter your password"}
                  className={styles.inputField}
                  value={formData.password}
                  onChange={handleChange}
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
                  name="confirmPassword"
                  placeholder={"Confirm your password"}
                  className={styles.inputField}
                  value={formData.confirmPassword}
                  onChange={handleChange}
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
            type="submit"
            className={styles.primaryButton}
            onClick={handleSubmit}
          >
            {signupMutation.isPending? "Loading...": "Sign up"}
          </button>

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