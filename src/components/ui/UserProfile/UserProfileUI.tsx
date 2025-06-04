import React, { useState, useEffect } from "react";
import styles from "src/styles/UserProfile/UserProfile.module.css";
import Image from "next/image";
import clsx from "clsx";
import "src/styles/globals.css";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";
import { api } from "src/trpc/react";

interface UserProfileProps {
  username: string;
  fname: string;
  lname: string;
  email: string;
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
        <Image
          src={iconSrc}
          alt={alt}
          width={18}
          height={18}
          className={styles.icon}
        />
        {children}
      </>
    )}
  </button>
);

export default function UserProfileUI({
  username,
  fname,
  lname,
  email,
  avatarUrl,
  onDelete,
  onEdit,
  loading = false,
}: Readonly<UserProfileProps>) {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(avatarUrl);
  const router = useRouter();

  useEffect(() => {
    setPreviewUrl(avatarUrl);
  }, [avatarUrl]);

  const renderContent = (content: string) => (loading ? "\u00A0" : content);

  const handleEdit = async () => {
    if (onEdit) {
      onEdit();
    } else {
      await router.push("/profile-edit");
    }
  };

  const deleteUserMutation = api.profile.user.delete.useMutation();

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone.",
    );
    if (!confirmed) return;

    try {
      await deleteUserMutation.mutateAsync();
      document.cookie =
        "persistent-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; max-age=0";
      await signOut({ redirectTo: "/" });
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("An unexpected error occurred while deleting your account.");
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.profileCard}>
        <div className={styles.avatarSection}>
          <div className={styles.avatarWrapper}>
            <div
              className={clsx(styles.avatarCircle, loading && styles.loading)}
            >
              {!loading && previewUrl && (
                <Image
                  src={previewUrl}
                  width={200}
                  height={200}
                  className={styles.avatarImage}
                  alt=""
                />
              )}
            </div>
          </div>
        </div>

        <div className={styles.userInfo}>
          <h2 className={clsx(styles.username, loading && styles.loading)}>
            {renderContent(username)}
          </h2>
          <div className={styles.nameContainer}>
            <p
              className={clsx(
                styles.nameField,
                styles.fname,
                loading && styles.loading,
              )}
            >
              {renderContent(fname)}&nbsp;&nbsp;&nbsp;&nbsp;|
            </p>
            <p
              className={clsx(
                styles.nameField,
                styles.lname,
                loading && styles.loading,
              )}
            >
              &nbsp;{renderContent(lname)}
            </p>
          </div>
          <p className={clsx(styles.email, loading && styles.loading)}>
            {renderContent(email)}
          </p>

          <div className={styles.buttonContainer}>
            <ProfileButton
              iconSrc="/UserImages/buttons/bomb-icon.svg"
              alt="Delete account"
              loading={loading}
              onClick={handleDelete}
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
