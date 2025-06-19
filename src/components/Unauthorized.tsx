import React from "react";
import styles from "../styles/notinvitedcomponent.module.css";
import buttonStyles from "../styles/Button.module.css";
import { useRouter } from "next/router";

const Unauthorized: React.FC = () => {
  const router = useRouter();

  return (
    <div className={styles.notInvitedWrapper}>
      <div className={styles.notInvitedContainer}>
        <h2 className={styles.notInvitedText}>Unauthorized Access</h2>
        <p>You are not allowed to view this page.</p>

        <button
          className={`${buttonStyles.button} ${buttonStyles["button-primary"]}`}
          onClick={() => router.push("/home#")}
        >
          Home
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
