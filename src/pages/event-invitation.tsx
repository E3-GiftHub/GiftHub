import React from "react";
import InvitationCard from "../components/InvitationCard";
import Head from "next/head";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";
import styles from "../styles/eventinvite.module.css";
import { useRouter } from "next/router";

export default function DemoPage() {
  const router = useRouter();
  const invitationId = router.query.id ? Number(router.query.id) : undefined;
  
  // Fix: Handle the promise with void operator to explicitly ignore the result
  const handleDecline = () => {
    void router.push("/home"); // Use void operator to mark as intentionally ignored
  };

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
            <InvitationCard invitationId={invitationId} 
            onDecline={handleDecline}/>
          )}
        </div>
        <Footer />
      </div>
    </>
  );
}
