import React from "react";
import Head from "next/head";
import Contribution from '~/components/contribution';
import Navbar from '~/components/Navbar';
import Footer from '~/components/Footer';
import styles from '../styles/contribution.module.css';
import { useRouter } from 'next/router';

const ContributionPage: React.FC = () => {
  const router = useRouter();

  const handleWishlist = () => {
    void router.push('/wishlistview');
  };

  const handlePay = () => {
    void window.open('https://google.com', '_blank');
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