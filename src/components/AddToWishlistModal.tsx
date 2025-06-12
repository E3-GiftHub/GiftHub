"use client";
import React, { useState } from "react";
import styles from "../styles/Button.module.css";
import modalStyles from "../styles/ModalEventHome.module.css";

interface AddToWishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  itemPhoto: string;
  itemPrice: string;
  itemDescription?: string;
  onAddToWishlist: (item: {
    name: string;
    photo: string;
    price: string;
    quantity: number;
  }) => void;
}

export default function AddToWishlistModal({
  isOpen,
  onClose,
  itemName,
  itemPhoto,
  itemPrice,
  itemDescription,
  onAddToWishlist,
}: Readonly<AddToWishlistModalProps>) {
  const [quantity, setQuantity] = useState(1);

  if (!isOpen) return null;

  const handleAddToWishlist = () => {
    onAddToWishlist({
      name: itemName,
      photo: itemPhoto,
      price: itemPrice,
      quantity: quantity,
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
            <div>
              <label htmlFor="quantity" className={modalStyles.quantityLabel}>
                Quantity:
              </label>
              <input
                type="number"
                id="quantity"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className={modalStyles.quantityInput}
              />
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
