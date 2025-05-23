// app/_components/GuestListModal.tsx
import styles from "../styles/EventView.module.css";
import React from "react";
import { EventViewModal } from "~/components/EventViewModal";

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
    <EventViewModal
      actionButtonText={"Add guest"}
      actionButtonOnClick={onAddGuest}
      onClose={onClose}
      onSave={onSave}
    >
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
    </EventViewModal>
  );
}
