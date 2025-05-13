import React, { useEffect, useState } from "react";
import styles from "../../styles/InboxContainerHeader.module.css";
import { MdFilterList } from "react-icons/md";

const tabs = ["All", "My events", "Invitations"];

interface InboxHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  unreadCount: number;
  onMarkAllAsRead: () => void;
  onOpenMobileFilter: () => void;
}

const InboxContainerHeader: React.FC<InboxHeaderProps> = ({
  activeTab,
  onTabChange,
  unreadCount,
  onMarkAllAsRead,
  onOpenMobileFilter,
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 390);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (isMobile) {
    return (
      <div className={styles.mobileHeader}>
        <div className={styles.headerRow}>
        <h3 className={styles.title}>
  Notifications
  <button className={styles.filterButton} onClick={onOpenMobileFilter}>
    < MdFilterList size={22} color="#c8abd6" />
  </button>
</h3>


          <div className={styles.mobileActions}>
            <button className={styles.markReadMobile} onClick={onMarkAllAsRead}>
              Mark all as read
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.headerWrapper}>
      <div className={styles.topRow}>
        <h3 className={styles.title}>Notifications</h3>
        <button className={styles.markRead} onClick={onMarkAllAsRead}>
          Mark all as read
        </button>
      </div>

      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.active : ""}`}
            onClick={() => onTabChange(tab)}
          >
            {tab}
            {tab === "All" && unreadCount > 0 && (
              <span className={styles.badge}>{unreadCount}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default InboxContainerHeader;
