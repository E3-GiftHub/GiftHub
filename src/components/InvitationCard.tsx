import { api } from "~/trpc/react";
import { useRouter } from "next/router";
import styles from "../styles/invitationcard.module.css";
import { ButtonComponent, ButtonStyle } from "./ui/ButtonComponent";

import NotInvited from "./notinvited";
import LoadingSpinner from "./loadingspinner";
import React from "react";
import loadingStyles from "../styles/wishlistcomponent.module.css";

export default function InvitationCard({
  invitationId,
  onAccept,
  onDecline,
}: {
  readonly invitationId: number;
  readonly onAccept?: () => void;
  readonly onDecline?: () => void;
}) {
  // luam userul curent care foloseste acm pagina
  const { data: currentUser } = api.user.get.useQuery();

  // aici luam idul invitatiei
  const invitationQuery = api.invitationPreview.getInvitationById.useQuery(
    { invitationId },
    { enabled: !!invitationId },
  );
  const invitationData = invitationQuery.data;
  const isInvitationLoading = invitationQuery.isLoading;

  // datele pentru eveniment
  const eventData = invitationData?.event;
  const isEventLoading = isInvitationLoading; // event is loaded with invitation

  const guestUsername = invitationData?.guestUsername;

  const acceptInvitation = api.invitationPreview.acceptInvitation.useMutation();
  
  // ✅ ADDED: Decline invitation mutation
  const declineInvitation = api.invitationPreview.declineInvitation.useMutation();
  
  const router = useRouter();

  if (isInvitationLoading)return (
    <div className={styles.editMediaModalWrapper}>
      <div className={styles.editMediaModalContent}>
        <div className={loadingStyles.loadingContainer}>
          <div className={loadingStyles.spinner} data-testid="loading-spinner"></div>
        </div>
      </div>
    </div>
  );

  const handleAccept = () => {
    // Previne click-uri multiple în timpul procesării
    if (acceptInvitation.status === "pending" || declineInvitation.status === "pending") {
      return;
    }

    if (eventData?.id && guestUsername) {
      acceptInvitation.mutate(
        { eventId: eventData.id, guestUsername },
        {
          onSuccess: () => {
            void router.push(`/event?id=${eventData.id}`);
          },
          onError: (error) => {
            console.error("Error accepting invitation:", error);
            alert("Failed to accept invitation. Please try again.");
          },
        },
      );
      onAccept?.();
    }
  };

  // ✅ UPDATED: Handle decline with database deletion
  const handleDecline = () => {
    // Previne click-uri multiple în timpul procesării
    if (acceptInvitation.status === "pending" || declineInvitation.status === "pending") {
      return;
    }

    if (eventData?.id && guestUsername) {
      // Confirmă acțiunea
      if (!window.confirm("Are you sure you want to decline this invitation?")) {
        return;
      }

      declineInvitation.mutate(
        { eventId: eventData.id, guestUsername },
        {
          onSuccess: () => {
            // Apelează callback-ul pentru redirecționare
            onDecline?.();
          },
          onError: (error) => {
            console.error("Error declining invitation:", error);
            alert("Failed to decline invitation. Please try again.");
          },
        },
      );
    } else {
      // Dacă nu avem datele necesare, doar apelează callback-ul
      onDecline?.();
    }
  };

  if (
    !invitationData ||
    invitationData.status === "ACCEPTED" ||
    (currentUser && invitationData.guestUsername !== currentUser.username)
  ) {
    return <NotInvited />;
  }

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
                {(() => {
                  if (isEventLoading) return "";
                  return eventData?.date
                    ? new Date(eventData.date).toLocaleString()
                    : "";
                })()}
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
              text={declineInvitation.status === "pending" ? "Declining..." : "Decline invite"}
              style={ButtonStyle.PRIMARY}
              onClick={handleDecline}
            />
            <ButtonComponent
              text={acceptInvitation.status === "pending" ? "Accepting..." : "Accept invite"}
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