"use client";

import { useRouter } from "next/router";
import { useState } from "react";
// import { Search } from "lucide-react";
import Navbar from "../components/Navbar";
import AddToWishlistModal from "../components/AddToWishlistModal";
import styles from "../styles/WishlistPage.module.css";
import buttonStyles from "../styles/Button.module.css";

// Mock data for demonstration
const mockWishlists = new Map<
  string,
  {
    items: Array<{
      name: string;
      photo: string;
      price: string;
      quantity: number;
    }>;
  }
>();

export default function CreateWishlist() {
  const router = useRouter();
  const { eventId } = router.query;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    name: string;
    photo: string;
    price: string;
    description?: string;
  }>({
    name: "",
    photo: "",
    price: "",
    description: "",
  });

  const openModal = (item: {
    name: string;
    photo: string;
    price: string;
    description?: string;
  }) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    router.back();
  };

  const handleSave = () => {
    // Create a new wishlist if it doesn't exist
    if (!mockWishlists.has(eventId as string)) {
      mockWishlists.set(eventId as string, { items: [] });
    }
    router.back();
  };

  const handleAddToWishlist = (item: {
    name: string;
    photo: string;
    price: string;
    quantity: number;
  }) => {
    if (!mockWishlists.has(eventId as string)) {
      mockWishlists.set(eventId as string, { items: [] });
    }
    const wishlist = mockWishlists.get(eventId as string);
    if (wishlist) {
      wishlist.items.push(item);
      console.log("Added item to wishlist:", item);
      console.log("Current wishlist:", wishlist);
    }
    closeModal();
  };

  return (
    <div className={styles.pageWrapper}>
      <Navbar />
      <div className={styles.container}>
        <main className={styles.main}>
          <div className={styles.titleContainer}>
            <h1 className={styles.title}>
              Create Wishlist for Event1{eventId}
            </h1>
          </div>

          {/* Search Bar */}
          <div className={styles.section}>
            <div className={styles.searchContainer}>
              <label htmlFor="product-search" className={styles.sectionTitle}>
                Search for a product:
              </label>
              <div className={styles.searchWrapper}>
                <input
                  type="text"
                  id="product-search"
                  className={styles.searchInput}
                  placeholder="Search products..."
                />
              </div>
            </div>
          </div>

          {/* Trending Items */}
          <div>
            <h2 className={styles.sectionTitle}>Trending items:</h2>
            <div className={styles.itemGrid}>
              {/* Item 1 */}
              <div className={styles.itemCard}>
                <div className={styles.itemImage}>
                  <span className="text-black">Item1 Photo</span>
                </div>
                <div className={styles.itemContent}>
                  <h3 className={styles.itemTitle}>Item1 Name</h3>
                  <p className={styles.itemPrice}>Item1 Price</p>
                  <button
                    className={`${buttonStyles.button} ${buttonStyles["button-primary"]}`}
                    onClick={() =>
                      openModal({
                        name: "Item1 Name",
                        photo: "Item1 Photo",
                        price: "Item1 Price",
                      })
                    }
                  >
                    Add to Wishlist
                  </button>
                </div>
              </div>

              {/* Item 2 */}
              <div className={styles.itemCard}>
                <div className={styles.itemImage}>
                  <span className="text-black">Item2 Photo</span>
                </div>
                <div className={styles.itemContent}>
                  <h3 className={styles.itemTitle}>Item2 Name</h3>
                  <p className={styles.itemPrice}>Item2 Price</p>
                  <button
                    className={`${buttonStyles.button} ${buttonStyles["button-primary"]}`}
                    onClick={() =>
                      openModal({
                        name: "Item2 Name",
                        photo: "Item2 Photo",
                        price: "Item2 Price",
                      })
                    }
                  >
                    Add to Wishlist
                  </button>
                </div>
              </div>

              {/* Item 3 */}
              <div className={styles.itemCard}>
                <div className={styles.itemImage}>
                  <span className="text-black">Item3 Photo</span>
                </div>
                <div className={styles.itemContent}>
                  <h3 className={styles.itemTitle}>Item3 Name</h3>
                  <p className={styles.itemPrice}>Item3 Price</p>
                  <button
                    className={`${buttonStyles.button} ${buttonStyles["button-primary"]}`}
                    onClick={() =>
                      openModal({
                        name: "Item3 Name",
                        photo: "Item3 Photo",
                        price: "Item3 Price",
                      })
                    }
                  >
                    Add to Wishlist
                  </button>
                </div>
              </div>
            </div>
          </div>

          {isModalOpen && (
            <AddToWishlistModal
              isOpen={isModalOpen}
              onClose={closeModal}
              itemName={selectedItem.name}
              itemPhoto={selectedItem.photo}
              itemPrice={selectedItem.price}
              itemDescription={selectedItem.description}
              onAddToWishlist={handleAddToWishlist}
            />
          )}
        </main>
      </div>
    </div>
  );
}
