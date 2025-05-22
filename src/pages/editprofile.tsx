import { useRouter } from "next/router";
import { useState } from "react";
import styles from "~/styles/UserProfile/UserProfile.module.css";
import Navbar from "~/components/Navbar";
import EditUserProfileUI from "~/components/ui/UserProfile/EditUserProfileUI";
import { mockUser } from "~/components/ui/UserProfile/mockUser";

interface UpdateResponse {
  success?: boolean;
  error?: string;
}

export default function EditUserProfile() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (
    newFname: string,
    newLname: string,
    newUsername: string,
    newEmail: string,
    newIban: string
  ) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/user/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fname: newFname,
          lname: newLname,
          username: newUsername,
          email: newEmail,
          iban: newIban,
        }),
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const data: UpdateResponse = await res.json();

      if (!res.ok) {
        alert("Update failed: " + (data.error ?? "Unknown error"));
        return;
      }

      alert("Profile updated successfully!");
      await router.push("/profile");
    } catch (err) {
      console.error("Update error:", err);
      alert("An error occurred during update.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    await router.push("/reset-password");
  };

  return (
    <div className={styles['landing-page']}>
      <Navbar />
      <EditUserProfileUI
        key={mockUser.id}
        username={mockUser.username}
        fname={mockUser.fname}
        lname={mockUser.lname}
        email={mockUser.email}
        IBAN={mockUser.iban}
        avatarUrl={mockUser.picture}
        onSave={handleSave}
        onResetPassword={handleResetPassword}
        loading={isLoading}
      />
      <div className={styles['empty-space']}></div>
    </div>
  )
}