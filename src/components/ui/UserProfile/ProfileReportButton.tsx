import React from "react";
import styles from "src/styles/UserProfile/UserProfile.module.css";
import Image from "next/image";
import clsx from "clsx";
import "src/styles/globals.css";

interface UserReportProps {
  iconSrc: string;
  alt: string;
  children: React.ReactNode;
  loading?: boolean;
  onClick?: () => void;
}

export default function ProfileButton({
  iconSrc,
  alt,
  children,
  loading,
  onClick,
}: Readonly<UserReportProps>) {
  return (
    <button
      className={clsx(
        styles.button,
        styles.buttonDanger,
        loading && styles.loading,
      )}
      onClick={onClick}
      disabled={loading}
    >
      {!loading && (
        <>
          <Image
            src={iconSrc}
            alt={alt}
            width={20}
            height={20}
            className={styles.icon}
          />
          {children}
        </>
      )}
    </button>
  );
}
