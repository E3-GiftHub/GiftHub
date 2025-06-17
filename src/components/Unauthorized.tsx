import React from "react";
import styles from "../styles/notinvitedcomponent.module.css";

const Unauthorized: React.FC = () => (
  <div className={styles.notInvitedWrapper}>
    <div className={styles.notInvitedContainer}>
      <h2 className={styles.notInvitedText}>Unauthorized Access</h2>
      <p>You are not allowed to view this page.</p>
    </div>
  </div>
);

export default Unauthorized;
