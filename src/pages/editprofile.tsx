import { useRouter } from "next/router";
import { useState } from "react";
import styles from "~/styles/UserProfile/UserProfile.module.css";
import Navbar from "~/components/Navbar";
import EditUserProfileUI from "~/components/ui/UserProfile/EditUserProfileUI";
import { mockUser } from "~/components/ui/UserProfile/mockUser";

// Add type for API response
interface UpdateResponse {
  success?: boolean;
  error?: string;
}

// Add type for mock user
interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
}

export default function EditUserProfile() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (newUsername: string, newEmail: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/user/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: newUsername,
          email: newEmail,
        }),
      });

      // Properly type the response
      const data: UpdateResponse = await res.json() as UpdateResponse;

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

  // Type assertion for mock user
  const typedMockUser = mockUser as User;

  return (
    <div className={styles['landing-page']}>
      <Navbar />
      <EditUserProfileUI
        username={typedMockUser.name}
        email={typedMockUser.email}
        avatarUrl={typedMockUser.picture}
        onSave={handleSave}
        onResetPassword={handleResetPassword}
        loading={isLoading}
      />
      <div className={styles['empty-space']}></div>
    </div>
  )
}