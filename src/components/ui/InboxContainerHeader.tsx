import React, { useEffect, useState } from "react";
import styles from "../../styles/InboxContainerHeader.module.css";
import { MdFilterList } from "react-icons/md";

const tabs = ["All", "My events", "Invitations"];

interface InboxHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenMobileFilter: () => void;
  totalCount: number;
}

const InboxContainerHeader: React.FC<InboxHeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenMobileFilter,
  totalCount,
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
              <MdFilterList size={22} color="#c8abd6" />
            </button>
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.headerWrapper}>
      <div className={styles.topRow}>
        <h3 className={styles.title}>Notifications</h3>
      </div>

      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.active : ""}`}
            onClick={() => onTabChange(tab)}
          >
            {tab}
            {tab === "All" && totalCount > 0 && (
              <span className={styles.badge}>{totalCount}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default InboxContainerHeader;
