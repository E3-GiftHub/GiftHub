import React from "react";
import styles from "src/styles/ContainerEventRow.module.css";
import "src/styles/globals.css";
import { FaCalendar } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import type { ShortEventResponse } from "~/models/ShortEventResponse";

interface ContainerEventRowProps {
  eventData: ShortEventResponse;
}

const ContainerEventRow: React.FC<ContainerEventRowProps> = ({ eventData }) => {
  const eventDate: Date = new Date(eventData.date);
  const formattedDate = eventDate.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className={styles["event-row-wrapper"]}>
      <div className={styles["left-column"]}>
        <img className={styles.thumbnail} src={eventData.imageUrl} />
        <p className={styles.title}>{eventData.title}</p>
      </div>
      <div className={styles["right-column"]}>
        <p>
          <FaCalendar /> {formattedDate}
        </p>
        <p>
          <FaLocationDot />
          {eventData.location}
        </p>
      </div>
    </div>
  );
};

export { ContainerEventRow };
