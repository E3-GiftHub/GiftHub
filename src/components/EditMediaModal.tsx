"use client";

import styles from "../styles/EventView.module.css";
import buttonStyles from "../styles/Button.module.css";
import Image from "next/image";

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
        <div className={styles.editMediaModalWrapper}>
            <div className={styles.editMediaModalContent}>
                {/* Header cu Back */}
                <div className={styles.editMediaHeader}>
                    <button className={`${buttonStyles.button} ${buttonStyles["button-secondary"]}`} onClick={onClose}>← Back</button>
                </div>

                {/* Galerie media */}
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

                {/* Footer */}
                <div className={styles.editMediaActions}>
                    <button className={`${buttonStyles.button} ${buttonStyles["button-primary"]}`} onClick={onUpload}>
                        Upload Media
                    </button>
                    <button
                        className={`${buttonStyles.button} ${buttonStyles["button-primary"]}`}
                        onClick={onSave}
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
