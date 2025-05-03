import React from "react";
import styles from "./../styles/LandingSectionStyle.module.css";
import { ButtonComponent, ButtonStyle } from "./ui/ButtonComponent";

export default function LandingSection() {
  return (
    <div className={styles["landing-container"]}>
      <img
        src={"/illustrations/parachute.png"}
        alt="parachute gift"
        className={styles.parachute1}
      />
      <img
        src={"/illustrations/parachute.png"}
        alt="parachute gift"
        className={styles.parachute2}
      />
      <img
        src={"/illustrations/parachute.png"}
        alt="parachute gift"
        className={styles.parachute3}
      />
      <img
        src={"/illustrations/parachute.png"}
        alt="parachute gift"
        className={styles.parachute4}
      />
      <img
        src={"/illustrations/cloud.png"}
        alt="parachute gift"
        className={styles.cloud1}
      />
      <img
        src={"/illustrations/cloud.png"}
        alt="parachute gift"
        className={styles.cloud2}
      />
      <img
        src={"/illustrations/cloud.png"}
        alt="parachute gift"
        className={styles.cloud3}
      />
      <img
        src={"/illustrations/cloud.png"}
        alt="parachute gift"
        className={styles.cloud4}
      />
      <img
        src={"/illustrations/cloud.png"}
        alt="parachute gift"
        className={styles.cloud5}
      />

      <img
        src={"/illustrations/parachute_illustration.png"}
        className={styles["gifts-illustration"]}
        alt="gift-illustration"
      />
      <div className={styles["text-container"]}>
        <p className={styles.title}>GiftHub</p>
        <p className={styles.subtitle}>
          Your All-in-One Gifting Solution. <br />
          Gift Together. Celebrate Better.
        </p>
        <ButtonComponent text={"SIGN IN"} style={ButtonStyle.PRIMARY} />
      </div>
    </div>
  );
}
