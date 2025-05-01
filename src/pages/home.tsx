import React from "react";
import styles from "./../styles/HomePageStyle.module.css";
import Navbar from "../components/Navbar";
import { Container, ContainerBorderStyle } from "../components/ui/Container";
import CloudsBackground from "~/components/ui/CloudsBackground";
import ContainerEventTitle from "~/components/ui/ContainerEventTitle";
import "./../styles/globals.css";
import MyEventsSection from "~/components/MyEventsSection";
import UpcomingEventsSection from "~/components/UpcomingEventsSection";

export default function home() {
  return (
    <>
      <Navbar />
      <CloudsBackground />
      <div className={styles["homepage-content"]}>
        <div className={styles["homepage-containers-wrapper"]}>
          <MyEventsSection />
          <UpcomingEventsSection />
        </div>
      </div>
    </>
  );
}
