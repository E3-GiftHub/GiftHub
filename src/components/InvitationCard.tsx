import { api } from "~/trpc/react";
import styles from "../styles/invitationcard.module.css";
import { ButtonComponent, ButtonStyle } from "./ui/ButtonComponent";
import type { InvitationProps } from "../models/InvitationEventGuest.ts";

const EVENT_ID = 13;
const GUEST_USERNAME = "user2";

export default function InvitationCard({
  onAccept,
  onDecline,
  eventId = EVENT_ID,
  guestUsername = GUEST_USERNAME,
}: Pick<
  InvitationProps,
  "onAccept" | "onDecline" | "eventId" | "guestUsername"
>) {
  const acceptInvitation = api.invitationPreview.acceptInvitation.useMutation();
  const { data: eventData, isLoading: isEventLoading } =
    api.event.getById.useQuery({ id: eventId });

  const handleAccept = () => {
    acceptInvitation.mutate({ eventId, guestUsername });
    console.log("ACCEPTAT!!!");
    onAccept?.();
  };

  const handleDecline = () => {
    console.log("RESPINS!!!");
    onDecline?.();
  };

  const handleAcceptClick = () => {
    handleAccept();
  };

  return (
    <div className={styles.container}>
      <div className={styles.envelope}>
        <div className={styles.envelopeBack}></div>
        <div className={styles.card}>
          <div className={styles.cardContent}>
            <div>
              <h2 className={styles.title}>
                {isEventLoading ? "Loading..." : eventData?.title}
              </h2>
            </div>
            <div className={styles.details}>
              <div className={styles.detailItem}>
                <span className={styles.icon}>📅</span>
                <span>
                  {isEventLoading
                    ? ""
                    : eventData?.date
                      ? new Date(eventData.date).toLocaleString()
                      : ""}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.icon}>📍</span>
                <span>{isEventLoading ? "" : eventData?.location}</span>
              </div>
              <p className={styles.description}>
                {isEventLoading ? "" : eventData?.description}
              </p>
            </div>
            <div className={styles.actions}>
              <ButtonComponent
                text="Decline invite"
                style={ButtonStyle.PRIMARY}
                onClick={handleDecline}
              />
              <ButtonComponent
                text="Accept invite"
                style={ButtonStyle.PRIMARY}
                onClick={handleAcceptClick}
              />
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