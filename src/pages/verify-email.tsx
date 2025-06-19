import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "../styles/Account.module.css";
import "../styles/globals.css";
import AccountUI from "~/components/ui/Account/AccountUI";
import { api } from "~/trpc/react";
import Link from "next/link";

export default function VerifyEmail() {
  const router = useRouter();
  const { token } = router.query;
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'invalid'>('loading');
  const [message, setMessage] = useState<string>('');

  const verifyEmailMutation = api.auth.emailVerification.verifyEmail.useMutation({
    onSuccess: (data) => {
      setStatus('success');
      setMessage(data.message);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        void router.push('/login');
      }, 3000);
    },
    onError: (error) => {
      setStatus('error');
      if (error.message === 'Invalid or expired token') {
        setStatus('invalid');
        setMessage('This verification link is invalid or has expired.');
      } else if (error.message === 'Email already verified') {
        setMessage('Your email is already verified. You can log in now.');
      } else {
        setMessage('An error occurred while verifying your email. Please try again.');
      }
    },
  });

  useEffect(() => {
    if (token && typeof token === 'string') {
      verifyEmailMutation.mutate({ token });
    } else if (router.isReady) {
      setStatus('invalid');
      setMessage('Invalid verification link.');
    }
  }, [token, router.isReady]);

  return (
    <div className={styles.fullPageWrapper}>
      <div className={styles.signUpBox}>
        <AccountUI />
        <div className={styles.rightPanel}>
          <div className={styles.top}>
            <h3 className={styles.aboveTitle}>Email Verification</h3>
            <h2 className={styles.title}>
              {status === 'loading' && 'Verifying your email...'}
              {status === 'success' && 'Email Verified!'}
              {status === 'error' && 'Verification Failed'}
              {status === 'invalid' && 'Invalid Link'}
            </h2>
          </div>

          <div className={styles.middle}>
            <div className={styles.formContainer}>
              {status === 'loading' && (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <div style={{ 
                    fontSize: '2rem', 
                    marginBottom: '1rem',
                    animation: 'spin 1s linear infinite'
                  }}>
                    ⏳
                  </div>
                  <p>Please wait while we verify your email...</p>
                </div>
              )}

              {status === 'success' && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '2rem',
                  backgroundColor: '#10b981',
                  borderRadius: '8px',
                  color: 'white',
                  marginBottom: '1rem'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                  <p style={{ margin: '0 0 10px 0', fontWeight: '600' }}>{message}</p>
                  <p style={{ margin: 0, fontSize: '0.9em', opacity: '0.9' }}>
                    Redirecting to login in a few seconds...
                  </p>
                </div>
              )}

              {(status === 'error' || status === 'invalid') && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '2rem',
                  backgroundColor: '#ef4444',
                  borderRadius: '8px',
                  color: 'white',
                  marginBottom: '1rem'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
                  <p style={{ margin: '0 0 15px 0', fontWeight: '600' }}>{message}</p>
                  {status === 'invalid' && (
                    <p style={{ margin: 0, fontSize: '0.9em', opacity: '0.9' }}>
                      The link may have been used already or expired after 24 hours.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className={styles.bottom}>
            {status === 'success' && (
              <Link href="/login">
                <button className={styles.primaryButton}>
                  Go to Login
                </button>
              </Link>
            )}

            {(status === 'error' || status === 'invalid') && (
              <>
                <Link href="/resend-verification">
                  <button className={styles.primaryButton}>
                    Resend Verification Email
                  </button>
                </Link>
                <p className={styles.footer}>
                  <Link href="/login">
                    <button className={styles.secondaryButton}>Back to Login</button>
                  </Link>
                </p>
              </>
            )}

            {status === 'loading' && (
              <p className={styles.footer}>
                <Link href="/login">
                  <button className={styles.secondaryButton}>Back to Login</button>
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
