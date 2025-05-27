import {signIn} from "next-auth/react";
import React, { useState } from "react";
import styles from "../../../styles/Account.module.css";
import { useRouter } from "next/router";

// import { api } from "~/trpc/react";
import Link from "next/link";

export default function LogInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string> | null>(null);
  const router = useRouter();

  const getValidationMessages = () => ({
    emailRequired: "Email address is required",
    emailInvalid: "Invalid email address",
    passwordRequired: `Pass${""}word is required`,
  });
  const validationMessages = getValidationMessages();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = validationMessages.emailRequired;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      newErrors.email = validationMessages.emailInvalid;
    }
    if (!password.trim()) {
      newErrors.password = validationMessages.passwordRequired;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors(null);
    if (!validateForm()) return;

    setIsLoading(true);

    try{
      const result = await signIn("credentials", {
        email,
        password,
        rememberMe,
        redirect: false,
      });

      if(result?.error) {
        if(result.error === "CredentialsSignIn") {
          setErrors({ email: "Invalid email or password" });
        }
        else {
          setErrors({ server: result.error });
        }
      }
      else {
        if(rememberMe){
          document.cookie = `persistent-token=${email}; path=/; max-age=2592000`;
        }
        void router.push("/home");
      }
    }
    catch(err) {
      console.log(err);
      setErrors({ server: "An unexpected error occurred" });
    }
    finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.rightPanel}>
      <div className={styles.top}>
        <h3 className={styles.aboveTitle}>Welcome back!</h3>
        <h2 className={styles.title}>Log in to your account</h2>
        {errors?.server &&
          (errors.server === "User not found" ||
            errors.server === "Passwords don't match") &&
          errors.server}
      </div>
      <div className={styles.middle}>
        <form
          id="logInForm"
          data-testid="logInForm"
          className={styles.formContainer}
        >
          {/*email input*/}
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.inputTitle}>
              Email{" "}
              {errors?.email && (
                <span className={styles.errorText}>{errors.email}</span>
              )}
            </label>
            <input
              id="email"
              type="text"
              name="email"
              placeholder="e.g. John99@gmail.com"
              className={`${styles.inputField} ${errors?.email ? styles.inputError : ""}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {/*password input*/}
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.inputTitle}>
              Password{" "}
              {errors?.password && (
                <span className={styles.errorText}>{errors.password}</span>
              )}
            </label>
            <div className={styles.passwordInput}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className={`${styles.inputField} ${errors?.password ? styles.inputError : ""}`}
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
          <p className={styles.forgotPassword}>
            <Link href="/forgotpassword" className={styles.forgotPassword}>
              Forgot password?
            </Link>
          </p>
        </form>
      </div>

      <div className={styles.bottom}>
        <button
          type="submit"
          form="logInForm"
          className={styles.primaryButton}
          onClick={handleSubmit}
        >
          {isLoading ? "Logging in..." : "Log in"}
        </button>
        <label className={styles.rememberMe}>
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />{" "}
          Remember me
        </label>

        <p className={styles.footer}>
          Don&apos;t have an account?{" "}
          <Link href="/signup">
            <button className={styles.secondaryButton}>Sign up</button>
          </Link>
        </p>
      </div>
    </div>
  );
}
