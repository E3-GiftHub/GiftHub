import React from "react";
import styles from "../../styles/CloudsBackground.module.css"; // Importing the styles

const CloudsBackground: React.FC = () => {
  return (
    <div className={styles["cloud-background"]}>
      <div
        className={`${styles.cloud} ${styles["cloud-left"]}`}
        style={{ left: "2%", top: "10vh" }}
      />
      <div
        className={`${styles.cloud} ${styles["cloud-left"]}`}
        style={{ right: "-3%", top: "30vh" }}
      />
      <div
        className={`${styles.cloud} ${styles["cloud-right"]}`}
        style={{ left: "-4%", top: "50vh" }}
      />
      <div
        className={`${styles.cloud} ${styles["cloud-right"]}`}
        style={{ right: "2%", top: "70vh" }}
      />
    </div>
  );
};

export default CloudsBackground;
