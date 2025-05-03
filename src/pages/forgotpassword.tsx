import AccountUI from "../components/ui/Account/AccountUI";
import ForgotPasswordForm from "~/components/ui/Account/ForgotPasswordForm";
import styles from "./../styles/Account.module.css";

export default function SignUpForm() {
  return (
    <div className={styles.signUpBox}>
      <AccountUI />
      <ForgotPasswordForm/>
    </div>
  );
}
