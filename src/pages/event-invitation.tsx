import React, { useEffect } from "react";
import { useRouter } from "next/router";
import InvitationCard from "../components/InvitationCard";
import Head from "next/head";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";
import styles from "../styles/eventinvite.module.css";
import Termination from "@/components/Termination";

export default function DemoPage() {
  const router = useRouter();
  const { id } = router.query;
  const invitationId = Number(id);

  useEffect(() => {
    if (!invitationId) return;
  }, [invitationId]);

  return (
    <>
      <Head>
        <title>GiftHub</title>
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
        <Termination
          eventId={null}
          invitationId={invitationId}
          articleId={null}
        />
      </div>
    </>
  );
}
