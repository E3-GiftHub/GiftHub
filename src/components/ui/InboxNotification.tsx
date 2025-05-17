import React from "react";
import styles from "../../styles/InboxNotification.module.css";
import type { NotificationResponse } from "~/components/ui/InboxContainer";
import { FaEllipsisH, FaTrash, FaCheck } from "react-icons/fa";

interface InboxNotificationProps {
  data: NotificationResponse;
  onClick: () => void;
  isExpanded: boolean;
  onExpand: () => void;
}

const InboxNotification: React.FC<InboxNotificationProps> = ({
  data,
  onClick,
  isExpanded,
  onExpand,
}) => {
  const nameInitials =
    data.firstName.charAt(0).toUpperCase() +
    data.lastName.charAt(0).toUpperCase();

  const hasProfilePic = data.profilePicture !== undefined;
  const notificationDate: Date = new Date(data.notificationDate);
  const currentDate: Date = new Date();
  const timeDiff = Math.abs(currentDate.getTime() - notificationDate.getTime());
  const diffHours = Math.floor(timeDiff / (1000 * 3600));

  return (
    <div
      key={data.id}
      onClick={onClick}
      className={styles["notification-container"]}
      style={{ opacity: data.read ? 0.5 : 1 }}
    >
      <div className={styles["notification-info"]}>
        {hasProfilePic ? (
          <img
            src={data.profilePicture}
            className={styles["notification-icon"]}
          />
        ) : (
          <div className={styles["notification-icon"]}>{nameInitials}</div>
        )}
        <p className={styles["notification-text"]}>{data.text}</p>
      </div>
      <div className={styles["notification-options"]}>
        <p className={styles["notification-options-row"]}>{diffHours}h</p>
        <div className={styles["notification-options-row"]}>
          {isExpanded && (
            <button className={`${styles["option-left"]} ${styles.option}`}>
              <FaTrash /> Delete
            </button>
          )}
          {isExpanded && (
            <button className={`${styles["option-right"]} ${styles.option}`}>
              <FaCheck /> Mark as read
            </button>
          )}
          <button
            className={styles["options-button"]}
            onClick={(e) => {
              e.stopPropagation();
              onExpand();
            }}
          >
            <FaEllipsisH size={"1.5rem"} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InboxNotification;
