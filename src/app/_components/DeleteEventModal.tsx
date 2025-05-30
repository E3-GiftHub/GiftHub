// app/_components/DeleteEventModal.tsx

"use client";

import styles from "../../styles/ConfirmDeleteEvent.module.css";

type Props = {
    onConfirm: () => void;
    onCancel: () => void;
};

export default function DeleteEventModal({ onConfirm, onCancel }: Props) {
    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <h3 className={styles.title}>Ești sigur că vrei să ștergi acest eveniment?</h3>
                <div className={styles.actions}>
                    <button className={styles.cancelButton} onClick={onCancel}>Anulează</button>
                    <button className={styles.deleteButton} onClick={onConfirm}>Șterge</button>
                </div>
            </div>
        </div>
    );
}
