import Head from "next/head";
import WishlistView from "~/components/WishlistView";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";
import styles from "../styles/WishlistView.module.css";
import { useRouter } from "next/router";

const WishlistPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const handleContribute = () => {
    void router.push("/payment");
  };

  return (
    <div className={styles.giftHubPage}>
      <Head>
        <title>GiftHub</title>
      </Head>
      <Navbar />
      <main className={styles.mainContent}>
        <WishlistView contribution={handleContribute} eventId={id} />
      </main>
      <Footer />
    </div>
  );
};

export default WishlistPage;
