import { useRouter } from "next/router";
import { api } from "~/trpc/react";
import styles from "../styles/ConfirmDeleteEvent.module.css";

type Props = {
  parsedId: number;
  onCancel: () => void;
};

export default function DeleteEventModal({
  parsedId,
  onCancel,
}: Readonly<Props>) {
  const router = useRouter();
  const deleteEventMutation = api.eventPlanner.removeEvent.useMutation();

  const onConfirm = () => {
    void (async () => {
      try {
        const res = await deleteEventMutation.mutateAsync({
          eventId: parsedId,
        });
        // ✅ New: Show warning if deletion not allowed
        if (!res.success) {
          alert(res.message ?? "Cannot delete this event.");
          return;
        }

        alert("Event deleted successfully.");
        void router.push("/");
      } catch (err) {
        console.error("Failed to delete event:", err);
        const message =
          err instanceof Error ? err.message : "Could not delete event.";
        alert(message ?? "Could not delete event.");
      } finally {
        onCancel();
      }
    })();
  };

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
