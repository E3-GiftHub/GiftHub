// app/_components/AddGuestModal.tsx
"use client";

import styles from "../../styles/AddGuestModal.module.css";
import buttonStyles from "../../styles/Button.module.css";
import { useState } from "react";

type AddGuestModalProps = {
    onClose: () => void;
    onAdd: (guestName: string) => void;
};

export default function AddGuestModal({ onClose, onAdd }: AddGuestModalProps) {
    const [guestName, setGuestName] = useState("");

    const handleAdd = () => {
        const trimmed = guestName.trim();
        if (trimmed) {
            onAdd(trimmed);
            setGuestName("");
            onClose();
        }
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modal}>
                <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>Add Guest</h3>
                </div>

                <div className={styles.modalContent}>
                    <input
                        type="text"
                        placeholder="Enter guest name"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className={styles.input}
                    />
                </div>

                <div className={styles.buttonGroup}>
                    <button
                        className={`${buttonStyles.button} ${buttonStyles["button-primary"]}`}
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className={`${buttonStyles.button} ${buttonStyles["button-primary"]}`}
                        onClick={handleAdd}
                    >
                        Add
                    </button>
                </div>
            </div>
        </div>
    );
}