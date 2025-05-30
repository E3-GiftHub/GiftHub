import AccountUI from "../components/ui/Account/AccountUI";
import "./../styles/globals.css";
import ResetPasswordForm from "~/components/ui/Account/ResetPasswordForm";
import styles from "./../styles/Account.module.css";

export default function ResetPassword() {
  return (
    <div className={styles.fullPageWrapper}>
      <div className={styles.signUpBox}>
        <AccountUI />
        <ResetPasswordForm/>
      </div>
    </div>
  );
}
