// components/GuestListModal.tsx
import styles from "../styles/EventView.module.css";
import buttonStyles from "../styles/Button.module.css";
import type { GuestHeader } from "~/models/GuestHeader";

type GuestListModalProps = {
  loading: boolean;
  eventId: number;
  guests: readonly GuestHeader[];
  onRemoveGuest: (username: string) => void;
  onClose: () => void;
  onSave: () => void;
  onAddGuest: () => void;
  onBack: () => void;
};

export default function GuestListModal({
  loading,
  eventId,
  guests,
  onRemoveGuest,
  onAddGuest,
  onClose,
  onSave,
  onBack,
}: Readonly<GuestListModalProps>) {
  if (loading) return <div>Loading guests...</div>;
  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <button
            className={`${buttonStyles.button} ${buttonStyles["button-primary"]}`}
            onClick={onClose}
          >
            ← Back
          </button>
        </div>

        <h3 className={styles.modalTitle}>Full Guest List</h3>

        <div className={styles.guestList}>
          {guests.map((guest) => (
            <div className={styles.guestRow} key={guest.username}>
              <img
                className={styles.guestImage}
                src={guest.pictureUrl ?? ""}
                alt="user visual description"
              />
              <p>
                {guest.fname} {guest.lname}
              </p>
              <p>aka. {guest.username}</p>
              <button
                className={styles.removeGuestButton}
                onClick={() => onRemoveGuest(guest.username)}
              >
                Remove
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
