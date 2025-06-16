import { signIn } from "next-auth/react";
import React, { useState } from "react";
import styles from "../../../styles/Account.module.css";
import { useRouter } from "next/router";
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

    try {
      const result = await signIn("credentials", {
        email,
        password,
        rememberMe,
        redirect: false,
      });

      if (result?.error) {
        // Check if this is an unverified email error
        // Most common cases from NextAuth for unverified email
        if (
          result.error === "Configuration" && email.trim()
        ) {
          // NextAuth returns "Configuration" error for custom auth errors
          setErrors({ 
            unverifiedEmail: email
          });
        } else if (
          result.error === "CallbackRouteError" && email.trim()
        ) {
          setErrors({ 
            unverifiedEmail: email
          });
        } else if (
          result.error.includes("UNVERIFIED_EMAIL") || 
          result.error === "UNVERIFIED_EMAIL"
        ) {
          setErrors({ 
            unverifiedEmail: email
          });
        } else if (result.error === "CredentialsSignin" || result.error === "CredentialsSignIn") {
          setErrors({ email: "Invalid email or password" });
        } else {
          setErrors({ server: `Login failed: ${result.error}` });
        }
      } else {
        if (rememberMe) {
          document.cookie = `persistent-token=${email}; path=/; max-age=2592000`;
        }
        void router.push("/home");
      }
    } catch {
      setErrors({ server: "An unexpected error occurred" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.rightPanel}>
      <div className={styles.top}>
        <h3 className={styles.aboveTitle}>Welcome back!</h3>
        <h2 className={styles.title}>Log in to your account</h2>
        
        {/* Server errors */}
        {errors?.server && (
          <div className={styles.forgotPasswordMessage} style={{ 
            backgroundColor: "#ef4444", 
            color: "white", 
            padding: "1rem", 
            borderRadius: "8px",
            marginTop: "1rem",
            textAlign: "center"
          }}>
            <p style={{ margin: 0 }}>❌ {errors.server}</p>
          </div>
        )}
        
        {/* Email verification error */}
        {errors?.unverifiedEmail && (
          <div className={styles.forgotPasswordMessage} style={{ 
            backgroundColor: "#f59e0b", 
            color: "white", 
            padding: "1rem", 
            borderRadius: "8px",
            marginTop: "1rem",
            textAlign: "center"
          }}>
            <p style={{ margin: "0 0 10px 0" }}>⚠️ Please verify your email first</p>
            <Link href={`/resend-verification?email=${encodeURIComponent(errors.unverifiedEmail)}`}>
              <button className={styles.secondaryButton} style={{ 
                color: "#FFFFFF", 
                textDecoration: "underline",
                fontSize: "0.9em",
                background: "transparent",
                border: "1px solid white"
              }}>
                Resend verification email
              </button>
            </Link>
          </div>
        )}
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
            <Link href="/password-forgot" className={styles.forgotPassword}>
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
