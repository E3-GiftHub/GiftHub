import { useRouter } from "next/router";
import { useState } from "react";
import styles from "~/styles/UserProfile/UserProfile.module.css";
import Navbar from "~/components/Navbar";
import EditUserProfileUI from "~/components/ui/UserProfile/EditUserProfileUI";
//import { mockUser } from "~/components/ui/UserProfile/mockUser";
import {api} from "~/trpc/react";

// interface UpdateResponse {
//   success?: boolean;
//   error?: string;
//   user?: typeof mockUser;
// }

export default function EditUserProfile() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {data: userData, isLoading: isUserLoading} = api.profile.user.get.useQuery();

  // Initialize with mockUser or values from query if coming back from save
  const updateUser = api.profile.user.update.useMutation();
  //const [isSaving, setIsSaving] = useState(false);

  //const [currentUser, setCurrentUser] = useState(initialUser);

  const handleSave = async (
    newFname: string,
    newLname: string,
    newUsername: string,
    newEmail: string,
    newIban: string
  ) => {
    setIsLoading(true);
    try{
      await updateUser.mutateAsync({
        fname: newFname,
        lname: newLname,
        username: newUsername,
        email: newEmail,
        iban: newIban
      });

      void router.push("/profile");
    }
    catch(e){
      console.error("Error saving user:", e);
    }
    finally {
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
        //key={currentUser.id}
        username={userData?.username}
        fname={userData?.fname || ''}
        lname={userData?.lname || ''}
        email={userData?.email || ''}
        IBAN={userData?.iban || ''}
        avatarUrl={userData?.pictureUrl || ''}
        onSave={handleSave}
        onResetPassword={handleResetPassword}
        loading={isLoading}
      />
      <div className={styles['empty-space']}></div>
    </div>
  )
}