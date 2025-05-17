import styles from "../../styles/EventView.module.css";
import buttonStyles from "../../styles/Button.module.css";

type EditEventModalProps = {
    photo: string;
    date: string;
    time: string;
    location: string;
    description: string;
    onPhotoChange: (val: string) => void;
    onDateChange: (val: string) => void;
    onTimeChange: (val: string) => void;
    onLocationChange: (val: string) => void;
    onDescriptionChange: (val: string) => void;
    onCancel: () => void;
    onSave: () => void;
};

export default function EditEventModal({
                                           photo,
                                           date,
                                           time,
                                           location,
                                           description,
                                           onPhotoChange,
                                           onDateChange,
                                           onTimeChange,
                                           onLocationChange,
                                           onDescriptionChange,
                                           onCancel,
                                           onSave,
                                       }: EditEventModalProps) {
    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modal}>
                <h3 className={styles.modalTitle}>Edit Event Details</h3>

                <div className={styles.modalContent}>
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Photo URL</label>
                        <input
                            className={styles.input}
                            type="text"
                            value={photo}
                            onChange={(e) => onPhotoChange(e.target.value)}
                        />
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Date</label>
                        <input
                            className={styles.input}
                            type="date"
                            value={date}
                            onChange={(e) => onDateChange(e.target.value)}
                        />
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Time</label>
                        <input
                            className={styles.input}
                            type="time"
                            value={time}
                            onChange={(e) => onTimeChange(e.target.value)}
                        />
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Location</label>
                        <input
                            className={styles.input}
                            type="text"
                            value={location}
                            onChange={(e) => onLocationChange(e.target.value)}
                        />
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Description</label>
                        <textarea
                            className={styles.textarea}
                            value={description}
                            onChange={(e) => onDescriptionChange(e.target.value)}
                        />
                    </div>
                </div>

                <div className={styles.modalActions}>
                    <button
                        className={`${buttonStyles.button} ${buttonStyles["button-primary"]}`}
                        onClick={onCancel}
                    >
                        Cancel
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
