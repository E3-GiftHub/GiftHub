"use client";

import { useEffect, useState } from "react";
import styles from "../../styles/EventView.module.css";
import buttonStyles from "../../styles/Button.module.css";
import { useRouter } from "next/navigation";
import EditWishlistModal from "./EditWishlistModal";


type Wishlist = {
    title: string;
    items: string[];
};

export default function WishlistComponent() {
    const router = useRouter();
    const [wishlist, setWishlist] = useState<Wishlist | null>(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const res = await new Promise<Wishlist | null>((resolve) =>
                    setTimeout(() =>
                        resolve({
                            title: "Our Wishlist 🎁",
                            items: ["Mixer", "Espressor", "Voucher IKEA", "Cash 😁", "afsasf", "asfadsgfad", "uyrtyeyew"],
                        }), 1000)
                );
                setWishlist(res);
            } catch (err) {
                console.error("Eroare la fetch wishlist:", err);
            } finally {
                setLoading(false);
            }
        };

        void fetchWishlist();
    }, []);

    const handleSave = (updated: Wishlist) => {
        setWishlist(updated);
    };

    if (loading) {
        return (
            <div className={styles.wishlistBox}>
                <p>Loading wishlist...</p>
            </div>
        );
    }

    if (!wishlist) {
        return (
            <div className={styles.wishlistBox}>
                <button
                    className={`${buttonStyles.button} ${buttonStyles["button-primary"]}`}
                    onClick={() => router.push("/CreateWishlist")}
                >
                    Create Wishlist
                </button>
            </div>
        );
    }

    return (
        <div className={styles.wishlistBox}>
            <div className={styles.wishlistBoxContent}>
                <h3 className={styles.wishlistTitle}>{wishlist.title}</h3>
                <ul className={styles.wishlistList}>
                    {wishlist.items.map((item, idx) => (
                        <li key={idx}>{item}</li>
                    ))}
                </ul>
                <button
                    className={`${buttonStyles.button} ${buttonStyles["button-primary"]}`}
                    onClick={() => setShowModal(true)}
                >
                    Edit Wishlist
                </button>
            </div>
            {showModal && (
                <EditWishlistModal
                    wishlist={wishlist}
                    onClose={() => setShowModal(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}