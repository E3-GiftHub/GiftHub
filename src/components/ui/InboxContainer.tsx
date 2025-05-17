import React, { useState } from "react";
import CustomContainer from "./CustomContainer";
import InboxContainerHeader from "./InboxContainerHeader";
import styles from "../../styles/InboxContainer.module.css";
import MobileFilterMenu from "./MobileFilterMenu";
import InboxNotification from "~/components/ui/InboxNotification";
import type { InboxNotificationResponse } from "~/models/InboxNotificationResponse";

const initialNotifications: InboxNotificationResponse[] = [
  {
    id: 1,
    text: "You are invited to John's Birthday. See more",
    type: "invitation",
    read: false,
    link: "/invite#",
    firstName: "John",
    lastName: "Johnes",
    profilePicture: "databasepic/profilepic.png",
    notificationDate: "2023-09-15T14:30:00Z",
  },
  {
    id: 2,
    text: "You are invited to Maria's Wedding. See more",
    type: "invitation",
    read: false,
    link: "/invite#",
    firstName: "John",
    lastName: "Johnes",
    profilePicture: undefined,
    notificationDate: "2023-09-15T14:30:00Z",
  },
  {
    id: 3,
    text: "You are invited to Paul's BBQ. See more",
    type: "invitation",
    read: false,
    link: "/invite#",
    firstName: "John",
    lastName: "Johnes",
    profilePicture: "databasepic/profilepic.png",
    notificationDate: "2023-09-15T14:30:00Z",
  },
  {
    id: 4,
    text: "You are invited to Summer Party. See more",
    type: "invitation",
    read: false,
    link: "/invite#",
    firstName: "John",
    lastName: "Johnes",
    profilePicture: "databasepic/profilepic.png",
    notificationDate: "2023-09-15T14:30:00Z",
  },
  {
    id: 5,
    text: "You are invited to Ana's Baby Shower. See more",
    type: "invitation",
    read: true,
    link: "/invite#",
    firstName: "John",
    lastName: "Johnes",
    profilePicture: undefined,
    notificationDate: "2023-09-15T14:30:00Z",
  },
  {
    id: 6,
    text: "Alex contributed 50 lei to your gift",
    type: "event",
    read: true,
    link: "/event#",
    firstName: "John",
    lastName: "Johnes",
    profilePicture: "databasepic/profilepic.png",
    notificationDate: "2023-09-15T14:30:00Z",
  },
  {
    id: 7,
    text: "Radu bought an item from your wishlist",
    type: "event",
    read: true,
    link: "/event#",
    firstName: "John",
    lastName: "Johnes",
    profilePicture: undefined,
    notificationDate: "2023-09-15T14:30:00Z",
  },
  {
    id: 8,
    text: "Ioana added photos to your event",
    type: "event",
    read: true,
    link: "/event#",
    firstName: "John",
    lastName: "Johnes",
    profilePicture: undefined,
    notificationDate: "2023-09-15T14:30:00Z",
  },
];
const InboxContainer = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [notifications, setNotifications] = useState(initialNotifications);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [expandedNotificationId, setExpandedNotificationId] = useState<
    number | null
  >(null);

  const filtered = notifications.filter((n) => {
    if (activeTab === "All") return true;
    if (activeTab === "My events") return n.type === "event";
    if (activeTab === "Invitations") return n.type === "invitation";
    return false;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationClick = (id: number, link: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    window.location.href = `http://localhost:3000${link}`;
  };

  const handleExpand = (id: number) => {
    setExpandedNotificationId((prev) => (prev === id ? null : id));
  };

  return (
    <CustomContainer>
      <InboxContainerHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        unreadCount={unreadCount}
        onMarkAllAsRead={markAllAsRead}
        onOpenMobileFilter={() => setShowMobileFilter(true)}
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
            isExpanded={expandedNotificationId === n.id}
            onExpand={() => handleExpand(n.id)}
          />
        ))}
      </div>
    </CustomContainer>
  );
};

export default InboxContainer;
