"use client"

import styles from "../styles/CreateEditEvent.module.css"
import Navbar from "../components/Navbar"
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

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

import styles from "../styles/CreateEditEvent.module.css";
import Navbar from "../app/_components/Navbar";
import buttonStyles from "../styles/Button.module.css";

export default function Page() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [location, setLocation] = useState("");

    const createEventMutation = api.event.createEvent.useMutation({
        onSuccess: (data) => {
            router.push(`/event/${data.data.id}`);
        },
        onError: (error) => {
            alert("Eroare la creare: " + JSON.stringify(error.data?.zodError?.fieldErrors ?? error.message, null, 2));
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!date || !time) {
            alert("Please fill in both date and time.");
            return;
        }

        const fullDateTime = new Date(`${date}T${time}`);

        createEventMutation.mutate({
            title,
            description,
            location,
            date: new Date(date),
            time: fullDateTime,
        });
    };

    return (
        <div className={styles.pageWrapper}>
            <Navbar />
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2>Create Event</h2>
                </div>

                <div className={styles.wrapper}>
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <div className={styles.left}>
                            <label>
                                Name your event:
                                <input
                                    type="text"
                                    placeholder="e.g. John's Birthday Bash"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </label>

                            <label className={styles.dateInputWrapper}>
                                Set the date:
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </label>

                            <label>
                                Set the time:
                                <input
                                    type="time"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                />
                            </label>

                            <label>
                                Set the location:
                                <input
                                    type="text"
                                    placeholder="Enter location"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                            </label>
                        </div>

                        <div className={styles.right}>
                            <label>
                                Add a note:
                                <textarea
                                    placeholder="Event description..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </label>

                            <div className={styles.buttons}>
                                <button
                                    type="button"
                                    className={`${buttonStyles.button} ${buttonStyles["button-primary"]}`}
                                    onClick={() => router.back()}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className={`${buttonStyles.button} ${buttonStyles["button-primary"]}`}
                                >
                                    Save & <br /> Continue
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
