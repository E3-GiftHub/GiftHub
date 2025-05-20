"use client"

import styles from "../styles/CreateEditEvent.module.css"
import Navbar from "../app/_components/Navbar"
import buttonStyles from "../styles/Button.module.css";


export default function Page() {
    return (
        <div className={styles.pageWrapper}>
            <Navbar />
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2>Create Event</h2>
                </div>

                <div className={styles.wrapper}>
                    <form className={styles.form}>
                        <div className={styles.left}>
                            <label>
                                Name your event:
                                <input type="text" placeholder="e.g. John's Birthday Bash" />
                            </label>
                            <label className={styles.dateInputWrapper}>
                                Set the date:
                                <input type="date" />
                                <span className={styles.icon}></span>
                            </label>
                            <label>
                                Set the location:
                                <input type="text" placeholder="Enter location" />
                            </label>
                        </div>

                        <div className={styles.right}>
                            <label>
                                Add a note:
                                <textarea placeholder="Event description..." />
                            </label>
                            <div className={styles.buttons}>
                                <button className={`${buttonStyles.button} ${buttonStyles["button-primary"]}`}>
                                    &nbsp;Cancel&nbsp;
                                </button>

                                <button className={`${buttonStyles.button} ${buttonStyles["button-primary"]}`}>
                                    Save &  <br /> Continue
                                </button>

                            </div>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    )
}
