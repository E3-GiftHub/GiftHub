import React from "react";
import styles from "~/styles/EventView.module.css";
import buttonStyles from "~/styles/Button.module.css";

interface EventViewModalProps {
  children: React.ReactNode;
  actionButtonText: string;
  actionButtonOnClick: () => void;
  onClose: () => void;
  onSave: () => void;
}

export const EventViewModal: React.FC<EventViewModalProps> = ({
  children,
  actionButtonText,
  actionButtonOnClick,
  onClose,
  onSave,
}) => {
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
        {children}
        <div className={styles.modalActions}>
          <button
            className={`${buttonStyles.button} ${buttonStyles["button-primary"]}`}
            onClick={actionButtonOnClick}
          >
            {actionButtonText}
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
};
