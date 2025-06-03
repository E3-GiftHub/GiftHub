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
  
  interface EbayItem {
    itemId: string;
    title: string;
    image?: {
      imageUrl?: string;
    };
    price?: {
      value?: string;
      currency?: string;
    };
    shortDescription?: string;
  }


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

    const { mutateAsync: addItemToWishlist } = api.wishlist.addItem.useMutation();

  const handleAddToWishlist = async (item: {
    name: string;
    photo: string;
    price: string;
    quantity: number;
  }) => {
    try {

      // 1. First, save the item into the `Item` table (this logic needs an endpoint if not already present)
      const itemResponse = await fetch("/api/item-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: item.name,
          description: "", // optional
          imagesUrl: item.photo,
          price: (item.price ?? "").split(" ")[0],
        }),
      });

      const result = await itemResponse.json();
      console.log("🪵 /api/item-create result:", result);
      const itemId = result.itemId;
      if (!itemId) {
        throw new Error("Item creation failed. No ID returned.");
      }

          // 2. Add to wishlist (EventArticle)
          for (let i = 0; i < item.quantity; i++) {
            await addItemToWishlist({
              eventId: Number(eventId),
              item: {
                itemId,
                quantity: 1, // single entry at a time
                priority: "LOW",
              },
            });
          }

          console.log("Item added to wishlist in DB");
          closeModal();
        } catch (err) {
          console.error("❌ Failed to add item to wishlist", err);
        }
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
          {isLoading && <p className={styles.searchLabel}>Searching...</p>}
          {!isLoading && debouncedSearchTerm.length > 1 && searchResults.length === 0 && (
             <p className={styles.searchLabel}>No items found :(</p>
          )}

            {searchResults.length > 0 && (
              <div className={styles.itemGrid}>
                {searchResults.map((item: EbayItem) => (
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
                itemDescription={selectedItem.description}
                onAddToWishlist={handleAddToWishlist}
              />
            )}
          </main>
        </div>
      </div>
    );
  }
