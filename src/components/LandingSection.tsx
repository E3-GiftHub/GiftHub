import React from "react";
import styles from "./../styles/LandingSectionStyle.module.css";
import { ButtonComponent, ButtonStyle } from "./ui/ButtonComponent";
import { useRouter } from "next/router";
import { useSession, signOut } from "next-auth/react";

export default function LandingSection() {
  const router = useRouter();

  const handleSignUp = async () => {
    await router.push("/signup");
  }
  const { status } = useSession();
const isLoggedOut = status === "unauthenticated";
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
        src={"/illustrations/parachuteIllustration.png"}
        className={styles["gifts-illustration"]}
        alt="gift-illustration"
      />
      <div className={styles["text-container"]}>
        <p className={styles.title}>GiftHub</p>
        <p className={styles.subtitle}>
          Your All-in-One Gifting Solution. <br />
          Gift Together. Celebrate Better.
        </p>

          {isLoggedOut && (
  <ButtonComponent
    text={"SIGN UP"}
    style={ButtonStyle.PRIMARY}
    onClick={handleSignUp}
  />
)}
      
      </div>
    </div>
  );
}
