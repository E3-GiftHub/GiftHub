"use client"

import Navbar from "../app/_components/Navbar"
import styles from "../styles/EventView.module.css"
import buttonStyles from "../styles/Button.module.css"

export default function EventView() {
    return (
        <div className={styles.pageWrapper}>
            <Navbar />

            <div className={styles.container}>
                <div className={styles.header}>
                    <h2>Event_1</h2>
                </div>

                <div className={styles.wrapper}>
                    {/* Rand: Poză + Data+Locație + Descriere */}
                    <div className={styles.topSection}>
                        {/* Poza */}
                        <div className={styles.photoBox}>Event photo here</div>

                        {/* Data + Locația */}
                        <div className={styles.infoBox}>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Date</label>
                                <input className={styles.input} type="date" />
                            </div>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Location</label>
                                <input className={styles.input} type="text" placeholder="Enter location" />
                            </div>
                        </div>

                        {/* Descrierea */}
                        <div className={styles.descriptionBox}>
                            <label className={styles.label}>Description</label>
                            <textarea className={styles.textarea} placeholder="Event description..." />
                        </div>
                    </div>

                    {/* Rand: Lista de invitați + buton + wishlist */}
                    <div className={styles.bottomRow}>
                        <div className={styles.guestBoard}>
                            <label className={styles.label2}>Guest List</label>
                            <div className={styles.guestList}>
                                {Array.from({ length: 11 }, (_, i) => (
                                    <div key={i} className={styles.guestItem}>
                                        Guest {i + 1}
                                    </div>
                                ))}
                                <button
                                    className={`${buttonStyles.button} ${buttonStyles["button-primary"]} ${styles.seeMoreOverride}`}
                                >
                                    See more
                                </button>
                            </div>

                        </div>

                        <div className={styles.wishlistBox}>
                            <button
                                className={`${buttonStyles.button} ${buttonStyles["button-primary"]}`}
                            >
                                Create Wishlist
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
