import Head from "next/head";
import EventCard from "~/components/EventCard";
import styles from "../styles/EventCardPage.module.css";

export default function EventCardPage() {
  const event = {
    name: "Birthday Celebration",
    description:
      "Join us for a special birthday celebration! There will be cake, music, and lots of fun activities planned for everyone.",
    date: "May 15, 2025 - 6:00 PM",
    location: "Central Park, New York",
    image: "/api/placeholder/160/160",
  };

  return (
    <>
      <Head>
        <title>Gift Hub - Event Card Demo</title>
        <meta
          name="description"
          content="Gift Hub event card demonstration page"
        />
      </Head>
      <div className={styles.giftHubPage}>
        <main>
          <EventCard
            name={event.name}
            description={event.description}
            date={event.date}
            location={event.location}
            image={event.image}
          />
        </main>
      </div>
    </>
  );
}
