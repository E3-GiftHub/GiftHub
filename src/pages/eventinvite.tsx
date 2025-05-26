import React from "react";
import InvitationCard from "../components/invitationcard";
import Head from "next/head";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";
import styles from "../styles/eventinvite.module.css"

export default function DemoPage() {
  return (
    <>
      <Head>
        <title>GiftHub </title>
      </Head>
      <div className={styles.giftHubPage}>
        <Navbar /> 
        <main>
              <InvitationCard/>
        </main>
        <Footer />
      </div>
    </>
  );
}