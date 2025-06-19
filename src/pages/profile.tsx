import styles from "~/styles/UserProfile/UserProfile.module.css";
import loadingStyles from "~/styles/wishlistcomponent.module.css";
import Navbar from "~/components/Navbar";
import UserProfileUI from "~/components/ui/UserProfile/UserProfileUI";
import { api } from "~/trpc/react";
import React from "react";
import formatField from "~/utils/formatField";

export default function UserProfile() {
  const { data: user, isLoading, error } = api.profile.user.get.useQuery();

  // Log *immediately* after getting the hook data, to capture all states
  console.log("UserProfile: tRPC query result", { user, isLoading, error });

  if (isLoading) {
    console.log("UserProfile: loading user data...");
    return (
      <div className={styles["landing-page"]}>
        <Navbar />
        <div className={loadingStyles.loadingContainer}>
          <div className={loadingStyles.spinner}></div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error("UserProfile: error loading user data:", error);
    return (
      <div className={styles["landing-page"]}>
        <Navbar />
        <p>Error loading user data: {error.message}</p>
      </div>
    );
  }

  if (!user) {
    console.warn("UserProfile: no user data found (user is null)");
    return (
      <div className={styles["landing-page"]}>
        <Navbar />
        <p>User not found or not logged in</p>
      </div>
    );
  }

  // Confirm user data is present and valid here
  console.log("UserProfile: user data loaded successfully", user);

  return (
    <div className={styles["landing-page"]}>
      <Navbar />
      <UserProfileUI
        username={formatField(user.username)}
        fname={formatField(user.fname)}
        lname={formatField(user.lname)}
        email={formatField(user.email)}
        avatarUrl={user.pictureUrl ?? "/UserImages/default_pfp.svg"}
      />
      <div className={styles["empty-space"]}></div>
    </div>
  );
}
