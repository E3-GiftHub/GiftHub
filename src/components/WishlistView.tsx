import React, { useState, useEffect } from "react";
import styles from "../styles/wishlistcomponent.module.css";
import { api } from "~/trpc/react";
import type { TrendingItem, WishlistProps } from "../models/WishlistEventGuest";
import NotInvited from "./notinvited";
import { useRouter } from "next/router";

// Functia asta ia imaginile based on id-ul produsului
const getItemImage = (item: TrendingItem) => {
  const productImages = [
    "/illustrations/account_visual.png",
    "/illustrations/babyShower.svg",
    "/illustrations/birthdayParty.svg",
  ];
  //daca produsu are o imagine, o pune pe aia
  if (item.imageUrl) {
    return item.imageUrl;
  }
  //altfel foloseste una de aici  gen de mai sus
  else {
    const imageIndex = item.id % productImages.length;
    return productImages[imageIndex];
  }
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
    api.user.get.useQuery();
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

  console.log("cacat", eventP?.createdByUsername, username);

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
    if (!item) {
      return;
    } else {
      if (action === "external") {
        const newType = item.state === "external" ? "none" : "external";
        setTrendingItems((prev) =>
          prev.map((it) => (it.id === id ? { ...it, state: newType } : it)),
        );
        setMark.mutate(
          {
            eventId: Number(eventId),
            articleId: id,
            username: username,
            type: newType,
          },
          {
            onError: () => {
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
        const totalAmount = Number(item.pret);
        if (currentAmount < totalAmount) {
          if (contribution) {
            contribution();
          }
        }
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
