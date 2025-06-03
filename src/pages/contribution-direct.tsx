import React from "react";
import Head from "next/head";
import Contribution from "~/components/Contribution";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";
import styles from "../styles/contribution.module.css";
import { useRouter } from "next/router";

const ContributionPage: React.FC = () => {
  const router = useRouter();
  const { eventId } = router.query;
  const eventIdStr = Array.isArray(eventId) ? eventId[0] : eventId;

  const handleWishlist = () => {
    void router.push(`/wishlist-view?eventId=${eventIdStr}`);
  };

  const handlePay = () => {
    console.log("am apasat pay si trebuie sa ma duca la payment cu eventid:", eventIdStr);
    void router.push(`/payment-succes?eventId=${eventIdStr}`);
  };

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
