// /app/_components/Guests.tsx
import styles from "../../styles/EventView.module.css";
import buttonStyles from "../../styles/Button.module.css";

interface Props {
    guestList: string[];
    onOpenModal: () => void;
}

export default function Guests({ guestList, onOpenModal }: Props) {
    return (
        <div className={styles.guestBoard}>
            <label className={styles.label2}>Guest List</label>
            <div className={styles.guestList}>
                {guestList.slice(0, 12).map((guest, i) => (
                    <div key={i} className={styles.guestItem}>
                        {guest}
                    </div>
                ))}
            </div>
            <button
                className={`${buttonStyles.button} ${buttonStyles["button-primary"]} ${styles.seeMoreOverride}`}
                onClick={onOpenModal}
            >
                See more
            </button>
        </div>
    );
}