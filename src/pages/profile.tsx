import styles from "~/styles/UserProfile/UserProfile.module.css";
import Navbar from "~/components/Navbar";
import UserProfileUI from "~/components/ui/UserProfile/UserProfileUI";

export default function UserProfile() {
  return (
    <div className={styles['landing-page']}>
      <Navbar />
      <UserProfileUI />
      <div className={styles['empty-space']}></div>
    </div>
  )
}