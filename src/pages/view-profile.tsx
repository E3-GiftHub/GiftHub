import styles from "~/styles/UserProfile/UserProfile.module.css";
import Navbar from "~/components/Navbar";
import ViewUserProfileUI from "~/components/ui/UserProfile/ViewUserProfileUI";
import { mockUser } from "~/components/ui/UserProfile/mockUser";
import type { GetServerSideProps } from "next";

// Define the expected structure for the user object
interface User {
    username: string;
    email?: string;
    picture?: string;
}

// export const getServerSideProps: GetServerSideProps = async () => {
//   try {
//     const username = "john_doe"; // Replace with actual username
//     console.log("Fetching user with username:", username);
//     const res = await fetch(`http://localhost:3000/api/user/get?username=${username}`);
//
//     if (!res.ok) throw new Error("Failed to fetch user");
//
//     // Explicitly type the response as User
//     const user = (await res.json()) as User; // Ensure the response matches the User type
//
//     console.log("Fetched user data:", user); // Debugging log
//
//     return {
//       props: { user },
//     };
//   } catch (err) {
//     console.error("Error loading user:", err);
//     return {
//       notFound: true,
//     };
//   }
// };

export default function UserProfile({ user }: { user: User }) {
    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete your account?")) return;

        try {
            const res = await fetch("/api/user/delete", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username: user.username }),
            });

            // Use type assertion here as well
            const data = (await res.json()) as { message?: string; error?: string };

            if (!res.ok) {
                alert("Failed to delete: " + (data.error ?? "Unknown error"));
                return;
            }

            alert("Account deleted successfully");
            window.location.href = "/";
        } catch (err) {
            console.error("Unexpected error during deletion:", err);
            alert("An error occurred while deleting your account.");
        }
    };

    // const handleEditPhoto = async () => {
    //   // You can implement this function to edit the user's avatar
    //   alert("Edit photo functionality is not yet implemented.");
    // };

    return (
        <div className={styles["landing-page"]}>
            <Navbar />
            <ViewUserProfileUI
                key={mockUser.id}
                username={mockUser.username}
                fname={mockUser.fname}
                lname={mockUser.lname}
                email={mockUser.email}
                iban={mockUser.iban}
                avatarUrl={mockUser.picture}
            />
            <div className={styles["empty-space"]}></div>
        </div>
    );
}