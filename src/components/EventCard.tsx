import styles from '../styles/EventCard.module.css';

type EventCardProps = {
  name?: string;
  description?: string;
  date?: string;
  location?: string;
  image?: string;
};

export default function EventCard({ 
  name = "Birthday Party", 
  description = "Come celebrate with us! Food and drinks will be provided.", 
  date = "May 15, 2025", 
  location = "Central Park, New York", 
  image = "/api/placeholder/160/160"
}: EventCardProps) {
  return (
    <div className={styles.cardContainer}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>{name}</h2>
        <button className={styles.infoButton}>
          <i className="fas fa-info-circle"></i>
        </button>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <img src={image} alt="Event" className={styles.eventImage} />
        <div className={styles.details}>
          <p className={styles.detailItem}>
            <strong>Date:</strong> {date}
          </p>
          <p className={styles.detailItem}>
            <strong>Location:</strong> {location}
          </p>
          <p className={styles.description}>{description}</p>
        </div>
      </div>

      {/* Buttons */}
      <div className={styles.buttonContainer}>
        {/* Reject Invite Button */}
        <button className={styles.rejectButton}>
          Reject invite
        </button>

        {/* Accept Invite Button */}
        <button className={styles.acceptButton}>
          Accept invite
        </button>
      </div>
    </div>
  );
}