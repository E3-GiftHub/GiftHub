import styles from "~/styles/UserProfile/UserProfile.module.css";
import Navbar from "~/components/Navbar";
import ViewUserProfileUI from "~/components/ui/UserProfile/ViewUserProfileUI";
import { mockUser } from "~/components/ui/UserProfile/mockUser";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import type { Profile } from "~/models/Profile";

export default function UserProfile() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<Profile>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!router.isReady) return;
    const { userTemp } = router.query;
    if (!userTemp) return;
    console.log("Router is ready, id:", userTemp);
  }, [router.isReady]);

  //! GET ALL THE USER DATA
  const { username } = router.query;
  useEffect(() => {
    if (!router.isReady || !username) return;

    (async () => {
      try {
        const res = await fetch(
          `./api/user/profile-query?username=${username}`,
        );
        const data = (await res.json()) as Profile;
        setUserProfile(data);
      } catch (error) {
        console.error("Failed to load media", error);
      } finally {
        setIsLoading(false);
      }
    })().catch((err) => {
      console.error("Unexpected error in useEffect:", err);
    });
  }, [username]);

  if (isLoading || !userProfile) return <p> Loading ... </p>;

  return (
    <div className={styles["landing-page"]}>
      <Navbar />
      <ViewUserProfileUI profile={userProfile} />
      <div className={styles["empty-space"]}></div>
    </div>
  );
}
