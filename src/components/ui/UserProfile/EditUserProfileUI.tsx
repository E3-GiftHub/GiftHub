import React, { useState, useEffect, useRef } from "react";
import styles from 'src/styles/UserProfile/UserProfile.module.css';
import Image from 'next/image';
import { clsx } from 'clsx';
import "src/styles/globals.css";

// import {useUploadThing} from "~/utils/uploadthing";
import { useRouter } from "next/router";
import { toast } from "sonner";

interface EditUserProfileProps {
  username?: string;
  fname?: string;
  lname?: string;
  email?: string;
  avatarUrl?: string;
  onSave?: (
    newFname: string,
    newLname: string,
    newUsername: string,
    newEmail: string,
  ) => void;
  onResetPassword?: () => void;
  loading?: boolean;
  disableUsernameEditing?: boolean; // <-- new prop added here
}

const ProfileButton = ({
                         iconSrc,
                         alt,
                         children,
                         onClick,
                         onPhotoChange,
                         loading,
                         disabled,
                       }: {
  iconSrc: string;
  alt: string;
  children: React.ReactNode;
  onClick?: () => void;
  onPhotoChange?: (file: File) => void;
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
                                            fname = "",
                                            lname = "",
                                            avatarUrl,
                                            onSave,
                                            onResetPassword,
                                            loading = false,
                                            disableUsernameEditing = false, // default false
                                          }: Readonly<EditUserProfileProps>) {
  const [usernameInput, setUsernameInput] = useState(username);
  const [emailInput, setEmailInput] = useState(email);
  const [fnameInput, setFnameInput] = useState(fname);
  const [lnameInput, setLnameInput] = useState(lname);
  const [emailError, setEmailError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(avatarUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    // const file = event.target.files?.[0];
    // if (file) {
    //   const reader = new FileReader();
    //   reader.onloadend = () => {
    //     if (reader.result) {
    //       setPreviewUrl(reader.result as string);
    //     }
    //   };
    //   reader.readAsDataURL(file);
    //
    //   if (onPhotoChange) {
    //     onPhotoChange(file);
    //   }
    // }

    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        setPreviewUrl(reader.result as string);
      }
    };
    reader.readAsDataURL(file);

    try {
      /*const res await startUpload([file]);
      if (res?.[0]?.url) {
        setPreviewUrl(res[0].url);
        if (onPhotoChange) {
          onPhotoChange(file);
        }
      }
          */
    } catch (error) {
      toast.error("Error uploading profile picture");
      console.error(error);
    }
  };

  useEffect(() => {
    setUsernameInput(username);
    setEmailInput(email);
    setFnameInput(fname);
    setLnameInput(lname);
  }, [username, email, fname, lname]);

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
      onSave(fnameInput, lnameInput, usernameInput, emailInput);
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
            <button
              className={clsx(
                styles.editAvatarButton,
                loading && styles.loading,
              )}
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              aria-label="Edit avatar"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </div>
        </div>

        <div className={styles.userInfoedit}>
          <div className={styles.inputGroup}>
            <label htmlFor="username" className={styles.inputLabel}>
              {/* Username */}
            </label>
            <input
              id="username"
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              className={clsx(styles.inputField, loading && styles.loading)}
              disabled={loading} // <-- disable username input if prop true
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="fname" className={styles.inputLabel}>
              {/* First Name */}
            </label>
            <input
              id="fname"
              type="text"
              value={fnameInput}
              onChange={(e) => setFnameInput(e.target.value)}
              className={clsx(styles.inputField, loading && styles.loading)}
              disabled={loading}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="lname" className={styles.inputLabel}>
              {/* Last Name */}
            </label>
            <input
              id="lname"
              type="text"
              value={lnameInput}
              onChange={(e) => setLnameInput(e.target.value)}
              className={clsx(styles.inputField, loading && styles.loading)}
              disabled={loading}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.inputLabel}>
              {/* Email */}
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

          {/*<div className={styles.inputGroup}>*/}
          {/*  <label htmlFor="iban" className={styles.inputLabel}>*/}
          {/*    /!* IBAN *!/*/}
          {/*  </label>*/}
          {/*  <input*/}
          {/*    id="iban"*/}
          {/*    type="text"*/}
          {/*    className={clsx(styles.inputField, loading && styles.loading)}*/}
          {/*    disabled={loading}*/}
          {/*  />*/}
          {/*</div>*/}

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
              iconSrc="/UserImages/buttons/reset-icon.svg"
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
