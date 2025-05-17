import React, { useRef, useState, useEffect } from 'react';
import styles from 'src/styles/UserProfile/UserProfile.module.css';
import Image from 'next/image';
import clsx from 'clsx';
import "src/styles/globals.css";
import { router } from "next/client";

interface UserProfileProps {
  username?: string;
  fname?: string;
  lname?: string;
  email?: string;
  iban?: string;
  avatarUrl?: string;
  onDelete?: () => void;
  onEdit?: () => void;
  onPhotoChange?: (file: File) => void;
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
                                        username = 'Username Placeholder',
                                        email = 'user@example.com',
                                        avatarUrl,
                                        onDelete,
                                        onEdit,
                                        onPhotoChange,
                                        loading = false,
                                      }: Readonly<UserProfileProps>) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(avatarUrl);

  useEffect(() => {
    // Update preview if parent updates avatarUrl
    setPreviewUrl(avatarUrl);
  }, [avatarUrl]);

  const renderContent = (content: string) => (loading ? '\u00A0' : content);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Show preview locally
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setPreviewUrl(reader.result as string);
        }
      };
      reader.readAsDataURL(file);

      // Call parent handler to actually process the file (upload, etc.)
      if (onPhotoChange) {
        onPhotoChange(file);
      }
    }
  };

  const handleEdit = async () => {
    if (onEdit) {
      onEdit();
    } else {
      await router.push("/editprofile"); // Default behavior if no onEdit prop provided
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
                  width={120}
                  height={120}
                  className={styles.avatarImage}
                  alt={""}
                />
              )}
            </div>

            <button
              className={clsx(styles.editAvatarButton, loading && styles.loading)}
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              aria-label="Edit avatar"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
        </div>

        <div className={styles.userInfo}>
          <h2 className={clsx(styles.username, loading && styles.loading)}>
            {renderContent(username)}
          </h2>
          <div className={styles.nameContainer}>
            <p className={clsx(styles.nameField, loading && styles.loading)}>
              {renderContent(fname)}
              &nbsp;&nbsp;&nbsp;&nbsp;|
            </p>
            <p className={clsx(styles.nameField, loading && styles.loading)}>
              {renderContent(lname)}
            </p>
          </div>
          <p className={clsx(styles.email, loading && styles.loading)}>
            {renderContent(email)}
          </p>
          <p className={clsx(styles.iban, loading && styles.loading)}>
            {renderContent(iban)}
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
              onClick={handleEdit}
            >
              Edit info
            </ProfileButton>
          </div>
        </div>
      </div>
    </div>
  );
}
