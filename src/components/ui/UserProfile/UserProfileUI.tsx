import React from 'react';
import styles from 'src/styles/UserProfile/UserProfile.module.css';

export default function UserProfileUI() {
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.profileCard}>
        {/* Left side with avatar */}
        <div className={styles.avatarSection}>
          <div className={styles.avatarCircle}>
          </div>
          <button className={styles.editAvatarButton}>
          </button>
        </div>

        {/* Right side with user info */}
        <div className={styles.userInfo}>
          <h2 className={styles.username}>Nicu_de_la_Căzănești</h2>
          <p className={styles.email}>melodiepedouavoci@gmail.com</p>

          <div className={styles.buttonContainer}>
            <button className={styles.deleteButton}>
              <span className={styles.buttonIcon}>🗑</span>
              Delete account
            </button>

            <button className={styles.editButton}>
              <span className={styles.buttonIcon}>✏️</span>
              Edit info
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}