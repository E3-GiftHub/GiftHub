import styles from "../styles/ConfirmDeleteEvent.module.css";

type Props = {
  onConfirm: () => void;
  onCancel: () => void;
};

export default function DeleteEventModal({
  onConfirm,
  onCancel,
}: Readonly<Props>) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h3 className={styles.title}>
          Are you sure you want to delete this event?
        </h3>
        <div className={styles.actions}>
          <button className={styles.cancelButton} onClick={onCancel}>
            Cancel
          </button>
          <button className={styles.deleteButton} onClick={onConfirm}>
            DELETE
          </button>
        </div>
      </div>
    </div>
  );
}
