import Head from "next/head";
import WishlistView from "~/components/wishlistview";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";
import styles from '../styles/WishlistView.module.css';
import { useRouter } from 'next/router';

const WishlistPage: React.FC = () => {
  const router = useRouter();

  const handleContribute = () => {
    void router.push('/contributionpage');
  };

  return (
    <div className={styles.giftHubPage}>
      <Head>
        <title>GiftHub</title>
        <meta name="description" content="Gift Hub wishlist demonstration page" />
      </Head>
      <Navbar />
      <main>
        <WishlistView contribution={handleContribute} />
      </main>
      <Footer />
    </div>
  );
};

export default WishlistPage;