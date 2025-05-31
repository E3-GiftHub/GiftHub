import React from "react";
import { useRouter } from "next/router";
import { api } from "src/trpc/react";
import UserProfileUI from "./UserProfileUI";
//THIS WAS FOR TESTING PURPOSES AND THE ACTUAL LOGIC IS IMPLEMENTED IN pages/profile.tsx ;
// SO THIS IS MOST PROBABLY JUST BLOAT BUT I'LL KEEP IT FOR NOW
export default function UserProfile() {
  const router = useRouter();
  const { data: user, isLoading, error } = api.user.getCurrentUser.useQuery();

  const handlePhotoChange = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/user/uploadPhoto", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        alert("Failed to upload photo");
      }
    } catch {
      alert("Error uploading photo");
    }
  };

  const handleEdit = () => {
    router.push("/editprofile").catch((err) => {
      console.error("Navigation error:", err);
    });
  };

  if (isLoading) return <p>Loading user info...</p>;
  if (error) return <p>Failed to load user info.</p>;
  if (!user) return <p>No user found.</p>;

  return (
    <UserProfileUI
      username={user.username}
      fname={user.fname ?? undefined}
      lname={user.lname ?? undefined}
      email={user.email ?? undefined}
      iban={user.iban ?? undefined}
      avatarUrl={user.pictureUrl ?? undefined}
      loading={isLoading}
      onPhotoChange={handlePhotoChange}
      onEdit={handleEdit}
    />
  );
}
