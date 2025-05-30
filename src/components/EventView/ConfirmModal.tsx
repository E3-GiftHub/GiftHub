// /app/_components/ConfirmModal.tsx
import styles from "../../styles/EventView.module.css";
import buttonStyles from "../../styles/Button.module.css";

interface Props {
    pendingField: string | null;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmModal({ pendingField, onConfirm, onCancel }: Props) {
    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modal}>
                <p>
                    Save changes to <strong>{pendingField}</strong>?
                </p>
                <div className={styles.modalActions}>
                    <button
                        className={`${buttonStyles.button} ${buttonStyles["button-primary"]}`}
                        onClick={onConfirm}
                    >
                        Yes
                    </button>
                    <button
                        className={`${buttonStyles.button} ${buttonStyles["button-secondary"]}`}
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}