import React from 'react';
import styles from "../../../styles/Account.module.css";
export default function AccountUI()
{
  return (
        <div className={styles.leftPanel}>
          <div className={styles.visual}>
            <h1  className={styles.GiftHubTitle}>GiftHub</h1>
            <div></div>
            <img src={'/illustrations/account_visual.png'} alt='clouds' className={styles.cloudPNG}/>
          </div>
        </div>
  );
}
