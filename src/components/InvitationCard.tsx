import { api } from "~/trpc/react";
import { useRouter } from "next/router";
import styles from "../styles/invitationcard.module.css";
import { ButtonComponent, ButtonStyle } from "./ui/ButtonComponent";
import type { InvitationProps } from "../models/InvitationEventGuest.ts";
import NotInvited from "./notinvited";
import React from "react";

export default function InvitationCard({
  invitationId,
  onAccept,
  onDecline,
}: {
  invitationId: number;
  onAccept?: () => void;
  onDecline?: () => void;
}) {
  // luam userul curent care foloseste acm pagina 
  const { data: currentUser } = api.user.getSelf.useQuery();

  // aici luam idul invitatiei
  const invitationQuery = api.invitationPreview.getInvitationById.useQuery(
    { invitationId },
    { enabled: !!invitationId }
  );
  const invitationData = invitationQuery.data;
  const isInvitationLoading = invitationQuery.isLoading;

  // datele pentru eveniment
  const eventData = invitationData?.event;
  const isEventLoading = isInvitationLoading; // event is loaded with invitation

  const guestUsername = invitationData?.guestUsername;

  const acceptInvitation = api.invitationPreview.acceptInvitation.useMutation();

  if (isInvitationLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (!invitationData || invitationData.status === "ACCEPTED") {
    return <NotInvited />;
  }

  const handleAccept = () => {
    if (eventData?.id && guestUsername) {
      acceptInvitation.mutate({ eventId: eventData.id, guestUsername });
      onAccept?.();
    }
  };

  const handleDecline = () => {
    onDecline?.();
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
              onClick={handleAccept}
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