import Head from "next/head";
import WishlistView from "~/components/WishlistView";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";
import styles from "../styles/WishlistView.module.css";
import { useRouter } from "next/router";
import Termination from "~/components/Termination";

const WishlistViewPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const eventId = id as string;

  const handleContribute = (articleId: number) => {
    void router.push(`/payment?articleid=${articleId}`);
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

      <Termination
        eventId={Number(eventId)}
        invitationId={null}
        articleId={null}
      />
    </div>
  );
};

export default WishlistViewPage;
