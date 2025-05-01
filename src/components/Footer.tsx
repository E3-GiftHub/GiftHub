"use client";
import "./../styles/globals.css";
import { FaLinkedin, FaGithub } from 'react-icons/fa';
import styles from "./../styles/Footer.module.css";
import Link from "next/link";
const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.topRow}>
        

        <div className={styles.social}>
          <span>Follow us</span>
          <a href="https://www.linkedin.com/posts/petru-braha_github-petru-brahagifthub-peer-to-peer-activity-7313564023420010497-K73U?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAADSRLEMBPyhS0ijyu0CpHHwZ9IscfXNSvVE" target="_blank" rel="noopener noreferrer">
    <FaLinkedin size={32} />
  </a>
  <a href="https://github.com/E3-GiftHub" target="_blank" rel="noopener noreferrer">
    <FaGithub size={32} />
  </a>
        </div>
      </div>

      <hr className={styles.divider} />

      <div className={styles.bottomRow}>
      <Link href="/privacy" className={styles.link}>Privacy Policy</Link>
        <div className={styles.separator}></div>
        <Link href="/terms" className={styles.link}>Terms and Conditions</Link>
        <div className={styles.separator}></div>
        <Link href="/about" className={styles.link}>About us</Link>
        <div className={styles.separator}></div>
        <Link href="mailto:e3getmehired@yahoo.com" className={styles.link}>Contact us</Link>
      </div>
      <div className={styles.copyrightRow}>
        © 2025 GiftHub. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
