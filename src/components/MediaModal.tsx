"use client";
import React from "react";
import styles from "../styles/EventView.module.css";
import buttonStyles from "../styles/Button.module.css";
import loadingStyles from "../styles/wishlistcomponent.module.css";
import type { MediaHeader } from "~/models/MediaHeader";

interface MediaModalProps {
  isLoading: boolean;
  media: MediaHeader[];
  onUpload: () => void;
  onClose: () => void;
}

export default function MediaModal({
  isLoading,
  media,
  onUpload,
  onClose,
}: Readonly<MediaModalProps>) {
  //(Ionut) Am adaugat loading pentru a evita blocarea paginii
  if (isLoading) {
    return (
      <div className={styles.editMediaModalWrapper}>
        <div className={styles.editMediaModalContent}>
          <div className={loadingStyles.loadingContainer}>
            <div className={loadingStyles.spinner} data-testid="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className={styles.editMediaModalWrapper}>
      <div className={styles.editMediaModalContent}>
        {/* Header cu Back */}
        <div className={styles.editMediaHeader}>
          <button
            className={`${buttonStyles.button} ${buttonStyles["button-secondary"]}`}
            onClick={onClose}
          >
            ← Back
          </button>
        </div>

        {/* Galerie media */}
        <div className={styles.editMediaGrid}>
          {media.length > 0 ? (
            media.map((item) => (
              <div key={item.id} className={styles.editMediaItem}>
                <img
                  src={item.url}
                  alt={item.caption ?? `Media ${item.id}`}
                  width={120}
                  height={100}
                  className={styles.image}
                />
                {item.caption && (
                  <div className={styles.caption}>{item.caption}</div>
                )}
              </div>
            ))
          ) : (
            <p>No media uploaded yet.</p>
          )}
        </div>

        {/* Footer */}
        <div className={styles.editMediaActions}>
          <button
            className={`${buttonStyles.button} ${buttonStyles["button-primary"]}`}
            onClick={onUpload}
          >
            Upload Media
          </button>
        </div>
      </div>
    </div>
  );
}
