import Head from "next/head";
import React from "react";
import styles from "./../styles/LandingPageStyle.module.css";
import LandingSection from "../components/LandingSection";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CardsSection from "../components/CardsSection";
import "./../styles/globals.css";

export default function LandingPage() {
  return (
    <>
      <Head>
        <title>GiftHub</title>
        <meta name="description" content="Landing page" />
        <link rel="icon" href="/logo.png" />
      </Head>
      <div className={styles["landing-page"]}>
        <Navbar />
        <LandingSection />
        <CardsSection />
        <div className={styles["empty-space"]}></div>
        <Footer />
      </div>
    </>
  );
}
