import React, { useState, useEffect } from 'react';
import styles from 'src/styles/UserProfile/UserProfile.module.css';
import Image from 'next/image';
import { clsx } from 'clsx';
import "src/styles/globals.css";

interface EditUserProfileProps {
  username?: string;
  email?: string;
  avatarUrl?: string;
  onSave?: (newUsername: string, newEmail: string) => void;
  onResetPassword?: () => void;
  loading?: boolean;
}

const ProfileButton = ({
                         iconSrc,
                         alt,
                         children,
                         onClick,
                         loading,
                         disabled,
                       }: {
  iconSrc: string;
  alt: string;
  children: React.ReactNode;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
}) => (
  <button
    className={clsx(styles.button, loading && styles.loading)}
    onClick={onClick}
    disabled={disabled ?? loading}
  >
    {!loading && (
      <>
        <Image src={iconSrc} alt={alt} width={18} height={18} className={styles.icon} />
        {children}
      </>
    )}
  </button>
);

export default function EditUserProfileUI({
                                            username = "",
                                            email = "",
                                            avatarUrl,
                                            onSave,
                                            onResetPassword,
                                            loading = false,
                                          }: Readonly<EditUserProfileProps>) {
  const [usernameInput, setUsernameInput] = useState(username);
  const [emailInput, setEmailInput] = useState(email);
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    setUsernameInput(username);
    setEmailInput(email);
  }, [username, email]);

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmailInput(value);
    setEmailError(validateEmail(value) ? "" : "Please enter a valid email address");
  };

  const handleSave = () => {
    if (onSave && !emailError) {
      onSave(usernameInput, emailInput);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.profileCard}>
        <div className={styles.avatarSection}>
          <div className={styles.avatarWrapper}>
            <div className={clsx(styles.avatarCircle, loading && styles.loading)}>
              {!loading && avatarUrl && (
                <Image
                  src={avatarUrl}
                  alt=""
                  width={120}
                  height={120}
                  className={styles.avatarImage}
                />
              )}
            </div>
          </div>
        </div>

        <div className={styles.userInfo}>
          <div className={styles.inputGroup}>
            <label htmlFor="username" className={styles.inputLabel}>
              {/*Username*/}
            </label>
            <input
              id="username"
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              className={clsx(styles.inputField, loading && styles.loading)}
              disabled={loading}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.inputLabel}>
              {/*Email*/}
            </label>
            <input
              id="email"
              type="email"
              value={emailInput}
              onChange={handleEmailChange}
              className={clsx(styles.inputField, loading && styles.loading)}
              disabled={loading}
            />
            {emailError && <div className={styles.errorMessage}>{emailError}</div>}
          </div>

          <div className={styles.buttonContainer}>
            <ProfileButton
              iconSrc="/UserImages/buttons/save-icon.svg"
              alt=""
              onClick={handleSave}
              loading={loading}
              disabled={!!emailError}
            >
              Save changes
            </ProfileButton>

            <ProfileButton
              iconSrc="/UserImages/buttons/password-reset-icon.svg"
              alt=""
              onClick={onResetPassword}
              loading={loading}
            >
              Reset Password
            </ProfileButton>
          </div>
        </div>
      </div>
    </div>
  );
}