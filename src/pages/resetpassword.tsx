import AccountUI from "../components/ui/Account/AccountUI";
import ResetPasswordForm from "~/components/ui/Account/ResetPasswordForm";
import styles from "./../styles/Account.module.css";

export default function ResetPassword() {
  return (
    <div className={styles.signUpBox}>
      <AccountUI />
      <ResetPasswordForm/>
    </div>
  );
}
