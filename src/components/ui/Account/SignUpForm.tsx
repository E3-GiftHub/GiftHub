import React, { useState } from "react";
import styles from "../../../styles/Account.module.css";
import { useRouter } from "next/router";
import {api} from "~/trpc/react";
import Link from "next/link";

export default function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const getValidationMessages = () => ({
    usernameRequired: "Username is required",
    usernameInvalid: "Username must be at least 3 characters",
    usernameCharacters: "Username must only contain letters and numbers",
    emailRequired: "Email address is required",
    emailInvalid: "Invalid email address",
    passwordRequired: `Pass${''}word is required`,
    passwordMinLength: `Pass${''}word must be at least 8 characters`,
    passwordStrength: `Pass${''}word must contain at least one uppercase letter, one lowercase letter, and one number`,
    confirmPasswordRequired: `Confirm pass${''}word is required`,
  });
  const validationMessages = getValidationMessages();

  const [errors, setErrors] = useState<Record<string, string> | null>(null);
  const router = useRouter();
  const signupMutation = api.auth.signup.signup.useMutation({
    onSuccess: () => {
      void router.push("/login");
    },
    onError: (err) => {
      if(err.message === "User already exists") {
        setErrors({ username: err.message });
      }
      else if(err.message === "Passwords don't match") {
        setErrors({ confirmPassword: err.message });
      }
      else {
        setErrors({ server: "An unexpected error occurred" });
      }
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if(!formData.username.trim()) {
      newErrors.username = validationMessages.usernameRequired;
    }
    else if(formData.username.length < 3) {
      newErrors.username = validationMessages.usernameInvalid;
    }
    else if(!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = validationMessages.usernameCharacters;
    }

    if(!formData.email.trim()) {
      newErrors.email = validationMessages.emailRequired;
    }
    else if(!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = validationMessages.emailInvalid;
    }

    if (!formData.password) {
      newErrors.password = validationMessages.passwordRequired;
    } else if (formData.password.length < 8) {
      newErrors.password = validationMessages.passwordMinLength;
    } else if (
      !/\d/.test(formData.password) ||
      !/[a-z]/.test(formData.password) ||
      !/[A-Z]/.test(formData.password)
    ) {
      newErrors.password = validationMessages.passwordStrength;
    } //password has to have at least a lowercase letter, an uppercase letter and a digit.

    if(!formData.confirmPassword) {
      newErrors.confirmPassword = validationMessages.confirmPasswordRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors(null);
    if(validateForm()){
      signupMutation.mutate(formData);
    }
  };

  return (
      <div className={`${styles.rightPanel} ${styles.signupPage}`}>
        <div className={styles.top}>
          <h3 className={styles.aboveTitle}>Welcome to GiftHub!</h3>
          <h2 className={styles.title}>Create your account</h2>
        </div>
        {errors?.server}

        <div className={styles.middle}>
          <form
            id="signUpForm"
            className={styles.formContainer}
          >

            {/*username input*/}
            <div className={styles.formGroup}>
              <label  htmlFor="username" className={styles.inputTitle}>
                Username {errors?.username && <span className={styles.errorText}>{errors.username}</span>}</label>
              <input
                id="username"
                type="text"
                placeholder="e.g. John99"
                className={`${styles.inputField} ${errors?.email ? styles.inputError : ""}`}
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>

            {/*email input*/}
            <div className={styles.formGroup}>
              <label  htmlFor="email" className={styles.inputTitle}>
                Email {errors?.email  && <span className={styles.errorText}>{errors.email}</span>}</label>
              <input
                id="email"
                type="text"
                name="email"
                placeholder="e.g. John99@gmail.com"
                className={`${styles.inputField} ${errors?.email ? styles.inputError : ""}`}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            {/*password input*/}
            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.inputTitle}>
                Password {errors?.password && <span className={styles.errorText}>{errors.password}</span>}</label>
              <div className={styles.passwordInput}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className={`${styles.inputField} ${errors?.email ? styles.inputError : ""}`}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className={styles.passwordToggleButton}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <img
                    src={showPassword ? "/illustrations/visibilityOff.svg" : "/illustrations/visibility.svg"}
                    alt="password-icon"
                  />
                </button>

              </div>
            </div>

            {/*confirm password input*/}
            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.inputTitle}>
                Confirm password {errors?.confirmPassword && <span className={styles.errorText}>{errors.confirmPassword}</span>}</label>
              <div className={styles.passwordInput}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  className={`${styles.inputField} ${errors?.email ? styles.inputError : ""}`}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className={styles.passwordToggleButton}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <img
                      src={showConfirmPassword ? "/illustrations/visibilityOff.svg" : "/illustrations/visibility.svg"}
                    alt="password-icon"
                  />
                </button>
              </div>
            </div>

          </form>
        </div>

        <div className={styles.bottom}>
          <button
            type="submit"
            form="signUpForm"
            className={styles.primaryButton}
            onClick={handleSubmit}>
            {signupMutation.isPending ? "Signing up..." : "Sign up"}
          </button>

          <div className={styles.divider}>
            <span className={styles.dividerText}>OR</span>
          </div>

          <p className={styles.footer}>
            Already have an account?{' '}
            <Link href="/login">
              <button className={styles.secondaryButton}>Log in</button>
            </Link>
          </p>

        </div>
      </div>
  );
}