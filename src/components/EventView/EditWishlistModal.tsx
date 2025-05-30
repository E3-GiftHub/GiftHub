"use client";

import { useState } from "react";
import styles from "../../styles/EditWishlistModal.module.css";
import buttonStyles from "../../styles/Button.module.css";

type Wishlist = {
    title: string;
    items: string[];
};

type Props = {
    wishlist: Wishlist;
    onClose: () => void;
    onSave: (updatedWishlist: Wishlist) => void;
};

export default function EditWishlistModal({ wishlist, onClose, onSave }: Props) {
    const [items, setItems] = useState(wishlist.items);

    const handleItemChange = (index: number, value: string) => {
        const updated = [...items];
        updated[index] = value;
        setItems(updated);
    };

    const handleAddItem = () => {
        setItems([...items, ""]);
    };

    const handleDeleteItem = (index: number) => {
        const updated = items.filter((_, i) => i !== index);
        setItems(updated);
    };

    const handleSave = () => {
        onSave({
            title: wishlist.title,
            items: items.filter(item => item.trim() !== "")
        });
        onClose();
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <h2>Edit Wishlist</h2>
                {items.map((item, index) => (
                    <div key={index} className={styles.itemRow}>
                        <input
                            type="text"
                            value={item}
                            onChange={(e) => handleItemChange(index, e.target.value)}
                            placeholder={`Item ${index + 1}`}
                            className={styles.input}
                        />
                        <button
                            className={styles.deleteButton}
                            onClick={() => handleDeleteItem(index)}
                            aria-label="Delete item"
                        >
                            &times;
                        </button>
                    </div>
                ))}
                <button className={`${buttonStyles.button} ${buttonStyles["button-primary"]}`} onClick={handleAddItem}>
                    + Add Item
                </button>
                <div className={styles.modalActions}>
                    <button
                        className={`${buttonStyles.button} ${buttonStyles["button-primary"]}`}
                        onClick={handleSave}
                    >
                        Save
                    </button>
                    <button
                        className={`${buttonStyles.button} ${buttonStyles["button-primary"]}`}
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}