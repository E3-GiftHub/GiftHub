import AccountUI from "../components/ui/Account/AccountUI";
import "./../styles/globals.css";
import ResetPasswordFormLogged from "~/components/ui/Account/ResetPasswordFormLogged";
import styles from "./../styles/Account.module.css";

export default function ResetPassword() {
  return (
    <div className={styles.fullPageWrapper}>
      <div className={styles.signUpBox}>
        <AccountUI />
        <ResetPasswordFormLogged />
      </div>
    </div>
  );
}
