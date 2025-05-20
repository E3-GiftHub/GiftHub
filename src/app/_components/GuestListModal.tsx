// app/_components/GuestListModal.tsx
import styles from "../../styles/EventView.module.css";
import buttonStyles from "../../styles/Button.module.css";

type GuestListModalProps = {
    guests: string[];
    onRemoveGuest: (index: number) => void;
    onClose: () => void;
    onSave: () => void;
    onAddGuest: () => void;
    onBack: () => void;
};

export default function GuestListModal({
                                           guests,
                                           onRemoveGuest,
                                           onClose,
                                           onSave,
                                           onAddGuest,
                                       }: GuestListModalProps) {
    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modal}>
                <div className={styles.modalHeader}>
                    <button
                        className={`${buttonStyles.button} ${buttonStyles["button-secondary"]}`}
                        onClick={onClose}
                    >
                        ← Back
                    </button>
                </div>

                <h3 className={styles.modalTitle}>Full Guest List</h3>

                <div className={styles.modalContent}>
                    {guests.map((guest, index) => (
                        <div key={index} className={styles.guestRow}>
                            <span>{guest}</span>
                            <button
                                className={styles.removeGuestButton}
                                onClick={() => onRemoveGuest(index)}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>

                <div className={styles.modalActions}>
                    <button
                        className={`${buttonStyles.button} ${buttonStyles["button-primary"]}`}
                        onClick={onAddGuest}
                    >
                        Add Guest
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
