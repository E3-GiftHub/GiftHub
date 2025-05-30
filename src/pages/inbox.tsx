import React from "react";
import styles from "./../styles/InboxPageStyle.module.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import InboxContainer from "../components/ui/InboxContainer"; 
import "./../styles/globals.css";

export default function InboxPage() {
  return (
    <div className={styles.inboxpage}>
      <Navbar />
      <main className={styles.content}>
        <div className={styles.pageWrapper}>
          <InboxContainer />
        </div>
      </main>
      <Footer />
    </div>
  );
}
