import { api } from "~/trpc/react";
import styles from "../styles/invitationcard.module.css";
import type { InvitationProps } from "../models/InvitationEventGuest.ts";

const EVENT_ID = 13;
const GUEST_USERNAME = "user2";

export default function InvitationCard({
  onAccept,
  onDecline,
  eventId = EVENT_ID,
  guestUsername = GUEST_USERNAME,
}: Pick<InvitationProps, 'onAccept' | 'onDecline' | 'eventId' | 'guestUsername'>) {
  const acceptInvitation = api.invitationPreview.acceptInvitation.useMutation();
  const { data: eventData, isLoading: isEventLoading } = api.event.getById.useQuery({ id: eventId });

  const handleAccept = () => {
    acceptInvitation.mutate({ eventId, guestUsername });
    onAccept?.();
  };

  const handleDecline = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onDecline?.();
  };

  const handleAcceptClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    handleAccept();
  };

  return (
    <div className={styles.container}>
      <div className={styles.envelope}>
        <div className={styles.envelopeBack}></div>
        <div className={styles.card}>
          <div className={styles.cardContent}>
            <div>
              <h2 className={styles.title}>{isEventLoading ? "Loading..." : eventData?.title}</h2>
            </div>
            <div className={styles.details}>
              <div className={styles.detailItem}>
                <span className={styles.icon}>📅</span>
                <span>{isEventLoading ? "" : eventData?.date ? new Date(eventData.date).toLocaleString() : ""}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.icon}>📍</span>
                <span>{isEventLoading ? "" : eventData?.location}</span>
              </div>
              <p className={styles.description}>{isEventLoading ? "" : eventData?.description}</p>
            </div>
            <div className={styles.actions}>
              <button
                className={`${styles.button} ${styles.declineButton}`}
                onClick={handleDecline}
              >
                Decline invite
              </button>
              <button
                className={`${styles.button} ${styles.acceptButton}`}
                onClick={handleAcceptClick}
              >
                Accept invite
              </button>
            </div>
          </div>
        </div>
        <div className={`${styles.flap} ${styles.flapTop}`}></div>
        <div className={`${styles.flap} ${styles.flapLeft}`}></div>
        <div className={`${styles.flap} ${styles.flapRight}`}></div>
      </div>
    </div>
  );
}