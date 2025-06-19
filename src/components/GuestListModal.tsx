import React from "react";
import styles from "../styles/EventPlannerView.module.css";
import buttonStyles from "../styles/Button.module.css";
import type { GuestHeader } from "~/models/GuestHeader";
import formatField from "~/utils/formatField";
import loadingStyles from "../styles/wishlistcomponent.module.css";

type GuestListModalProps = {
  loading: boolean;
  eventId: number;
  guests: readonly GuestHeader[];
  onRemoveGuest: (username: string) => void;
  onClose: () => void;
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
  onBack,
}: Readonly<GuestListModalProps>) {
  if (loading) return (
    <div className={styles.editMediaModalWrapper}>
      <div className={styles.editMediaModalContent}>
        <div className={loadingStyles.loadingContainer}>
          <div className={loadingStyles.spinner} data-testid="loading-spinner"></div>
        </div>
      </div>
    </div>
  );
  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modal}>
        <h3 className={styles.modalTitle}>Full Guest List</h3>

        <div className={styles.guestList}>
          {guests.map((guest) => (
            <div className={styles.guestRow} key={guest.username}>
              <img
                className={styles.guestImage}
                src={guest.pictureUrl ?? ""}
                alt="user visual description"
              />
              <p>{formatField(guest.fname) + " " + formatField(guest.lname)}</p>
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
            className={`${buttonStyles.button} ${buttonStyles["button-secondary"]}`}
            onClick={onClose}
          >
            ← Back
          </button>

          <button
            className={`${buttonStyles.button} ${buttonStyles["button-primary"]}`}
            onClick={onAddGuest}
          >
            Add Guest
          </button>
        </div>
      </div>
    </div>
  );
}
