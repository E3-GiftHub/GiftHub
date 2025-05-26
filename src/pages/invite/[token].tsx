// pages/invite/[token].tsx
import Head from "next/head";
import EventCard from "~/components/EventCard";
import styles from "../../styles/EventCardPage.module.css";
import { GetServerSidePropsContext } from "next";
import { db as prisma } from "~/server/db"; // Adjust path as needed

type InvitePageProps = {
  event: {
    name: string;
    description: string;
    date: string;
    location: string;
    image: string;
  } | null;
};

export default function InvitePage({ event }: InvitePageProps) {
  if (!event) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Invalid or expired invite</h1>
        <p>The invite link you used is not valid.</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Gift Hub - {event.name}</title>
        <meta name="description" content={`Details for ${event.name}`} />
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

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const token = context.params?.token as string;

  if (!token) {
    return { props: { event: null } };
  }

  const eventRecord = await prisma.event.findUnique({
    where: { token: token },
  });

  if (!eventRecord) {
    return { props: { event: null } };
  }

  const event = {
    name: eventRecord.title,
    description: eventRecord.description,
    date: eventRecord.date.toLocaleString(),
    location: eventRecord.location,
    image: eventRecord.pictureUrl ?? "/api/placeholder/160/160",
  };

  return { props: { event } };
}
