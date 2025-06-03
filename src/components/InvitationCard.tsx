import { api } from "~/trpc/react";
import { useRouter } from "next/router";
import styles from "../styles/invitationcard.module.css";
import { ButtonComponent, ButtonStyle } from "./ui/ButtonComponent";
import type { InvitationProps } from "../models/InvitationEventGuest.ts";
import NotInvited from "./notinvited";

export default function InvitationCard({
  onAccept,
  onDecline,
  guestUsername: propGuestUsername,
}: Pick<
  InvitationProps,
  "onAccept" | "onDecline" | "eventId" | "guestUsername"
>) {
  const router = useRouter();
  const eventId = Number(router.query.id);
  // Get current user from tRPC (session-based)
  const { data: currentUser } = api.user.getSelf.useQuery();
  const guestUsername = propGuestUsername ?? currentUser?.username ?? "";

  const acceptInvitation = api.invitationPreview.acceptInvitation.useMutation();
  const eventQuery = api.event.getById.useQuery({ id: eventId });
  const eventData = eventQuery.data;
  const isEventLoading = eventQuery.isLoading;

  // Invitation check
  const invitationQuery = api.invitationPreview.getInvitationForUserEvent.useQuery(
    { eventId: Number(eventId), guestUsername },
    { enabled: !!eventId && !!guestUsername }
  );
  const invitationData = invitationQuery.data;
  const isInvitationLoading = invitationQuery.isLoading;

  if (isEventLoading || isInvitationLoading) {
    // Center spinner on the whole page, not just the card
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (!invitationData || invitationData.status === "ACCEPTED") {
    //todo sa trimitem mesajul corespunzator 
    // gen : "ai acceptat deja invitatia"
    //pt momentan apare doar ca nu esti invitat(chiar daca esti si ai acceptat deja)
    return  <NotInvited />
  }

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
  );
}