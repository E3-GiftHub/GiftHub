import React from "react";
import Link from "next/link";
import styles from "src/styles/ContainerEventRow.module.css";
import "src/styles/globals.css";
import { FaCalendar } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import type { RouterOutputs } from "~/trpc/react";

type Event = RouterOutputs["eventPreview"]["getUpcomingEvents"][number];

interface ContainerEventRowProps {
  eventData: Event;
}

const ContainerEventRow: React.FC<ContainerEventRowProps> = ({ eventData }) => {
  const eventDate: Date = eventData.date ? new Date(eventData.date) : new Date();
  
  const formattedDate = eventDate.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <Link
      href={`/event-view?id=${eventData.id}`}
      className={styles["event-row-wrapper"]}
    >
      <div className={styles["left-column"]}>
        <img
          className={styles.thumbnail}
          src={eventData.photo ?? '/placeholder.jpg'}
          alt={eventData.title ?? 'event title'}
        />
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
    </Link>
  );
};

export { ContainerEventRow };
