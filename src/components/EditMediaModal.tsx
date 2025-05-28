"use client";

import React from "react";
import Image from "next/image";
import styles from "../styles/EventView.module.css";
import buttonStyles from "../styles/Button.module.css";

interface MediaItem {
  id: number;
  url: string;
  caption?: string;
}

interface EditMediaModalProps {
  media: MediaItem[];
  onRemove: (id: number) => void;
  onUpload: () => void;
  onClose: () => void;
}

export default function EditMediaModal({
  media,
  onRemove,
  onUpload,
  onClose,
}: EditMediaModalProps) {
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
                <button
                  className={styles.removeButton}
                  onClick={() => onRemove(item.id)}
                  aria-label="Remove image"
                >
                  ×
                </button>
                <Image
                  src={item.url}
                  alt={item.caption ?? `Media ${item.id}`}
                  width={120}
                  height={100}
                  className={styles.image}
                />
                {item.caption && (
                  <div className={styles.caption}>
                    {item.caption}
                  </div>
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