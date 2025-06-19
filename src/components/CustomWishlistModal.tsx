import React, { useState } from "react";
import { UploadButton } from "~/utils/uploadthing";

import styles from "~/styles/Button.module.css";
import modalStyles from "~/styles/ModalCustomItem.module.css";

// typescript compliant, not prisma!
import { PriorityTypeEnum } from "~/models/PriorityTypeEnum";
import type { WishlistInputItem } from "~/models/WishlistInputItem";

interface CustomWishlistModalProps {
  onAddToWishlist: (item: WishlistInputItem) => void;
  onClose: (key: string | null) => void;
}

export default function CustomWishlistModal({
  onAddToWishlist,
  onClose,
}: Readonly<CustomWishlistModalProps>) {
  const noPriority = -1;
  const [name, setName] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [photo, setPhoto] = useState<string>("/UserImages/default_pfp.svg");
  const [key, setKey] = useState<string | null>(null);
  const [price, setPrice] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [priority, setPriority] = useState<PriorityTypeEnum | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const stripEmpty = (input: string | null): string | null => {
    if (null === input) return null;
    if ("" === input) return null;
    return input;
  };

  const handleAddToWishlist = () => {
    onAddToWishlist({
      name: stripEmpty(name),
      description: stripEmpty(description),
      photo: photo,
      key: stripEmpty(key),
      price: stripEmpty(price),
      quantity: quantity,
      priority:
        priority === (Number(noPriority) as PriorityTypeEnum) ? null : priority,
      note: stripEmpty(note),
      retailer: null,
    });
    onClose(null);
  };

  const onUploadComplete = (res: { url: string; key: string }[]) => {
    const result = res[0]!;
    if (!result || "" === result.url || "" === result.key)
      alert("Upload failed");

    setPhoto(result.url);
    setKey(result.key);
    alert("Upload complete");
  };

  const onUploadError = (error: Error) => {
    console.error(error);
    alert("Upload error");
  };

  return (
    <div className={modalStyles.modalOverlay}>
      <div className={modalStyles.modalContent}>
        <h2 className={modalStyles.modalTitleAdd}>
          Add custom article to Wishlist
        </h2>

        {/** IMAGE */}
        <div className={modalStyles.product}>
          <div className={modalStyles.leftside}>
            <div className={modalStyles.wrapperUploadButton}>
              <img
                src={photo}
                alt={name ?? "find a way to visualize without vision my friend"}
                className={modalStyles.modalImage}
              />
            </div>
            <div className={modalStyles.wrapperUploadButton}>
              <UploadButton
                className={modalStyles.customUploadButton}
                endpoint="articlePfpUploader"
                input={{ key: key ?? "" }}
                onClientUploadComplete={onUploadComplete}
                onUploadError={onUploadError}
              />
            </div>
          </div>

          {/** PLANNER INPUT */}
          <div className={modalStyles.productInfo}>
            <div className={modalStyles.plannerInputs}>
              <label htmlFor="name" className={modalStyles.nameLabel}>
                Add the name:
              </label>
              <input
                type="string"
                id="name"
                value={name ?? ""}
                onChange={(e) => setName(String(e.target.value))}
                className={modalStyles.noteInput}
              />

              <label htmlFor="desc" className={modalStyles.descLabel}>
                Add the description of the article:
              </label>
              <input
                type="string"
                id="desc"
                value={description ?? ""}
                onChange={(e) => setDescription(String(e.target.value))}
                className={modalStyles.noteInput}
              />

              <label htmlFor="price" className={modalStyles.priceLabel}>
                Price:
              </label>
              <input
                type="string"
                id="price"
                value={price ?? ""}
                onChange={(e) => setPrice(String(e.target.value))}
                className={modalStyles.noteInput}
              />

              <label htmlFor="note" className={modalStyles.noteLabel}>
                Add a note for your guests:
              </label>
              <input
                type="string"
                id="note"
                value={note ?? ""}
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
                  value={priority ?? ""}
                  onChange={(e) =>
                    setPriority(Number(e.target.value) as PriorityTypeEnum)
                  }
                  className={modalStyles.priorityInput}
                >
                  <option value={noPriority}>None</option>
                  <option value={PriorityTypeEnum.LOW}>Low</option>
                  <option value={PriorityTypeEnum.MEDIUM}>Medium</option>
                  <option value={PriorityTypeEnum.HIGH}>High</option>
                </select>
              </div>
            </div>
            <div className={modalStyles.modalButtons}>
              <button
                className={`${styles.button} ${styles["button-secondary"]}`}
                onClick={() => onClose(key)}
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
