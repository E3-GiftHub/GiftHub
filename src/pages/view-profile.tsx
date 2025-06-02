import styles from "~/styles/UserProfile/UserProfile.module.css";
import Navbar from "~/components/Navbar";
import ViewUserProfileUI from "~/components/ui/UserProfile/ViewUserProfileUI";
import { mockUser } from "~/components/ui/UserProfile/mockUser";
import type { GetServerSideProps } from "next";
import { db as prisma } from "~/server/db";


// Define the expected structure for the user object
interface User {
    username: string;
    email?: string;
    fname?: string;
    lname?: string;
    pictureUrl?: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const username = context.query.username;


    if (typeof username !== "string") {
      return { notFound: true };
    }
    console.log("Fetching user with username:", username);
    
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        username: true,
        email: true,
        fname: true,
        lname: true,
        pictureUrl: true,
      },
    });

    if (!user) return { notFound: true };

    console.log("Fetched user data:", user); // Debugging log

    return {
      props: { user },
    };
  } catch (err) {
    console.error("Error loading user:", err);
    return {
      notFound: true,
    };
  }
};

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
                username={user.username}
                fname={user.fname}
                lname={user.lname}
                email={user.email}
                avatarUrl={user.pictureUrl}
            />
            <div className={styles["empty-space"]}></div>
        </div>
    );
}