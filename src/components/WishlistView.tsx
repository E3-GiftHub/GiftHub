import React, { useState, useEffect } from "react";
import styles from "../styles/wishlistcomponent.module.css";
import { api } from "~/trpc/react";
import type { TrendingItem, WishlistProps } from "../models/WishlistEventGuest";
import NotInvited from "./notinvited";
import { useRouter } from "next/router";

//?????? ce comit viseaza git??????
// Functia asta ia imaginile based on id-ul produsului
const getItemImage = (item: TrendingItem) => {
  const productImages = [
    "/illustrations/account_visual.png",
    "/illustrations/babyShower.svg", 
    "/illustrations/birthdayParty.svg",
  ];
  
  // If the product has an image URL, use it
  if (item.imageUrl) {
    return item.imageUrl;
  }
  
  // Otherwise, use a fallback image based on item ID
  const fallbackIndex = item.id % productImages.length;
  return productImages[fallbackIndex];
};

const Wishlist: React.FC<WishlistProps> = ({
  contribution,
  eventId: propEventId,
}) => {
  const [trendingItems, setTrendingItems] = useState<TrendingItem[]>([]);
  const [isInvited, setIsInvited] = useState<boolean | null>(null);
  const router = useRouter();

  const eventId =
    propEventId ??
    (typeof router.query.eventId === "string"
      ? router.query.eventId
      : Array.isArray(router.query.eventId)
        ? router.query.eventId[0]
        : undefined);
  const { data: currentUser, isLoading: isLoadingUser } =
    api.user.getSelf.useQuery();
  const username = currentUser?.username;

  const { data, isLoading, isError, refetch } = api.item.getAll.useQuery(
    {
      eventId: eventId ? Number(eventId) : 0,
      username: username ?? "",
    },
    {
      enabled: !!eventId && !!username && !isLoadingUser,
    },
  );

  const setMark = api.item.setMark.useMutation({
    onSuccess: () => void refetch(),
  });
  const deleteItemMutation = api.item.deleteItem.useMutation({
  onSuccess: () => void refetch(),
  });

  const handleDeleteItem = (itemId: number) => {
  if (!window.confirm("Are you sure you want to delete this item?")) return;

  deleteItemMutation.mutate(
    { eventId: Number(eventId), itemId },
      {
        onSuccess: (res) => {
          if (!res.success) {
            alert(res.message);
          }
        },
        onError: () => {
          alert("Something went wrong. Try again.");
        },
      }
    );
  };

  const { data: eventData, isLoading: isEventLoading } =
    api.event.getById.useQuery(
      {
        id: eventId ? Number(eventId) : 0,
      },
      {
        enabled: !!eventId,
      },
    );

  //! check invites
  const { data: invitationData, isLoading: isInvitationLoading } =
    api.invitationPreview.getInvitationForUserEvent.useQuery(
      { eventId: Number(eventId), guestUsername: username ?? "" },
      { enabled: !!eventId && !!username && !isLoadingUser },
    );

  useEffect(() => {
    if (!username) return;
    if (data) {
      const updatedItems = data.map((item) => ({
        ...item,
        transferCompleted: item.transferCompleted ?? false,
      }));
      setTrendingItems(updatedItems);
    }
  }, [data]);

  //! check planner
  const { data: eventP } = api.invitationPreview.getPlanner.useQuery(
    { eventId: Number(eventId), guestUsername: username ?? "" },
    { enabled: !!eventId && !!username && !isLoadingUser },
  );

  useEffect(() => {
    if (!eventP) return;
    if (invitationData) {
      setIsInvited(invitationData.status === "ACCEPTED"); //doar accepted! fara nonchalant kings :P
    } else if (invitationData === null) {
      setIsInvited(username === eventP.createdByUsername);
    }
  }, [invitationData]);

  console.log("Planner: ", eventP?.createdByUsername, username);

  // aratam bucla aia rotativa krazy frog cat timp se iau datele pt event :P
  if (
    !router.isReady ||
    isLoading ||
    isEventLoading ||
    isInvitationLoading ||
    isInvited === null ||
    isLoadingUser ||
    !username
  ) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  } else {
    if (!eventId) {
      return <div>No event ID provided</div>;
    } else {
      if (!eventData && !isLoading) {
        return <div>Event not found</div>;
      } else {
        if (!isInvited) {
          return <NotInvited />;
        } else {
          if (isError) {
            return <div>Failed to load items.</div>;
          }
        }
      }
    }
  }

  const getButtonClass = (
    item: TrendingItem,
    buttonType: "contribute" | "external",
  ) => {
    if (
      (buttonType === "contribute" && item.state === "contributing") ||
      (buttonType === "external" && item.state === "external")
    ) {
      return `${styles.buttonPressed}`;
    } else {
      return "";
    }
  };

  const getButtonText = (
    item: TrendingItem,
    buttonType: "contribute" | "external",
  ) => {
    if (buttonType === "contribute") {
      return "Contribute";
    } else {
      if (buttonType === "external") {
        return item.state === "external" ? "Bought" : "Mark Bought";
      } else {
        return "";
      }
    }
  };

  const handleButtonAction = (
    id: number,
    action: "contributing" | "external",
  ) => {
    const item = trendingItems.find((i) => i.id === id);
    if (!item) return;

    if (action === "external") {
      // Optimistically update UI first
      const newType = item.state === "external" ? "none" : "external";
      setTrendingItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, state: newType } : it)),
      );
      
      // Then make the server call
      setMark.mutate(
        {
          eventId: Number(eventId),
          articleId: id,
          username: username,
          type: newType,
        },
        {
          onError: () => {
            // Revert on error
            setTrendingItems((prev) =>
              prev.map((it) =>
                it.id === id ? { ...it, state: item.state } : it,
              ),
            );
          },
        },
      );
    } else {
      const currentAmount = Number(item.contribution?.current) || 0;
      const totalAmount = Number(item.pret);      if (currentAmount < totalAmount && contribution) {
        contribution(id);
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.wishlistContainer}>
        <h1 className={styles.title}>
          Wishlist View for{" "}
          {isEventLoading ? "..." : (eventData?.title ?? eventId)}
        </h1>
        <div className={styles.itemsContainer}>
          <div className={styles.itemsGrid}>
            {trendingItems.map((item: TrendingItem) => (
              <div key={item.id} className={styles.itemCard}>
                <div className={styles.itemImage}>
                  {eventP?.createdByUsername === username && (
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className={styles.deleteButton}
                      title="Delete item"
                    >
                      ❌
                    </button>
                  )}

                  <img
                    src={getItemImage(item)}
                    alt={item.nume}
                    className={styles.actualItemImage}
                  />
                  {item.state === "contributing" && item.contribution && (
                    <div className={styles.contributionOverlay}>
                      <div className={styles.contributionText}>
                        {item.contribution.total > 0
                          ? Math.round(
                              (item.contribution.current /
                                item.contribution.total) *
                                100,
                            )
                          : 0}
                        %
                      </div>
                      <div className={styles.contributionProgress}>
                        <div
                          className={styles.contributionBar}
                          style={{
                            transform: `scaleX(${item.contribution.total > 0 ? item.contribution.current / item.contribution.total : 0})`,
                          }}
                        ></div>
                      </div>
                      <div className={styles.contributionAmount}>
                        ${item.contribution.current} of $
                        {item.contribution.total}
                      </div>
                    </div>
                  )}
                </div>
                <div className={styles.itemDetails}>
                  <span className={styles.itemName}>{item.nume}</span>
                  <span className={styles.itemPrice}>{item.pret}</span>
                </div>
                <div className={styles.buttonsContainer}>
                  <div className={styles.actionButtonsRow}>
                    <button
                      className={`${styles.contributeButton} ${getButtonClass(item, "contribute")}`}
                      onClick={() =>
                        handleButtonAction(item.id, "contributing")
                      }
                      disabled={
                        item.state === "external" ||
                        setMark.status === "pending"
                      }
                    >
                      {getButtonText(item, "contribute")}
                    </button>
                    <button
                      className={`${styles.externalButton} ${getButtonClass(item, "external")}`}
                      onClick={() => handleButtonAction(item.id, "external")}
                      disabled={
                        item.state === "contributing" ||
                        setMark.status === "pending"
                      }
                    >
                      {getButtonText(item, "external")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
