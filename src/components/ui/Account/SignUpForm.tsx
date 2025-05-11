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
    else if(formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Passwords do not match";
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
      <div className={styles.rightPanel}>

        <div className={styles.top}>
          <h3 className={styles.aboveTitle}>Welcome to GiftHub!</h3>
          <h2 className={styles.title}>Create your account</h2>
        </div>

        <div className={styles.middle}>
          {errors?.server && (<div className="txt-red-500">
            {errors.server}
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
              {errors?.username && (<div className="txt-red-500">
                {errors.username}
              </div>)}
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
              {errors?.email && (<div className="txt-red-500">
                {errors.email}
              </div>)}
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
                {errors?.password && (<div className="txt-red-500">
                  {errors.password}
                </div>)}
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
                {errors?.confirmPassword && (<div className="txt-red-500">
                  {errors.confirmPassword}
                </div>)}
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