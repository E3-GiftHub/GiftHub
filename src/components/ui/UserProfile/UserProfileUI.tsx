import React from 'react';
import styles from 'src/styles/UserProfile/UserProfile.module.css';
import Image from 'next/image';

export default function UserProfileUI() {
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.profileCard}>
        {/* Left side with avatar */}
        <div className={styles.avatarSection}>
          <div className={styles.avatarWrapper}>
            <div className={styles.avatarCircle}></div>
            <button className={styles.editAvatarButton}></button>
          </div>
        </div>



        {/* Right side with user info */}
        <div className={styles.userInfo}>
          <h2 className={styles.username}>Nicu_de_la_Căzănești</h2>
          <p className={styles.email}>melodiepedouavoci@gmail.com</p>

          <div className={styles.buttonContainer}>
            <button className={styles.button}>
              <Image
                src="/UserImages/buttons/bomb-icon.svg" // Path relative to public directory
                alt="Delete"
                width={18}  // Required
                height={18}
                // Required
                className={styles.icon}
              />
              Delete account
            </button>

            <button className={styles.button}>
              <Image
                src="/UserImages/buttons/edit-icon.svg" // Path relative to public directory
                alt="Edit"
                width={18}  // Required
                height={18}
                // Required
                className={styles.icon}
              />
              Edit info
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}