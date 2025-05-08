import React from "react";
import styles from "./../styles/HomePageStyle.module.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CloudsBackground from "~/components/ui/CloudsBackground";
import "./../styles/globals.css";
import MyEventsSection from "~/components/MyEventsSection";
import MyInvitations from "~/components/UpcomingEventsSection";

export default function home() {
  return (
    <div className={styles.homepage}>
      <Navbar />
      <CloudsBackground />
      <div className={styles["homepage-containers-wrapper"]}>
        <MyEventsSection />
        <MyInvitations />
      </div>
      <Footer />
    </div>
  );
}
