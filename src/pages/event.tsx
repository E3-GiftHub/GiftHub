import Head from "next/head";
import { useRouter } from "next/router";
import { api } from "~/trpc/react"; // <-- FIXED: use the React hooks client
import EventView from "~/components/EventView";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";
import styles from "../styles/EventView.module.css";
import { useEffect } from "react";

export default function EventViewPage() {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    const { eventIdTemp } = router.query;
    if (!eventIdTemp) return;
    console.log("Router is ready, id:", eventIdTemp);
  }, [router.isReady]);

  const { id } = router.query;
  const eventId: number = Number(id);

  const {
    data: eventData,
    isLoading,
    error,
  } = api.event.getById.useQuery(
    { id: eventId },
    { enabled: Boolean(id) && !isNaN(eventId) },
  );

  const handleContribute = () => {
    void router.push(`/payment?eventId=${eventId}`);
  };

  const handleViewWishlist = () => {
    void router.push(`/wishlist?eventId=${eventId}`);
  };

  const handleMediaView = () => {
    void router.push(`/media?eventId=${eventId}`);
  };

  const handleReport = (reason: string) => {
    console.log("Event reported:", reason);
    alert(`Event reported for: ${reason}`);
  };

  if (!id || isNaN(eventId)) {
    return <p>Invalid or missing event ID.</p>;
  }

  if (isLoading) {
    return <p>Loading event...</p>;
  }

  if (error) {
    return <p>Error loading event: {error.message}</p>;
  }

  if (!eventData) {
    return <p>Event not found.</p>;
  }

  return (
    <>
      <Head>
        <title>Event View - GiftHub</title>
        <meta
          name="description"
          content="View event details and manage contributions"
        />
      </Head>

      <Navbar />
      <div className={styles.container}>
        <main>
          <EventView
            eventData={{
              id: String(eventData.id), // <-- Fix: convert number to string
              title: eventData.title,
              picture: eventData.pictureUrl,
              description: eventData.description,
              location: eventData.location,
              date: eventData.date,
              planner: eventData.planner,
              guests: eventData.guests,
            }}
            onContribute={handleContribute}
            onViewWishlist={handleViewWishlist}
            onMediaView={handleMediaView}
            onReport={handleReport}
          />
        </main>
      </div>
      <Footer />
    </>
  );
}
