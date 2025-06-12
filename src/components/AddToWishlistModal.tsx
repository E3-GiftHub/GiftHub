"use client";
import React, { useState } from "react";
import styles from "../styles/Button.module.css";
import modalStyles from "../styles/ModalEventHome.module.css";

// typescript compliant, not prisma!
import { PriorityTypeEnum } from "~/models/PriorityTypeEnum";
import type { WishlistInputItem } from "~/models/WishlistInputItem";

interface AddToWishlistModalProps {
  isOpen: boolean;
  itemName: string;
  itemPhoto: string;
  itemPrice: string;
  itemDescription: string;
  onAddToWishlist: (item: WishlistInputItem) => void;
  onClose: () => void;
}

export default function AddToWishlistModal({
  isOpen,
  itemName,
  itemPhoto,
  itemPrice,
  itemDescription,
  onAddToWishlist,
  onClose,
}: Readonly<AddToWishlistModalProps>) {
  const [quantity, setQuantity] = useState(1);
  const [priority, setPriority] = useState<PriorityTypeEnum>(
    PriorityTypeEnum.LOW,
  );
  const [note, setNote] = useState("");

  if (!isOpen) return null;

  const handleAddToWishlist = () => {
    onAddToWishlist({
      name: itemName,
      description: itemDescription,
      photo: itemPhoto,
      price: itemPrice,
      quantity: quantity,
      priority: priority,
      note: note,
    });
  };

  return (
    <div className={modalStyles.modalOverlay}>
      <div className={modalStyles.modalContent}>
        <h2 className={modalStyles.modalTitleAdd}>Add to Wishlist</h2>
        <div className={modalStyles.product}>
          <img
            src={itemPhoto}
            alt={itemName}
            className={modalStyles.modalImage}
          />

          <div className={modalStyles.productInfo}>
            <h3 className={modalStyles.modalItemName}>{itemName}</h3>
            <p className={modalStyles.modalItemPrice}>{itemPrice}</p>
            {itemDescription && (
              <p className={modalStyles.modalItemDescription}>
                {itemDescription}
              </p>
            )}

            <div className={modalStyles.plannerInputs}>
              <label htmlFor="note" className={modalStyles.noteLabel}>
                Add a note for your guests:
              </label>
              <input
                type="string"
                id="note"
                value={note}
                onChange={(e) => setNote(String(e.target.value))}
                className={modalStyles.noteInput}
              />

              <div className={modalStyles.plannerInputsEz}>
                <label htmlFor="quantity" className={modalStyles.quantityLabel}>
                  Quantity:
                </label>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  max="5"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className={modalStyles.quantityInput}
                />

                <label htmlFor="priority" className={modalStyles.priorityLabel}>
                  Priority:
                </label>
                <select
                  id="priority"
                  value={priority}
                  onChange={(e) =>
                    setPriority(Number(e.target.value) as PriorityTypeEnum)
                  }
                  className={modalStyles.priorityInput}
                >
                  <option value={PriorityTypeEnum.LOW}>Low</option>
                  <option value={PriorityTypeEnum.MEDIUM}>Medium</option>
                  <option value={PriorityTypeEnum.HIGH}>High</option>
                </select>
              </div>
            </div>
            <div className={modalStyles.modalButtons}>
              <button
                className={`${styles.button} ${styles["button-secondary"]}`}
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className={`${styles.button} ${styles["button-primary"]}`}
                onClick={handleAddToWishlist}
              >
                Add to Wishlist
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
