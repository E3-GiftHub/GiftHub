import React from "react";
import styles from "../../styles/MobileFilterMenu.module.css";

interface MobileFilterMenuProps {
  visible: boolean;
  activeTab: string;
  onSelect: (tab: string) => void;
  onClose: () => void;
}

const tabs = ["All", "My events", "Invitations"];

const MobileFilterMenu: React.FC<MobileFilterMenuProps> = ({
  visible,
  activeTab,
  onSelect,
  onClose,
}) => {
  if (!visible) return null;

  return (
    <>
      <div
  className={styles.overlay}
  onClick={onClose}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onClose();
    }
  }}
  role="button"
  tabIndex={0}
/>
      <div className={styles.menu}>
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`${styles.menuItem} ${activeTab === tab ? styles.active : ""}`}
            onClick={() => {
              onSelect(tab);
              onClose();
            }}
          >
            {tab}
          </button>
        ))}
      </div>
    </>
  );
};

export default MobileFilterMenu;
