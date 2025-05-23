import React from "react";
import styles from "../../styles/InboxNotification.module.css";
import type { InboxNotificationResponse } from "~/models/InboxNotificationResponse";

interface InboxNotificationProps {
  data: InboxNotificationResponse;
  onClick: () => void;
}

const InboxNotification: React.FC<InboxNotificationProps> = ({
  data,
  onClick,
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
    <button
      key={data.id}
      onClick={onClick}
      className={styles["notification-container"]}
      data-testid="notification-container"
   
    >
      <div className={styles["notification-info"]}>
        {hasProfilePic ? (
          <img
            src={data.profilePicture}
            className={styles["notification-icon"]}
            alt={`${data.firstName} ${data.lastName}`}
          />
        ) : (
          <div className={styles["notification-icon"]}>{nameInitials}</div>
        )}
        <p className={styles["notification-text"]}>{data.text}</p>
      </div>
      <div className={styles["notification-options"]}>
        <p className={styles["notification-options-row"]}>{diffHours}h</p>
      </div>
    </button>
  );
};

export default InboxNotification;
