"use client"

import { useState } from "react";


import Navbar from "../app/_components/Navbar"
import styles from "../styles/EventView.module.css"
import buttonStyles from "../styles/Button.module.css";
import EditEventModal from "../app/_components/EditEventModal"


export default function EventView() {

    const [showEditModal, setShowEditModal] = useState(false);
    const [photo, setPhoto] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");

    const handleSaveChanges = () => {
        // aici poți trimite datele modificate la backend dacă vrei
        console.log("Saved data:", { photo, date, time, location, description });
        setShowEditModal(false);
    };

    return (
        <div className={styles.pageWrapper}>
            <Navbar />

            {showEditModal && (
                <EditEventModal
                    photo={photo}
                    date={date}
                    time={time}
                    location={location}
                    description={description}
                    onPhotoChange={setPhoto}
                    onDateChange={setDate}
                    onTimeChange={setTime}
                    onLocationChange={setLocation}
                    onDescriptionChange={setDescription}
                    onCancel={() => setShowEditModal(false)}
                    onSave={handleSaveChanges}
                />
            )}


            <div className={styles.container}>
                <div className={styles.header}>
                    <h2>Event_1</h2>
                </div>

                <div className={styles.wrapper}>
                    {/* Rand: Poză + Data+Locație + Descriere */}
                    <div className={styles.topSection}>
                        {/* Poza */}
                        <div className={styles.photoSection}>
                         <div className={styles.photoBox}>Event photo here</div>
                         <button
                            className={`${buttonStyles.button} ${buttonStyles["button-primary"]} editEventButton`}
                            onClick={() => setShowEditModal(true)}
                         >
                            Edit Event
                         </button>
                       </div>
                        {/* Data + Locația */}
                        <div className={styles.infoBox}>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Date</label>
                                <input className={styles.input} type="date" />
                            </div>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Time</label>
                                <input className={styles.input} type="time" />
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
                        <div className={styles.mediaGallery}>
                            <label className={styles.label2}>Media Gallery</label>
                            <div className={styles.mediaGrid}>
                                {Array.from({ length: 5 }, (_, i) => (
                                    <div key={i} className={styles.mediaItem}>
                                        <img src={`/placeholder/image${i + 1}.jpg`} alt={`Media ${i + 1}`} />
                                    </div>
                                ))}
                            </div>
                            <button className={`${buttonStyles.button} ${buttonStyles["button-primary"]}`}>
                                Upload Media
                            </button>
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
