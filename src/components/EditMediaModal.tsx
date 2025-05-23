"use client";

import styles from "../styles/EventView.module.css";
import buttonStyles from "../styles/Button.module.css";
import Image from "next/image";
import { EventViewModal } from "./EventViewModal";

type EditMediaModalProps = {
  media: string[];
  onClose: () => void;
  onSave: () => void;
  onUpload: () => void;
  onRemove: (index: number) => void;
};

export default function EditMediaModal({
  media,
  onClose,
  onSave,
  onUpload,
  onRemove,
}: EditMediaModalProps) {
  return (
    <EventViewModal
      actionButtonText="Upload Media"
      actionButtonOnClick={onUpload}
      onClose={onClose}
      onSave={onSave}
    >
      <div className={styles.editMediaGrid}>
        {media.map((src, i) => (
          <div key={i} className={styles.editMediaItem}>
            <button
              className={styles.removeButton}
              onClick={() => onRemove(i)}
              aria-label="Remove image"
            >
              ×
            </button>
            <Image
              src={src}
              alt={`Media ${i + 1}`}
              width={120}
              height={100}
              className={styles.image}
            />
          </div>
        ))}
      </div>
    </EventViewModal>
  );
}
