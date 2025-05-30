// /app/_components/Media.tsx
import styles from "../../styles/EventView.module.css";
import buttonStyles from "../../styles/Button.module.css";

interface Props {
    mediaList: string[];
    onOpenModal: () => void;
}

export default function Media({ mediaList, onOpenModal }: Props) {
    return (
        <div className={styles.mediaGallery}>
            <label className={styles.label2}>Media Gallery</label>
            <div className={styles.mediaGrid}>
                {mediaList.slice(0, 20).map((url, i) => (
                    <div key={i} className={styles.mediaItem}>
                        <img src={url} alt={`Media ${i + 1}`} />
                    </div>
                ))}
            </div>
            <button
                className={`${buttonStyles.button} ${buttonStyles["button-primary"]} ${styles.mediaButton}`}
                onClick={onOpenModal}
            >
                Edit Media
            </button>
        </div>
    );
}