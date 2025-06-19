import React, { useState, useEffect, useMemo } from "react";
import { api } from "~/trpc/react";
import { useRouter } from "next/router";
import type { TrendingItem, WishlistProps } from "../models/WishlistEventGuest";
import formatField from "~/utils/formatField";

import styles from "../styles/wishlistcomponent.module.css";
import buttonStyles from "../styles/Button.module.css";

import NotInvited from "./notinvited";

const getItemImage = (item: TrendingItem) => {
  const productImages = [
    "/illustrations/account_visual.png",
    "/illustrations/babyShower.svg",
    "/illustrations/birthdayParty.svg",
  ];

  if (item.imageUrl) {
    return item.imageUrl;
  }

  const fallbackIndex = item.id % productImages.length;
  return productImages[fallbackIndex];
};

const Wishlist: React.FC<WishlistProps> = ({
  contribution,
  eventId: propEventId,
}) => {
  const [trendingItems, setTrendingItems] = useState<TrendingItem[]>([]);
  const router = useRouter();

  // Memoize eventId calculation
  const eventId = useMemo(() => {
    return (
      propEventId ??
      (typeof router.query.eventId === "string"
        ? router.query.eventId
        : Array.isArray(router.query.eventId)
          ? router.query.eventId[0]
          : undefined)
    );
  }, [propEventId, router.query.eventId]);

  // ALL HOOKS MUST BE HERE - BEFORE ANY CONDITIONAL RETURNS

  // Get user data first (this enables other queries)
  const { data: currentUser, isLoading: isLoadingUser } =
    api.user.get.useQuery();
  const username = currentUser?.username;

  // Run these queries in parallel (not dependent on each other)
  const { data: eventData, isLoading: isEventLoading } =
    api.event.getById.useQuery(
      { id: eventId ? Number(eventId) : 0 },
      { enabled: !!eventId },
    );

  const { data: eventPlanner, isLoading: isPlannerLoading } =
    api.invitationPreview.getPlanner.useQuery(
      { eventId: Number(eventId ?? 0), guestUsername: username ?? "" },
      { enabled: !!eventId && !!username },
    );

  const { data: invitationData, isLoading: isInvitationLoading } =
    api.invitationPreview.getInvitationForUserEvent.useQuery(
      { eventId: Number(eventId ?? 0), guestUsername: username ?? "" },
      { enabled: !!eventId && !!username },
    );

  // Only run items query when we have all prerequisites
  const {
    data: itemsData,
    isLoading: isItemsLoading,
    isError,
    refetch,
  } = api.item.getAll.useQuery(
    {
      eventId: eventId ? Number(eventId) : 0,
      username: username ?? "",
    },
    {
      enabled: !!eventId && !!username && !isLoadingUser,
      staleTime: 30000, // 30 seconds
    },
  );

  const setMark = api.item.setMark.useMutation({
    onSuccess: () => void refetch(),
  });

  const deleteItemMutation = api.item.deleteItem.useMutation({
    onSuccess: () => void refetch(),
  });

  // Memoize invitation status calculation - FIXED dependency
  const isInvited = useMemo((): boolean => {
    if (!username || !eventPlanner) return false;

    if (invitationData?.status === "ACCEPTED") return true;
    return username === eventPlanner.createdByUsername;
  }, [invitationData, username, eventPlanner]); // Added eventPlanner dependency

  // Memoize loading state calculation
  const isLoading = useMemo(() => {
    return (
      !router.isReady ||
      isLoadingUser ||
      !username ||
      !eventId ||
      isEventLoading ||
      isPlannerLoading ||
      isInvitationLoading ||
      isItemsLoading
    );
  }, [
    router.isReady,
    isLoadingUser,
    username,
    eventId,
    isEventLoading,
    isPlannerLoading,
    isInvitationLoading,
    isItemsLoading,
  ]);

  // Memoize button class calculation
  const getButtonClass = useMemo(
    () => (item: TrendingItem, buttonType: "contribute" | "external") => {
      if (buttonType === "contribute" && item.userHasContributed) {
        return `${styles.buttonPressed}`;
      } else if (buttonType === "external" && item.state === "external") {
        return `${styles.buttonPressed}`;
      }
      return "";
    },
    [],
  );

  const getButtonText = useMemo(
    () => (item: TrendingItem, buttonType: "contribute" | "external") => {
      if (buttonType === "contribute") {
        return item.userHasContributed ? "Add More" : "Contribute";
      } else if (buttonType === "external") {
        return item.state === "external" ? "Bought" : "Mark Bought";
      }
      return "";
    },
    [],
  );

  // Only update items when data actually changes
  useEffect(() => {
    if (itemsData && itemsData.length > 0) {
      const updatedItems = itemsData.map((item) => ({
        ...item,
        transferCompleted: item.transferCompleted ?? false,
      }));
      setTrendingItems(updatedItems);
    }
  }, [itemsData]);

  // NOW ALL CONDITIONAL RETURNS CAN HAPPEN - ALL HOOKS ARE ABOVE

  if (!eventId) {
    return <div>No event ID provided</div>;
  }

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (!eventData && !isEventLoading) {
    return <div>Event not found</div>;
  }

  if (isInvited === false) {
    return <NotInvited />;
  }

  if (isError) {
    return <div>Failed to load items.</div>;
  }

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
      },
    );
  };

  const handleButtonAction = (
    id: number,
    action: "contributing" | "external",
  ) => {
    const item = trendingItems.find((i) => i.id === id);
    if (!item) return;
    if (item.transferCompleted) {
      alert(
        "the event is over, the transfer of the items is completely done. you can not contribute anymore!",
      );
      return;
    }

    if (action === "external") {
      const newType: TrendingItem["state"] =
        item.state === "external" ? "none" : "external";
      const updatedItem: TrendingItem = {
        ...item,
        state: newType,
        contribution:
          newType === "none"
            ? {
              current: 0,
              total: Number(item.pret),
            }
            : item.contribution,
      };

      setTrendingItems((prev) =>
        prev.map((it) => (it.id === id ? updatedItem : it)),
      );

      setMark.mutate(
        {
          eventId: Number(eventId),
          articleId: id,
          username: username!,
          type: newType,
        },
        {
          onError: () => {
            setTrendingItems((prev) =>
              prev.map((it) => (it.id === id ? item : it)),
            );
          },
        },
      );
    } else {
      const currentAmount = Number(item.contribution?.current) || 0;
      const totalAmount = Number(item.pret);

      if (currentAmount < totalAmount && contribution) {
        contribution(id);
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.wishlistContainer}>
        {/* go back */}
        <button
          className={`${buttonStyles.button} ${buttonStyles["button-secondary"]}`}
          onClick={router.back}
        >
          ← Back
        </button>

        {/* actual wishlist */}
        <h1 className={styles.title}>
          Wishlist View for {eventData?.title ?? eventId}
        </h1>
        <div className={styles.itemsContainer}>
          <div className={styles.itemsGrid}>
            {trendingItems.map((item: TrendingItem) => (
              <div key={item.id} className={styles.itemCard}>
                <div className={styles.itemImage}>
                  {eventPlanner?.createdByUsername === username && (
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

                {/* buttons */}
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

                {/* data */}
                <div className={styles.itemDetails}>
                  <span className={styles.itemName}>{formatField(item.nume)}</span>
                  <div className={styles.itemDetailsEz}>
                    <span className={styles.itemPrice}>{formatField(item.pret)}</span>
                    <span className={styles.itemPriority}>{formatField(item.priority)}</span>
                  </div>
                  <span className={styles.itemDescription}>{formatField(item.desc)}</span>
                  <span className={styles.itemNote}>{formatField(item.note)}</span>
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
