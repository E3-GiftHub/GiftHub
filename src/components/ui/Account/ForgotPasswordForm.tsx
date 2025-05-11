import React from "react";
import styles from "./../../../styles/Account.module.css";
import router from "next/router";
import { useRouter } from "next/router";
import { api } from "~/trpc/react";
import {useState} from "react";


export default function ForgotPasswordForm() {
  const [formData, setFormData] = useState({
    email: "",
  })

  const [errors, setErrors] = useState<string | null>(null)
  const router = useRouter()

  const recoverMutation = api.auth.recover.findByEmail.useMutation({
    onSuccess: () => {
      router.push(`/resetpassword?email=${encodeURIComponent(formData.email)}`);
    },
    onError: (err) => {
      setErrors(err.message);
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors(null);
    recoverMutation.mutate(formData);
  }




  return (
     <div className={styles.rightPanel}>

        <div className={styles.top}>
          <h2 className={styles.title}>Forgot password?</h2>
          <p className={styles.belowTitle}>We'll send you the instructions shortly.</p>
        </div>

        <div className={styles.middle}>
          <form className={styles.formContainer}>
            <div className={styles.formGroup}>
              <label className={styles.inputTitle}>Email</label>
              <input
                type="text"
                placeholder="e.g. John99@gmail.com"
                className={styles.inputField}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </form>
        </div>

        <div className={styles.bottom}>
          <button
            type="submit"
            onClick={handleSubmit}
            className={styles.primaryButton}
          >
            {recoverMutation.isPending? "Loading...": "Confirm"}
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
