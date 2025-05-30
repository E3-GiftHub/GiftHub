import styles from "./../styles/Account.module.css";
import "./../styles/globals.css";
import LogInForm from "~/components/ui/Account/LogInForm";
import AccountUI from "~/components/ui/Account/AccountUI";

export default function Login() {
  return (
    <div className={styles.fullPageWrapper}>
      <div className={styles.signUpBox}>
        <AccountUI />
        <LogInForm/>
      </div>
    </div>
  );
}
