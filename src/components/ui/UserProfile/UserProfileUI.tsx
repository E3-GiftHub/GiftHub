import React from 'react';
import styles from 'src/styles/UserProfile/UserProfile.module.css';
import Image from 'next/image';

interface UserProfileProps {
  username?: string;
  email?: string;
  avatarUrl?: string;
  onDelete?: () => void;
  onEdit?: () => void;
  loading?: boolean;
}

export default function UserProfileUI({
                                        username = 'Username Placeholder',
                                        email = 'user@example.com',
                                        avatarUrl,
                                        onDelete,
                                        onEdit,
                                        loading = false
                                      }: UserProfileProps) {
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.profileCard}>
        {/* Avatar Section */}
        <div className={styles.avatarSection}>
          <div className={styles.avatarWrapper}>
            <div className={`${styles.avatarCircle} ${loading ? styles.loading : ''}`}>
              {!loading && avatarUrl && (
                <Image
                  src={avatarUrl}
                  alt="User avatar"
                  width={120}
                  height={120}
                  className={styles.avatarImage}
                />
              )}
              {!loading && !avatarUrl && (
                <div className={styles.avatarPlaceholder}>
                  <Image
                    src="/UserImages/default_pfp.svg"
                    alt="Default user avatar"
                    width={100}
                    height={100}
                    className={styles.placeholderImage}
                  />
                </div>
              )}
            </div>
            <button
              className={`${styles.editAvatarButton} ${loading ? styles.loading : ''}`}
              onClick={onEdit}
              disabled={loading}
            >
            </button>
          </div>
        </div>

        {/* User Info Section */}
        <div className={styles.userInfo}>
          <h2 className={`${styles.username} ${loading ? styles.loading : ''}`}>
            {loading ? '\u00A0' : username} {/* Non-breaking space for loading state */}
          </h2>
          <p className={`${styles.email} ${loading ? styles.loading : ''}`}>
            {loading ? '\u00A0' : email}
          </p>

          <div className={styles.buttonContainer}>
            <button
              className={`${styles.button} ${loading ? styles.loading : ''}`}
              onClick={onDelete}
              disabled={loading}
            >
              {!loading && (
                <>
                  <Image
                    src="/UserImages/buttons/bomb-icon.svg"
                    alt="Delete"
                    width={18}
                    height={18}
                    className={styles.icon}
                  />
                  Delete account
                </>
              )}
            </button>

            <button
              className={`${styles.button} ${loading ? styles.loading : ''}`}
              onClick={onEdit}
              disabled={loading}
            >
              {!loading && (
                <>
                  <Image
                    src="/UserImages/buttons/edit-icon.svg"
                    alt="Edit"
                    width={18}
                    height={18}
                    className={styles.icon}
                  />
                  Edit info
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}