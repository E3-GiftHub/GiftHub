import React, { useState } from "react";
import styles from "../../../styles/Account.module.css";
import { useRouter } from "next/router";
import {api} from "~/trpc/react";

export default function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });


  const [errors, setErrors] = useState<Record<string, string> | null>(null);

  const router = useRouter();

  const signupMutation = api.auth.signup.signup.useMutation({
    onSuccess: () => {
      router.push("/login");
    },
    onError: (err) => {
      if(err.message === "User already exists") {
        setErrors({ server: err.message });
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

    //username validation
    if(!formData.username.trim()) {
      newErrors.username = "Username is required";
    }
    else if(formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }
    else if(!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = "Username must contain only letters and numbers";
    }

    //email validation
    if(!formData.email.trim()) {
      newErrors.email = "Email is required";
    }
    else if(!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    //password validation
    if(!formData.password) {
      newErrors.password = "A password is required";
    }
    else if(formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    else if(!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/g.test(formData.password)) {
      newErrors.password = "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    }

    //confirm password validation
    if(!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  return (
      <div className={`${styles.rightPanel} ${styles.signupPage}`}>
        <div className={styles.top}>
          <h3 className={styles.aboveTitle}>Welcome to GiftHub!</h3>
          <h2 className={styles.title}>Create your account</h2>
        </div>

        <div className={styles.middle}>
          <form
            id="signUpForm"
            className={styles.formContainer}
            onSubmit={(e) => {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              /*
              * rules for email:
              * ^[^\s@]+ -> at least a non-whitespace, non-@ character before @
              * @[^\s@]+ -> an @ followed by a non-whitespace character
              * \.[^\s@]+$ -> a period followed by some non-whitespace character
              * */

              if(formData.username.length < 6) {
                alert("Username must be at least 8 character long.");
                return;
              }

              if (!emailRegex.test(formData.email)) {
                alert("Please enter a valid email address.");
                return;
              }

              if(formData.password.length < 8) {
                alert("Password must be at least 8 character long.");
                return;
              }

              if(!/\d/.test(formData.password)) {
                alert("Password must contain at least a digit.");
                return;
              }

              if (formData.password !== formData.confirmPassword) {
                alert("Passwords do not match.");
                return;
              }

              e.preventDefault();
              console.log("Username:", formData.username);
              console.log("Email:", formData.email);
              console.log("Password:", formData.password);
              //TODO: submit data
            }}
          >

            {/*username input*/}
            <div className={styles.formGroup}>
              <label  htmlFor="username" className={styles.inputTitle}>Username</label>
              <input
                id="username"
                type="text"
                placeholder="e.g. John99"
                className={styles.inputField}
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            {/*email input*/}
            <div className={styles.formGroup}>
              <label  htmlFor="email" className={styles.inputTitle}>Email</label>
              <input
                id="email"
                type="text"
                placeholder="e.g. John99@gmail.com"
                className={styles.inputField}
                value={formData.email}
                onChange={handleChange}
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
                  value={formData.password}
                  onChange={handleChange}
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
              <label htmlFor="password" className={styles.inputTitle}>Confirm password</label>
              <div className={styles.passwordInput}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  className={styles.inputField}
                  value={formData.confirmPassword}
                  onChange={handleChange}
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
          <button type="submit" form="signUpForm" className={styles.primaryButton} onSubmit={handleSubmit}>Sign up</button>

          <div className={styles.divider}>
            <span className={styles.dividerText}>OR</span>
          </div>

          <div className={styles.alternativeButtons}>
            <button className={styles.discordButton}>
              <img
                src="/illustrations/discordLogo.svg"
                className={styles.discordIcon}
              />
              <span>Sign up with Discord</span>
            </button>

            <button className={styles.googleButton}>
              <img
                src="/illustrations/googleIcon.svg"
                className={styles.googleIcon}
              />
              <span>Sign up with Google</span>
            </button>
          </div>

          <p className={styles.footer}>
            Already have an account?{' '}
            <a href="/login">
              <button className={styles.secondaryButton}>Log in</button>
            </a>
          </p>

        </div>
      </div>
  );
}