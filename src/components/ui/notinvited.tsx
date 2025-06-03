import React from "react";
import styles from "../styles/notinvitedcomponent.module.css";

const NotInvited: React.FC = () => (
  <div className={styles.notInvitedContainer}>
    <div className={styles.notInvitedText}>
      Sorry, you are not invited to this event :(
    </div>
  </div>
);

export default NotInvited;