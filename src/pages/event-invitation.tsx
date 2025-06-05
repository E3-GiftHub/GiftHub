import React, { useEffect } from "react";
import InvitationCard from "../components/InvitationCard";
import Head from "next/head";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";
import styles from "../styles/eventinvite.module.css";
import { useRouter } from "next/router";

export default function DemoPage() {
  const router = useRouter();
  const { id } = router.query;
  const invitationId = Number(id);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(
          `./api/stripe/countdown?invitationId=${invitationId}`,
        );
        const data = (await res.json()) as string;
        console.log(data);
      } catch (error) {
        console.error("Failed to load guests", error);
      }
    })().catch((err) => {
      console.error("Unexpected error in useEffect:", err);
    });
  }, [invitationId]);

  return (
    <>
      <Head>
        <title>GiftHub </title>
      </Head>
      <div className={styles.giftHubPage}>
        <Navbar />
        <div className={styles.invitationContainer}>
          {invitationId !== undefined && (
            //posibil idul as fie invalid
            //sau un baiat foarte sneaky sa introduca
            //id=asf (ceea ce este incorect si INVALID)
            <InvitationCard
              invitationId={invitationId}
              onDecline={() => {
                void router.push("/home");
              }}
            />
          )}
        </div>
        <Footer />
      </div>
    </>
  );
}
