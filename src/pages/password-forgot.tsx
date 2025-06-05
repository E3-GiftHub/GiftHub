import AccountUI from "../components/ui/Account/AccountUI";
import "./../styles/globals.css";
import ForgotPasswordForm from "~/components/ui/Account/ForgotPasswordForm";
import styles from "./../styles/Account.module.css";

export default function SignUpForm() {
  return (
    <div className={styles.fullPageWrapper}>
      <div className={styles.signUpBox}>
        <AccountUI />
        <ForgotPasswordForm/>
      </div>
    </div>
  );
}
