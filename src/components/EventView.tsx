import React, { useState } from "react";
import { Clock, MapPin, Users, Image, Flag } from "lucide-react";
import styles from "../styles/EventView.module.css";
import type { EventData, EventViewProps } from "~/models/EventData";

const EventView: React.FC<EventViewProps> = ({
  eventData,
  onContribute,
  onViewWishlist,
  onMediaView,
  onReport,
}) => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const handleReport = () => {
    if (reportReason.trim()) {
      onReport?.(reportReason);
      setShowReportModal(false);
      setReportReason("");
    }
  };

  const handleViewWishlist = () => {
    onViewWishlist?.();
  };

  const handleMediaView = () => {
    onMediaView?.();
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>{eventData.title}</h1>
          <button
            onClick={() => setShowReportModal(true)}
            className={styles.reportButton}
            title="Report Event"
          >
            <Flag className={styles.icon} />
          </button>
        </div>

        <div className={styles.mainGrid}>
          {/* Left Column - Event Details */}
          <div className={styles.leftColumn}>
            <div className={styles.eventCard}>
              {/* Event Image */}
              <img
                src={eventData.picture}
                alt={eventData.title}
                className={styles.eventImage}
              />

              {/* Event Info Grid */}
              <div className={styles.infoGrid}>
                <div className={styles.infoCard}>
                  <div className={styles.infoLabel}>
                    <Clock className={styles.icon} />
                    <span>Time</span>
                  </div>
                  <span className={styles.infoValue}>{eventData.time}</span>
                </div>

                <div className={styles.infoCard}>
                  <span className={styles.infoLabel}>Date</span>
                  <div className={styles.infoValue}>{eventData.date}</div>
                </div>

                <div className={styles.infoCard}>
                  <span className={styles.infoLabel}>Goal</span>
                  <div className={styles.infoValue}>${1 /* todo change */}</div>
                </div>

                <button
                  onClick={handleMediaView}
                  className={styles.infoCardButton}
                >
                  <Image className={styles.icon} />
                  <span>Media</span>
                </button>
              </div>

              {/* Location */}
              <div className={styles.locationCard}>
                <div className={styles.locationLabel}>
                  <MapPin className={styles.icon} />
                  <span>Location</span>
                </div>
                <p className={styles.locationText}>{eventData.location}</p>
              </div>

              {/* Description */}
              <div className={styles.descriptionCard}>
                <h3 className={styles.descriptionTitle}>Description</h3>
                <p className={styles.descriptionText}>
                  {eventData.description}
                </p>
              </div>

              {/* Action Buttons - Moved under description */}
              <div className={styles.actionButtons}>
                <button
                  onClick={handleViewWishlist}
                  className={styles.wishlistButton}
                >
                  View Wishlist
                </button>

                <button
                  onClick={onContribute}
                  className={styles.contributeButton}
                >
                  Contribute
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Guest List Only */}
          <div className={styles.rightColumn}>
            {/* Guest List */}
            <div className={styles.guestCard}>
              <div className={styles.guestHeader}>
                <h3 className={styles.guestTitle}>Attendees</h3>
                <div className={styles.guestCount}>
                  <Users className={styles.icon} />
                  <span>{eventData.guests.length + 1}</span>
                </div>
              </div>

              {/* Event Planner */}
              <div className={styles.plannerSection}>
                <h4 className={styles.sectionTitle}>Event Planner</h4>
                <div className={styles.plannerCard}>
                  <img
                    src={eventData.planner.profilePicture}
                    alt={eventData.planner.name}
                    className={styles.plannerImage}
                  />
                  <div>
                    <p className={styles.plannerName}>
                      {eventData.planner.name}
                    </p>
                    <p className={styles.plannerRole}>Organizer</p>
                  </div>
                </div>
              </div>

              {/* Guests */}
              <div>
                <h4 className={styles.sectionTitle}>Guests</h4>
                <div className={styles.guestsList}>
                  {eventData.guests.map((guest) => (
                    <div key={guest.id} className={styles.guestItem}>
                      <img
                        src={guest.profilePicture}
                        alt={guest.name}
                        className={styles.guestImage}
                      />
                      <p className={styles.guestName}>{guest.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>Report Event</h3>
            <p className={styles.modalDescription}>
              Please let us know why you&apos;re reporting this event
            </p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Describe the issue..."
              className={styles.modalTextarea}
            />
            <div className={styles.modalButtons}>
              <button
                onClick={() => setShowReportModal(false)}
                className={styles.modalButtonSecondary}
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                className={styles.modalButtonPrimary}
              >
                Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventView;
