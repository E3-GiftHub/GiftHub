import Head from "next/head";
import WishlistView from "~/components/wishlistview";
import styles from '../styles/index.module.css';

export default function DemoPage() {
  return (
    <>
      <Head>
        <title>Gift Hub - Wishlist Demo</title>
        <meta name="description" content="Gift Hub wishlist demonstration page" />
      </Head>
      <div className={styles.giftHubPage}>
        <main>      
              <WishlistView />
        </main>
      </div>
    </>
  );
}
