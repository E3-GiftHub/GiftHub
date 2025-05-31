import styles from "~/styles/UserProfile/UserProfile.module.css";
import Navbar from "~/components/Navbar";
import UserProfileUI from "~/components/ui/UserProfile/UserProfileUI";
import { api } from "~/trpc/react";
import React from "react";

export default function UserProfile() {
  const { data: user, isLoading, error } = api.user.getCurrentUser.useQuery();

  // Log *immediately* after getting the hook data, to capture all states
  console.log("UserProfile: tRPC query result", { user, isLoading, error });

  if (isLoading) {
    console.log("UserProfile: loading user data...");
    return (
      <div className={styles["landing-page"]}>
        <Navbar />
        <p>Loading user data...</p>
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
        username={user.username}
        fname={user.fname ?? "not set"}
        lname={user.lname ?? "not set"}
        email={user.email ?? "not set"}
        iban={user.iban ?? "not set"}
        avatarUrl={user.pictureUrl ?? "/UserImages/default_pfp.svg"}

      />
      <div className={styles["empty-space"]}></div>
    </div>
  );
}

