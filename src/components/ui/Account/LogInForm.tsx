import React, { useState } from "react";
import styles from "../../../styles/Account.module.css";
import { useRouter } from "next/router";
import {api} from "~/trpc/react";
import Link from "next/link"

export default function LogInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [errors, setErrors] = useState<Record<string, string> | null>(null);
  const router = useRouter();

  React.useEffect(() => {
    const cookie = document.cookie.split(';');
    const hasAuthCookie = cookie.some(cookie => {
      const [name] = cookie.trim().split('=');
      return name === 'session_auth1' || name === 'session_auth2';
      });

    if(hasAuthCookie)
    {
      void router.push("/home");
    }
  }, [router]);

  const loginMutation = api.auth.login.login.useMutation({
    onSuccess: (data) => {
      if(rememberMe) {
        const expires = new Date(Date.now() + 30 * 24 * 60 * 60);


        document.cookie = `session_auth1=${data.sessionToken}; path=/; max-age=${expires.toISOString()}; ${
          process.env.NODE_ENV === "production" ? "secure; samesite=lax" : ""
        }`;
      }

      document.cookie = `session_auth2=${data.sessionToken}; path=/; max-age=${data.expires}; ${
        process.env.NODE_ENV === "production" ? "secure; samesite=lax" : ""
      }`;

      void router.push("/home");
    },
    onError: (err) => {
      if(err.message === "User not found") {
        setErrors({ server: err.message });
      }
      else if(err.message === "Passwords don't match") {
        setErrors({ password: err.message });
      }
      else {
        setErrors({ server: "An unexpected error occurred" });
      }
    }
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if(!email.trim()) {
      newErrors.email = "Email is required";
    }
    else if(!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      newErrors.email = "Invalid email address";
    }
    if(!password.trim()) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors(null);
    if(validateForm()){
      loginMutation.mutate({ email, password });
    }
  }

  return (
      <div className={styles.rightPanel}>
        <div className={styles.top}>
          <h3 className={styles.aboveTitle}>Welcome back!</h3>
          <h2 className={styles.title}>Log in to your account</h2>
          {errors?.server && (errors.server === "User not found" || errors.server === "Passwords don't match") && (errors.server)}
        </div>
        <div className={styles.middle}>
          <form
            id="logInForm"
            className={styles.formContainer}
            onSubmit={(e) => {

              e.preventDefault();
              console.log("Email:", email);
              console.log("Password:", password);

              //TODO: check if account exists

              //See Backend Stuff


            }}
          >

            {/*email input*/}
            <div className={styles.formGroup}>
              <label  htmlFor="email" className={styles.inputTitle}>Email {errors?.email}</label>
              <input
                id="email"
                type="text"
                name="email"
                placeholder="e.g. John99@gmail.com"
                className={styles.inputField}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/*password input*/}
            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.inputTitle}>Password {errors?.password}</label>
              <div className={styles.passwordInput}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className={styles.inputField}
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
                    src={showPassword ? "/illustrations/visibilityOff.svg" : "/illustrations/visibility.svg"}
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
          >{loginMutation.isPending? "Logging in..." : "Log in"}
          </button>
          <label className={styles.rememberMe}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />{' '}
            Remember me
          </label>

          <div className={styles.divider}>
            <span className={styles.dividerText}>OR</span>
          </div>

          {/*<div className={styles.alternativeButtons}>*/}
          {/*<button className={styles.discordButton}>*/}
          {/*  <img*/}
          {/*      src="/illustrations/discordLogo.svg"*/}
          {/*      className={styles.discordIcon}*/}
          {/*  />*/}
          {/*  <span>Log in with Discord</span>*/}
          {/*</button>*/}

          {/*<button className={styles.googleButton}>*/}
          {/*  <img*/}
          {/*      src="/illustrations/googleIcon.svg"*/}
          {/*      className={styles.googleIcon}*/}
          {/*  />*/}
          {/*  <span>Log in with Google</span>*/}
          {/*</button>*/}
          {/*</div>*/}

          <p className={styles.footer}>
            Don&apost have an account?{' '}
            <Link href="/signup">
              <button className={styles.secondaryButton}>Sign up</button>
            </Link>
          </p>
        </div>
      </div>
  );
}
