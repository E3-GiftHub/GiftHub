import styles from "~/styles/UserProfile/UserProfile.module.css";
import Navbar from "~/components/Navbar";
import UserProfileUI from "~/components/ui/UserProfile/UserProfileUI";
import { mockUser } from "~/components/ui/UserProfile/mockUser";
import type { GetServerSideProps } from "next";
import { api } from "~/trpc/react";
import { useRouter } from "next/router";

// Define the expected structure for the user object
// interface User {
//   id: string;
//   username: string;
//   fname?: string;
//   lname?: string;
//   iban?: string;
//   email?: string;
//   picture?: string;
// }

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

export default function UserProfile() {

  const{data: userData} = api.profile.user.get.useQuery();
  const deleteUser = api.profile.user.delete.useMutation();
  const router = useRouter();

  // const userData = {
  //   username: router.query.username || mockUser.username,
  //   fname: router.query.fname || mockUser.fname,
  //   lname: router.query.lname || mockUser.lname,
  //   email: router.query.email || mockUser.email,
  //   iban: router.query.iban || mockUser.iban,
  //   picture: router.query.avatarUrl || mockUser.picture
  // };



  const handleDelete = async () => {


    if (!confirm("Are you sure you want to delete your account?")) return;

    try {
      await deleteUser.mutateAsync();
      alert("Deleted account successfully!");
      window.location.href = "/";
    } catch (err) {
      console.error("Unexpected error during deletion:", err);
      alert("An error occurred while deleting your account.");
    }
  };

  const handleEdit = () => {
   void router.push("/editprofile");

  }

  // const handleEditPhoto = async () => {
  //   // You can implement this function to edit the user's avatar
  //   alert("Edit photo functionality is not yet implemented.");
  // };

  return (
    <div className={styles["landing-page"]}>
      <Navbar />
      <UserProfileUI
        //key={userData.id}
        username={userData?.id || ''}
        fname={userData?.fname || ''}
        lname={userData?.lname || ''}
        email={userData?.email || ''}
        //iban={userData?.iban || ''}
        avatarUrl={userData?.pictureUrl || ''}
      />
      <div className={styles["empty-space"]}></div>
    </div>
  );
}