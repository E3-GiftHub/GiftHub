import { useRouter } from "next/router";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import { api } from "~/trpc/react";

import formatImage from "~/utils/formatImage";
import type { EbayItem } from "~/models/EbayItem";
import type { WishlistInputItem } from "~/models/WishlistInputItem";

import Navbar from "../components/Navbar";
import AddToWishlistModal from "../components/AddToWishlistModal";
import CustomWishlistModal from "../components/CustomWishlistModal";
import Termination from "~/components/Termination";

import styles from "../styles/WishlistPage.module.css";
import buttonStyles from "../styles/Button.module.css";
import "./../styles/globals.css";

type ItemCreateResponse = {
  itemId: number;
};

export default function CreateWishlist() {
  const router = useRouter();
  const { eventId } = router.query;

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  const { data: searchResults = [], isLoading } = api.ebay.search.useQuery(
    { query: debouncedSearchTerm },
    { enabled: debouncedSearchTerm.length > 1 },
  );

  const [isCustomOpen, setIsCustomOpen] = useState(false);
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

  const { mutateAsync: addItemToWishlist } = api.wishlist.addItem.useMutation();

  const handleAddToWishlist = async (item: WishlistInputItem) => {
    try {
      // 1. First, save the item into the `Item` table (this logic needs an endpoint if not already present)
      const itemResponse = await fetch("/api/item-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });

      const result = (await itemResponse.json()) as ItemCreateResponse;
      console.log("🪵 /api/item-create result:", result);
      const itemId = result.itemId;
      if (!itemId) {
        throw new Error("Item creation failed. No ID returned.");
      }

      const p = item.priority?.valueOf();
      let priority: "LOW" | "MEDIUM" | "HIGH" | null = null;
      if (1 === p) priority = "LOW";
      else if (2 === p) priority = "MEDIUM";
      else if (3 === p) priority = "HIGH";

      // 2. Add to wishlist (EventArticle)
      for (let i = 0; i < item.quantity; i++) {
        await addItemToWishlist({
          eventId: Number(eventId),
          item: {
            itemId,
            quantity: 1, // single entry at a time
            priority: priority,
            note: item.note,
          },
        });
      }

      console.log("Item added to wishlist in DB");
      closeModal();
    } catch (err) {
      console.error("❌ Failed to add item to wishlist", err);
    }
  };

  const closeCustom = async (key: string | null) => {
    setIsCustomOpen(false);
    if (!key || "" === key) return;

    try {
      await fetch("/api/cancel-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: key }),
      });
    } catch (err) {
      console.error("❌ Failed to cancel upload", err);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Navbar />
      <div className={styles.container}>
        <main className={styles.main}>
          {/* go back */}
          <button
            className={`${buttonStyles.button} ${buttonStyles["button-secondary"]}`}
            onClick={router.back}
          >
            ← Back
          </button>

          {/* create custom article */}
          <button
            className={`${buttonStyles.button} ${buttonStyles["button-primary"]}`}
            onClick={() => setIsCustomOpen(true)}
          >
            Create custom article
          </button>

          {isCustomOpen && (
            <CustomWishlistModal
              onAddToWishlist={handleAddToWishlist}
              onClose={closeCustom}
            />
          )}

          <div className={styles.titleContainer}>
            <h1 className={styles.title}>
              Add Item to the Wishlist for Event {eventId}
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
          {isLoading && <p className={styles.searchLabel}>Searching...</p>}
          {!isLoading &&
            debouncedSearchTerm.length > 1 &&
            searchResults.length === 0 && (
              <p className={styles.searchLabel}>No items found :(</p>
            )}

          {searchResults.length > 0 && (
            <div className={styles.itemGrid}>
              {searchResults.map((item: EbayItem) => (
                <div key={item.itemId} className={styles.itemCard}>
                  <div className={styles.itemImage}>
                    <img
                      src={formatImage(item.image?.imageUrl, "/logo.png")}
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
                          photo: item.image?.imageUrl ?? "",
                          price: `${item.price?.value} ${item.price?.currency}`,
                          description: item.shortDescription ?? "",
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
              itemDescription={selectedItem.description ?? ""}
              onAddToWishlist={handleAddToWishlist}
            />
          )}
        </main>
        <Termination
          eventId={Number(eventId)}
          invitationId={null}
          articleId={null}
        />
      </div>
    </div>
  );
}
