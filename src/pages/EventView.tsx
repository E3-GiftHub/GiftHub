"use client"

import { useState } from "react";
import Navbar from "../app/_components/Navbar";
import styles from "../styles/EventView.module.css";
import buttonStyles from "../styles/Button.module.css";
import GuestListModal from "../app/_components/GuestListModal";
import EditMediaModal from "../app/_components/EditMediaModal";
import EventInfoForm from "../app/_components/EventInfoForm";
import Guests from "../app/_components/Guests";
import Media from "../app/_components/Media";
import ConfirmModal from "../app/_components/ConfirmModal";


import { useRouter } from "next/navigation";


export default function EventView() {

    const router = useRouter();
    const [formData, setFormData] = useState({ date: "", time: "", location: "", description: "" });
    const [showConfirm, setShowConfirm] = useState(false);
    const [pendingField, setPendingField] = useState<null | string>(null);
    const [tempValue, setTempValue] = useState("");

    // Guest list state
    const [showGuestModal, setShowGuestModal] = useState(false);
    const [guestList, setGuestList] = useState(
        Array.from({ length: 24 }, (_, i) => `Guest ${i + 1}`)
    );
    const handleRemoveGuest = (idx: number) => setGuestList(prev => prev.filter((_, i) => i !== idx));
    const handleAddGuest = () => setGuestList(prev => [...prev, `Guest ${prev.length + 1}`]);
    const handleSaveGuestChanges = () => setShowGuestModal(false);

    // Media list state
    const [showMediaModal, setShowMediaModal] = useState(false);
    const [mediaList, setMediaList] = useState(
        Array.from({ length: 12 }, (_, i) => `/placeholder/image${i + 1}.jpg`)
    );
    const handleRemoveMedia = (idx: number) => setMediaList(prev => prev.filter((_, i) => i !== idx));
    const handleUploadMedia = () => setMediaList(prev => [...prev, `/placeholder/image${prev.length + 1}.jpg`]);
    const handleSaveMedia = () => setShowMediaModal(false);

    // inline edit confirmation
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
        if (e.key === "Enter") {
            e.preventDefault();
            setPendingField(field);
            setTempValue(e.currentTarget.value);
            setShowConfirm(true);
        }
    };
    const handleConfirm = () => {
        if (!pendingField) return;
        setFormData(prev => ({ ...prev, [pendingField]: tempValue }));
        setPendingField(null);
        setShowConfirm(false);
    };

    return (
        <div className={styles.pageWrapper}>
            <Navbar />

            {showGuestModal && (
                <GuestListModal
                    guests={guestList}
                    onRemoveGuest={(idx) => setGuestList(prev => prev.filter((_, i) => i !== idx))}
                    onAddGuest={() => setGuestList(prev => [...prev, `Guest ${prev.length + 1}`])}
                    onSave={() => setShowGuestModal(false)}
                    onClose={() => setShowGuestModal(false)}
                    onBack={() => setShowGuestModal(false)}
                />
            )}

            {showMediaModal && (
                <EditMediaModal
                    media={mediaList}
                    onRemove={(idx) => setMediaList(prev => prev.filter((_, i) => i !== idx))}
                    onUpload={() => setMediaList(prev => [...prev, `/placeholder/image${mediaList.length + 1}.jpg`])}
                    onSave={() => setShowMediaModal(false)}
                    onClose={() => setShowMediaModal(false)}
                />
            )}

            {showConfirm && (
                <ConfirmModal
                    pendingField={pendingField}
                    onConfirm={handleConfirm}
                    onCancel={() => setShowConfirm(false)}
                />
            )}

            <div className={styles.container}>
                <div className={styles.header}>
                    <h2>Event_1</h2>
                </div>

                <div className={styles.wrapper}>
                    <div className={styles.topSection}>
                        <div className={styles.photoSection}>
                            <div className={styles.photoBox}>Event photo here</div>
                        </div>

                        <EventInfoForm
                            formData={formData}
                            setFormData={setFormData}
                            handleKeyDown={handleKeyDown}
                        />
                    </div>

                    <div className={styles.bottomRow}>
                        <Guests
                            guestList={guestList}
                            onOpenModal={() => setShowGuestModal(true)}
                        />
                        <Media
                            mediaList={mediaList}
                            onOpenModal={() => setShowMediaModal(true)}
                        />
                        <div className={styles.wishlistBox}>
                            <button
                                className={`${buttonStyles.button} ${buttonStyles["button-primary"]}`}
                                onClick={() => router.push("/CreateWishlist")}
                            >
                                Create Wishlist
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
