import React, { useState } from "react";
import { Clock, MapPin, Users, Flag, LogOut } from "lucide-react"; // ADAUGĂ LogOut
import styles from "../styles/EventView.module.css";
import type { EventViewProps } from "~/models/EventData";
import { useRouter } from "next/router";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";

const EventView: React.FC<EventViewProps> = ({
  eventData,
  onContribute,
  onViewWishlist,
  onMediaView,
  onReport,
  onViewProfile,
}) => {  
  const router = useRouter();
  const { data: session } = useSession();
  const removeGuest = api.guest.removeGuestFromEvent.useMutation({
    onSuccess: () => {
      void router.push("/home");
    },
  });
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const handleReport = () => {
    if (reportReason.trim()) {
      onReport?.(reportReason);
      setShowReportModal(false);
      setReportReason("");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>{eventData.title}</h1>
          <div className={styles.headerActions}>
            <button
              onClick={() => {
                if (confirm("Are you sure you want to leave this event?")) {
                  const username = session?.user?.name;
                  if (username) {
                    removeGuest.mutate({
                      eventId: Number(eventData.id),
                      guestUsername: username,
                    });
                  }
                }
              }}
              className={styles.leaveButton}
              title="Leave Event"
            >
            </button>

            <button
              onClick={() => setShowReportModal(true)}
              className={styles.reportButton}
              title="Report Event"
            >
              <Flag className={styles.icon} />
            </button>
          </div>
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

              {/* Event Info Grid: Date, Time and Location */}
              <div className={styles.infoGrid}>
                <div className={styles.infoCard}>
                  <div className={styles.infoLabel}>
                    <Clock className={styles.icon} />
                    <span>Date</span>
                  </div>
                  <span className={styles.infoValue}>{eventData.date}</span>
                </div>

                <div className={styles.infoCard}>
                  <div className={styles.infoLabel}>
                    <MapPin className={styles.icon} />
                    <span>Location</span>
                  </div>
                  <span className={styles.infoValue}>{eventData.location}</span>
                </div>

                {/* Description */}
                <div className={styles.descriptionCard}>
                  <h3 className={styles.descriptionTitle}>Description</h3>
                  <p className={styles.descriptionText}>
                    {eventData.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons - Now includes Media */}
              <div className={styles.actionButtons}>
                <button
                  onClick={onViewWishlist}
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

                <button onClick={onMediaView} className={styles.mediaCardButton}>
                  <span>Media</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Guest List Only */}
          <div className={styles.rightColumn}>
            {/* Guest List */}
            <div className={styles.guestCard}>

              {/* Event Planner */}
              <div className={styles.plannerSection}>
                  <div className={styles.plannerTitleSection}>
                    <h4 className={styles.sectionTitle}>Event Planner</h4>
                    <div className={styles.guestCount}>
                      <Users className={styles.icon} />
                      <span>{eventData.guests.length + 1}</span>
                    </div>
                  </div>
                <button
                  className={styles.plannerCard}
                  onClick={() => onViewProfile?.(eventData.planner.id)}
                >
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
                </button>
              </div>

              {/* Guests */}
              <div>
                <h4 className={styles.sectionTitle}>Guests</h4>
                <div className={styles.guestsList}>
                  {eventData.guests.map((guest) => (
                    <button
                      key={guest.id}
                      className={styles.guestItem}
                      onClick={() => onViewProfile?.(guest.id)}
                    >
                      <img
                        src={guest.profilePicture}
                        alt={guest.name}
                        className={styles.guestImage}
                      />
                      <p className={styles.guestName}>{guest.name}</p>
                    </button>
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