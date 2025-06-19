import styles from "~/styles/UserProfile/UserProfile.module.css";
import Navbar from "~/components/Navbar";
import ViewUserProfileUI from "~/components/ui/UserProfile/ViewUserProfileUI";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import type { Profile } from "~/models/Profile";
import loadingStyles from "../styles/wishlistcomponent.module.css";


export default function UserProfile() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [userProfile, setUserProfile] = useState<Profile>();

  useEffect(() => {
    if (!router.isReady || status !== "authenticated") return;
    const { userTemp } = router.query;
    if (!userTemp) return;
    console.log("Router is ready, id:", userTemp);
  }, [router.isReady]);

  //! GET ALL THE USER DATA
  const { username } = router.query;
  useEffect(() => {
    if (!router.isReady || !username || !session?.user?.name) return;

    (async () => {
      try {
        const res = await fetch(
          `./api/user/profile-query?username=${username as string}`,
        );
        const data = (await res.json()) as Profile;
        setUserProfile(data);
      } catch (error) {
        console.error("Failed to load media", error);
      }
    })().catch((err) => {
      console.error("Unexpected error in useEffect:", err);
    });
  }, [username]);

  //! REPORT USER CALL
  const handleReport = async (
    reporter: string | null,
    reported: string | null,
    reason: string | null,
    description: string | null,
  ) => {
    if (!reported || !reporter || !reason) return;

    try {
      const res = await fetch("./api/profile-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reporter: reporter,
          userId: reported,
          reason: reason,
          description: description,
        }),
      });

      console.log(res);
    } catch (error) {
      console.error("Failed to load media", error);
    }
  };

  if (!userProfile) return           <div className={loadingStyles.loadingContainer}>
  <div className={loadingStyles.spinner} data-testid="loading-spinner"></div>
</div>;

  return (
    <div className={styles["landing-page"]}>
      <Navbar />
      <ViewUserProfileUI
        reporter={session?.user?.name ?? null}
        profile={userProfile}
        onReport={handleReport}
      />
      <div className={styles["empty-space"]}></div>
    </div>
  );
}
