import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import styles from "../styles/Account.module.css";
import "../styles/globals.css";
import AccountUI from "~/components/ui/Account/AccountUI";
import { api } from "~/trpc/react";
import Link from "next/link";

export default function ResendVerification() {
  const router = useRouter();
  const { email: queryEmail } = router.query;
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'rate-limited'>('idle');
  const [message, setMessage] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string> | null>(null);
  const [countdown, setCountdown] = useState<number>(0);

  const resendMutation = api.auth.emailVerification.resendVerification.useMutation({
    onSuccess: (data) => {
      setStatus('success');
      setMessage(data.message);
      setErrors(null);
    },
    onError: (error) => {
      if (error.message === 'Please wait 5 minutes before requesting another verification email.') {
        setStatus('rate-limited');
        setMessage('You can only request a new verification email once every 5 minutes.');
        // Start countdown from 5 minutes (300 seconds)
        setCountdown(300);
      } else if (error.message === 'ALREADY_VERIFIED') {
        setStatus('error');
        setMessage('This email is already verified. You can log in now.');
      } else if (error.message === 'EMAIL_SEND_FAILED') {
        setErrors({ server: 'Failed to send verification email. Please try again.' });
        setStatus('error');
      } else {
        setErrors({ server: 'An error occurred. Please try again.' });
        setStatus('error');
      }
    },
  });

  // Countdown timer for rate limiting
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setStatus('idle');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  // Set email from query parameter
  useEffect(() => {
    if (queryEmail && typeof queryEmail === 'string') {
      setEmail(decodeURIComponent(queryEmail));
    }
  }, [queryEmail]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      newErrors.email = "Invalid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors(null);
    setMessage('');
    
    if (!validateForm()) return;

    resendMutation.mutate({ email });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.fullPageWrapper}>
      <div className={styles.signUpBox}>
        <AccountUI />
        <div className={styles.rightPanel}>
          <div className={styles.top}>
            <h3 className={styles.aboveTitle}>Email Verification</h3>
            <h2 className={styles.title}>Resend verification email</h2>
            
            {/* Success Message */}
            {status === 'success' && (
              <div style={{ 
                backgroundColor: "#10b981", 
                color: "white", 
                padding: "1rem", 
                borderRadius: "8px",
                marginTop: "1rem",
                textAlign: "center"
              }}>
                <p style={{ margin: "0 0 10px 0", fontWeight: "600" }}>✅ {message}</p>
                <p style={{ margin: 0, fontSize: "0.9em", opacity: "0.9" }}>
                  Please check your inbox and spam folder.
                </p>
              </div>
            )}

            {/* Rate Limited Message */}
            {status === 'rate-limited' && (
              <div style={{ 
                backgroundColor: "#f59e0b", 
                color: "white", 
                padding: "1rem", 
                borderRadius: "8px",
                marginTop: "1rem",
                textAlign: "center"
              }}>
                <p style={{ margin: "0 0 10px 0", fontWeight: "600" }}>⏱️ {message}</p>
                <p style={{ margin: 0, fontSize: "0.9em", opacity: "0.9" }}>
                  Try again in {formatTime(countdown)}
                </p>
              </div>
            )}

            {/* Already Verified Message */}
            {status === 'error' && message && (
              <div style={{ 
                backgroundColor: "#10b981", 
                color: "white", 
                padding: "1rem", 
                borderRadius: "8px",
                marginTop: "1rem",
                textAlign: "center"
              }}>
                <p style={{ margin: "0 0 10px 0", fontWeight: "600" }}>✅ {message}</p>
              </div>
            )}

            {/* Server Error */}
            {errors?.server && (
              <div style={{ 
                backgroundColor: "#ef4444", 
                color: "white", 
                padding: "1rem", 
                borderRadius: "8px",
                marginTop: "1rem",
                textAlign: "center"
              }}>
                <p style={{ margin: 0, fontWeight: "600" }}>❌ {errors.server}</p>
              </div>
            )}
          </div>

          <div className={styles.middle}>
            <form id="resendForm" className={styles.formContainer}>
              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.inputTitle}>
                  Email{" "}
                  {errors?.email && (
                    <span className={styles.errorText}>{errors.email}</span>
                  )}
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email address"
                  className={`${styles.inputField} ${errors?.email ? styles.inputError : ""}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === 'rate-limited'}
                />
              </div>

              <div style={{ marginTop: '1rem', fontSize: '0.9em', color: '#666' }}>
                <p>
                  Enter the email address associated with your account and we&apos;ll send you a new verification link.
                </p>
              </div>
            </form>
          </div>

          <div className={styles.bottom}>
            <button
              type="submit"
              form="resendForm"
              className={styles.primaryButton}
              onClick={handleSubmit}
              disabled={resendMutation.isPending || status === 'rate-limited'}
              style={{ 
                opacity: (resendMutation.isPending || status === 'rate-limited') ? 0.6 : 1 
              }}
            >
              {resendMutation.isPending 
                ? "Sending..." 
                : status === 'rate-limited' 
                  ? `Wait ${formatTime(countdown)}`
                  : "Send verification email"
              }
            </button>

            <p className={styles.footer}>
              Remember your password?{" "}
              <Link href="/login">
                <button className={styles.secondaryButton}>Back to Login</button>
              </Link>
            </p>

            <p className={styles.footer} style={{ marginTop: "1rem" }}>
              Don&apos;t have an account?{" "}
              <Link href="/signup">
                <button className={styles.secondaryButton}>Sign up</button>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
