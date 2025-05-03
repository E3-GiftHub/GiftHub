import styles from "~/styles/UserProfile/UserProfile.module.css";
import Navbar from "~/components/Navbar";
import UserProfileUI from "~/components/ui/UserProfile/UserProfileUI";
import { mockUser } from "~/components/ui/UserProfile/mockUser"; // adjust path if needed

export default function UserProfile() {

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete your account?")) return;

        try {
            const res = await fetch("/api/user/delete", {
                method: "DELETE",
            });

            // Define the expected structure of the response
            interface DeleteResponse {
                error?: string;
            }

            // Assert the type of the JSON response
            const data = (await res.json()) as DeleteResponse;

            if (!res.ok) {
                alert("Failed to delete: " + (data.error ?? "Unknown error"));
                return;
            }

            alert("Account deleted successfully");
            window.location.href = "/"; // Redirect to homepage or login
        } catch (err) {
            console.error("Unexpected error during deletion:", err);
            alert("An error occurred while deleting your account.");
        }
    };
    return (
        <div className={styles['landing-page']}>
            <Navbar />
            <UserProfileUI
                username={mockUser.name}
                email={mockUser.email}
                avatarUrl={mockUser.picture}
                onDelete= {handleDelete}
                onEdit={() => alert("Edit function not wired yet")}
            />
            <div className={styles['empty-space']}></div>
        </div>
    )
}
