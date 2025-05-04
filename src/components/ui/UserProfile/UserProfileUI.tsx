import React from 'react';
import styles from 'src/styles/UserProfile/UserProfile.module.css';
import Image from 'next/image';
import { clsx } from 'clsx';
import "src/styles/globals.css";

interface UserProfileProps {
  username?: string;
  email?: string;
  avatarUrl?: string;
  onDelete?: () => void;
  onEdit?: () => void;
  loading?: boolean;
}

const ProfileButton = ({
                         iconSrc,
                         alt,
                         children,
                         onClick,
                         loading,
                       }: {
  iconSrc: string;
  alt: string;
  children: React.ReactNode;
  onClick?: () => void;
  loading?: boolean;
}) => (
  <button
    className={clsx(styles.button, loading && styles.loading)}
    onClick={onClick}
    disabled={loading}
  >
    {!loading && (
      <>
        <Image src={iconSrc} alt={alt} width={18} height={18} className={styles.icon} />
        {children}
      </>
    )}
  </button>
);

export default function UserProfileUI({
  username = "Username Placeholder",
  email = "user@example.com",
  avatarUrl,
  onDelete,
  onEdit,
  loading = false,
}: Readonly<UserProfileProps>) {
  const renderContent = (content: string) => (loading ? "\u00A0" : content);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.profileCard}>
        {/* Avatar Section - CSS handles default background */}
        <div className={styles.avatarSection}>
          <div className={styles.avatarWrapper}>
            <div
              className={clsx(styles.avatarCircle, loading && styles.loading)}
            >
              {!loading && avatarUrl && (
                <Image
                  src={avatarUrl}
                  width={120}
                  height={120}
                  className={styles.avatarImage}
                  alt={""}
                />
              )}
            </div>
            <button
              className={clsx(
                styles.editAvatarButton,
                loading && styles.loading,
              )}
              onClick={onEdit}
              disabled={loading}
              aria-label="Edit avatar"
            />
          </div>
        </div>

        {/* User Info Section */}
        <div className={styles.userInfo}>
          <h2 className={clsx(styles.username, loading && styles.loading)}>
            {renderContent(username)}
          </h2>
          <p className={clsx(styles.email, loading && styles.loading)}>
            {renderContent(email)}
          </p>

          <div className={styles.buttonContainer}>
            <ProfileButton
              iconSrc="/UserImages/buttons/bomb-icon.svg"
              alt="Delete account"
              loading={loading}
              onClick={onDelete}
            >
              Delete account
            </ProfileButton>

            <ProfileButton
              iconSrc="/UserImages/buttons/edit-icon.svg"
              alt="Edit profile"
              loading={loading}
              onClick={onEdit}
            >
              Edit info
            </ProfileButton>
          </div>
        </div>
      </div>
    </div>
  );
}