import React from "react";
import Head from "next/head";
import Contribution from "~/components/Contribution";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";
import styles from "../styles/contribution.module.css";
import { useRouter } from "next/router";
import NotInvited from "@/components/notinvited";
import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import LoadingSpinner from "@/components/loadingspinner";

const ContributionPage: React.FC = () => {
  const router = useRouter();
  const { eventId } = router.query;
  const eventIdNumber = typeof eventId === "string" ? Number(eventId) : undefined;

  const { data: session, status: sessionStatus } = useSession();
  const username = session?.user?.name;

  const { data: invitationStatus, isLoading: invitationLoading } = api.invitationPreview.getInvitationForUserEvent.useQuery(
    { 
      eventId: eventIdNumber!, 
      guestUsername: username ?? ""
    },
    { 
      enabled: !!eventIdNumber && !!username,
      retry: false
    }
  );

  const isLoading = sessionStatus === "loading" || invitationLoading;
  const isInvited = !isLoading && invitationStatus?.status === "ACCEPTED";

  const handleWishlist = () => {
    void router.push(`/wishlist-view?eventId=${eventIdNumber}`);
  };

  const handlePay = () => {
    void router.push(`/payment-succes?eventId=${eventIdNumber}`);
  };


  // Show loading state first for ANY loading condition
  if (sessionStatus === "loading" || isLoading || !username || !eventIdNumber) {
    return (
      <div className={styles.giftHubPage}>
        <Head>
          <title>Loading... - GiftHub</title>
        </Head>
        <Navbar />
        <main>
          <div className={styles.contentWrapper}>
            <LoadingSpinner />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Only show NotInvited when we have all data and we're sure they're not invited
  if (!isInvited && !isLoading) {
    console.log("User not invited:", username, "eventId:", eventIdNumber);
    return (
      <div className={styles.giftHubPage}>
        <Head>
          <title>Not Invited - GiftHub</title>
        </Head>
        <Navbar />
        <div className={styles.notInvitedWrapper}>
          <NotInvited />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.giftHubPage}>
      <Head>
        <title>GiftHub</title>
        <meta name="description" content="GiftHub contribution page" />
      </Head>
      <Navbar />
      <main>
        <div className={styles.contentWrapper}>
          <Contribution
            eventName="Event name"
            wishlist={handleWishlist}
            pay={handlePay}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContributionPage;
