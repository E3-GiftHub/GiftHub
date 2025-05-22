import React, { useState } from "react";
import CustomContainer from "./CustomContainer";
import InboxContainerHeader from "./InboxContainerHeader";
import styles from "../../styles/InboxContainer.module.css";
import MobileFilterMenu from "./MobileFilterMenu";
import InboxNotification from "~/components/ui/InboxNotification";
import type { InboxNotificationResponse } from "~/models/InboxNotificationResponse";
import { api } from "~/trpc/react";

const InboxContainer = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [showMobileFilter, setShowMobileFilter] = useState(false);


  const { data: contributions = [] } =
    api.contributions.getContributionsForUserEvents.useQuery();

  const { data: purchasedItems = [] } =
    api.contributions.getPurchasedItemsForUserEvents.useQuery();

  const { data: invitations = [] } =
    api.invitationsNotification.getUserInvitations.useQuery();

const notifications: InboxNotificationResponse[] = [
  ...contributions.map((n, idx) => ({
    id: `contribution-${idx}`,
    text: n.text,
    type: n.type as "event" | "invitation",
    link: n.link,
    firstName: n.firstName ?? "",
    lastName: n.lastName ?? "",
    profilePicture: n.profilePicture ?? "",
    notificationDate: n.notificationDate ?? new Date().toISOString(),
  })),
  ...purchasedItems.map((n, idx) => ({
    id: `purchase-${idx}`,
    text: n.text,
    type: n.type as "event" | "invitation",
    link: n.link,
    firstName: n.firstName ?? "",
    lastName: n.lastName ?? "",
    profilePicture: n.profilePicture ?? "",
    notificationDate: n.notificationDate ?? new Date().toISOString(),
  })),
  ...invitations.map((n) => ({
    id: n.id,
    text: n.description,
    type: n.type as "event" | "invitation",
    link: n.link,
    firstName: n.firstName ?? "",
    lastName: n.lastName ?? "",
    profilePicture: n.profilePicture ?? "",
    notificationDate: n.createdAt
      ? new Date(n.createdAt).toISOString()
      : new Date().toISOString(),
  })),
].sort(
    (a, b) =>
      new Date(b.notificationDate).getTime() -
      new Date(a.notificationDate).getTime()
  );

  const filtered = notifications.filter((n) => {
    if (activeTab === "All") return true;
    if (activeTab === "My events") return n.type === "event";
    if (activeTab === "Invitations") return n.type === "invitation";
    return false;
  });

  const totalCount = notifications.length;

  const handleNotificationClick = (_id: string | number, link: string) => {
    window.location.href = `http://localhost:3000${link}`;
  };

  return (
    <CustomContainer>
      <InboxContainerHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenMobileFilter={() => setShowMobileFilter(true)}
        totalCount={totalCount}
      />

      <hr className={styles.separator} />

      <MobileFilterMenu
        visible={showMobileFilter}
        activeTab={activeTab}
        onSelect={setActiveTab}
        onClose={() => setShowMobileFilter(false)}
      />

      <div className={styles.notificationList}>
        {filtered.map((n) => (
          <InboxNotification
            key={n.id}
            data={n}
            onClick={() => handleNotificationClick(n.id, n.link)}
          />
        ))}
      </div>
    </CustomContainer>
  );
};

export default InboxContainer;
