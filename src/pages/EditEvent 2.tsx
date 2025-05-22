"use client"

import styles from "../styles/CreateEditEvent.module.css"
import Navbar from "../app/_components/Navbar"
import buttonStyles from "../styles/Button.module.css";

export default function CreateEvent() {
    return (
        <div className={styles.pageWrapper}>
            <Navbar />
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2>Edit *event_name*</h2>
                </div>

                <div className={styles.wrapper}>
                    <form className={styles.form}>
                        <div className={styles.left}>
                            <label>
                                Rename your event:
                                <input type="text" placeholder="e.g. John's Birthday Bash" />
                            </label>
                            <label className={styles.dateInputWrapper}>
                                Change the date:
                                <input type="date" />
                                <span className={styles.icon}></span>
                            </label>
                            <label>
                                Change the location:
                                <input type="text" placeholder="Enter location" />
                            </label>
                        </div>

                        <div className={styles.right}>
                            <label>
                                Edit the note:
                                <textarea placeholder="Event description..." />
                            </label>
                            <div className={styles.buttons}>
                                <button className={`${buttonStyles.button} ${buttonStyles["button-primary"]}`}>
                                    &nbsp;Cancel&nbsp;
                                </button>

                                <button className={`${buttonStyles.button} ${buttonStyles["button-primary"]}`}>
                                    Save <br /> Changes
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    )
}
