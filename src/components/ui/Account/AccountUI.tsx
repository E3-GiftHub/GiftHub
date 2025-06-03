import React from 'react';
import styles from "../../../styles/Account.module.css";
import Link from "next/link";

export default function AccountUI() {
  return (
    <div className={styles.leftPanel}>
      <div className={styles.visual}>
        <h1 className={styles.GiftHubTitle}>GiftHub</h1>
        <div></div>
        <Link href="/#">
          <img
            src="/illustrations/account_visual.png"
            alt="clouds"
            className={styles.cloudPNG}
          />
        </Link>
      </div>
    </div>
  );
}
