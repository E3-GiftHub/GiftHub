"use client";

import { useRouter } from "next/router";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import { api } from "~/trpc/react";
import Navbar from "../components/Navbar";
import AddToWishlistModal from "../components/AddToWishlistModal";
import styles from "../styles/WishlistPage.module.css";
import buttonStyles from "../styles/Button.module.css";
import "./../styles/globals.css";

// Mock data for demonstration
const mockWishlists = new Map<
  string,
  {
    items: Array<{
      name: string;
      photo: string;
      price: string;
      quantity: number;
    }>
  }
>();

export default function CreateWishlist() {
  const router = useRouter();
  const { eventId } = router.query;

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  const { data: searchResults = [], isLoading } = api.ebay.search.useQuery(
    { query: debouncedSearchTerm },
    { enabled: debouncedSearchTerm.length > 1 }
  );

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

  const closeModal = () => setIsModalOpen(false);

  const handleCancel = () => router.back();

  const handleSave = () => {
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
              Create Wishlist for Event {eventId}
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
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Search Results */}
          {isLoading && <p>Searching...</p>}

          {searchResults.length > 0 && (
            <div className={styles.itemGrid}>
              {searchResults.map((item: any) => (
                <div key={item.itemId} className={styles.itemCard}>
                  <div className={styles.itemImage}>
                    <img
                      src={item.image?.imageUrl}
                      alt={item.title}
                      style={{ width: "100%", height: "auto" }}
                    />
                  </div>
                  <div className={styles.itemContent}>
                    <h3 className={styles.itemTitle}>{item.title}</h3>
                    <p className={styles.itemPrice}>
                      {item.price?.value} {item.price?.currency}
                    </p>
                    <button
                      className={`${buttonStyles.button} ${buttonStyles["button-primary"]}`}
                      onClick={() =>
                        openModal({
                          name: item.title,
                          photo: item.image?.imageUrl || "",
                          price: `${item.price?.value} ${item.price?.currency}`,
                          description: item.shortDescription || "",
                        })
                      }
                    >
                      Add to Wishlist
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal */}
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
