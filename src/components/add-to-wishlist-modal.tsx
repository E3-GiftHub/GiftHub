"use client"

import { useState } from "react"
import styles from "../styles/Button.module.css"
import modalStyles from "../styles/Modal.module.css"

interface AddToWishlistModalProps {
  isOpen: boolean
  onClose: () => void
  itemName: string
  itemPhoto: string
  itemPrice: string
  itemDescription?: string
}

export default function AddToWishlistModal({
  isOpen,
  onClose,
  itemName,
  itemPhoto,
  itemPrice,
  itemDescription,
}: AddToWishlistModalProps) {
  const [quantity, setQuantity] = useState(1)

  if (!isOpen) return null

  return (
    <div className={modalStyles.modalOverlay}>
      <div className={modalStyles.modalContent}>
        <h2 className={modalStyles.modalTitle}>Add to Wishlist</h2>
        
        <div>
          <img src={itemPhoto} alt={itemName} className={modalStyles.modalImage} />
          <h3 className={modalStyles.modalItemName}>{itemName}</h3>
          <p className={modalStyles.modalItemPrice}>{itemPrice}</p>
          {itemDescription && <p className={modalStyles.modalItemDescription}>{itemDescription}</p>}
        </div>

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
            className={`${styles.button} ${styles['button-secondary']}`}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className={`${styles.button} ${styles['button-primary']}`}
            onClick={() => {
              // Handle add to wishlist
              onClose()
            }}
          >
            Add to Wishlist
          </button>
        </div>
      </div>
    </div>
  )
} 