import React, { useState } from "react";
import styles from "../../../styles/Account.module.css";

export default function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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

              if(username.length < 6) {
                alert("Username must be at least 8 character long.");
                return;
              }

              if (!emailRegex.test(email)) {
                alert("Please enter a valid email address.");
                return;
              }

              if(password.length < 8) {
                alert("Password must be at least 8 character long.");
                return;
              }

              if(!/\d/.test(password)) {
                alert("Password must contain at least a digit.");
                return;
              }

              if (password !== confirmPassword) {
                alert("Passwords do not match.");
                return;
              }

              e.preventDefault();
              console.log("Username:", username);
              console.log("Email:", email);
              console.log("Password:", password);
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
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
          <button type="submit" form="signUpForm" className={styles.primaryButton}>Sign up</button>

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