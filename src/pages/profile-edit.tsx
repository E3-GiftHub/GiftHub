import { useRouter } from "next/router";
import React, { useEffect } from "react";
import styles from "~/styles/UserProfile/UserProfile.module.css";
import Navbar from "~/components/Navbar";
import EditUserProfileUI from "~/components/ui/UserProfile/EditUserProfileUI";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import { signIn, signOut } from "next-auth/react";

export default function EditUserProfile() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  } = api.profile.user.prepareEdit.useQuery();

  const updateUserMutation = api.profile.user.update.useMutation();

  const handleSave = async (
    newFname: string,
    newLname: string,
    newUsername: string,
    newEmail: string,
  ) => {
    updateUserMutation.mutate(
      {
        fname: newFname,
        lname: newLname,
        email: newEmail,
        username: newUsername,
      },
      {
        onSuccess: async () => {
          await signOut({ redirect: false });

          await signIn("credentials", {
            email: newEmail,
            password: user?.password,
            redirect: false,
          });

          alert("Profile updated successfully!");
          void router.push("/profile");
        },
        onError: (error) => {
          alert("Update failed: " + error.message);
        },
      },
    );
  };

  const handleResetPassword = async () => {
    await router.push("/reset-password");
  };

  if (userLoading) {
    return (
      <div className={styles["landing-page"]}>
        <Navbar />
        <p>Loading user data...</p>
      </div>
    );
  }

  if (userError) {
    return (
      <div className={styles["landing-page"]}>
        <Navbar />
        <p>Error loading user data: {userError.message}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles["landing-page"]}>
        <Navbar />
        <p>User not found or not logged in</p>
      </div>
    );
  }

  //todo this
  console.log("cacat", session?.user?.name);

  return (
    <div className={styles["landing-page"]}>
      <Navbar />
      <EditUserProfileUI
        username={user.username ?? ""}
        fname={user.fname ?? ""}
        lname={user.lname ?? ""}
        email={user.email ?? ""}
        avatarUrl={user.pictureUrl ?? "/UserImages/default_pfp.svg"}
        onSave={handleSave}
        onResetPassword={handleResetPassword}
        disableUsernameEditing={false}
      />
      <div className={styles["empty-space"]}></div>
    </div>
  );
}
