import React from "react";
import styles from "../../styles/EventView.module.css";

type FormData = {
    date: string;
    title: string;
    time: string;
    location: string;
    description: string;
};

type EventInfoFormProps = {
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
    handleKeyDown: (
        e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
        field: keyof FormData
    ) => void;
};

export default function EventInfoForm({
                                          formData,
                                          setFormData,
                                          handleKeyDown,
                                      }: EventInfoFormProps) {
    return (
        <>
            <div className={styles.infoBox}>
                <div className={styles.fieldGroup}>
                    <label className={styles.label}>Date</label>
                    <input
                        className={styles.input}
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                        onKeyDown={(e) => handleKeyDown(e, "date")}
                    />
                </div>
                <div className={styles.fieldGroup}>
                    <label className={styles.label}>Time</label>
                    <input
                        className={styles.input}
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
                        onKeyDown={(e) => handleKeyDown(e, "time")}
                    />
                </div>
                <div className={styles.fieldGroup}>
                    <label className={styles.label}>Location</label>
                    <input
                        className={styles.input}
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                        onKeyDown={(e) => handleKeyDown(e, "location")}
                    />
                </div>
            </div>

            <div className={styles.descriptionBox}>
                <label className={styles.label}>Description</label>
                <textarea
                    className={styles.textarea}
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    onKeyDown={(e) => handleKeyDown(e, "description")}
                />
            </div>
        </>
    );
}