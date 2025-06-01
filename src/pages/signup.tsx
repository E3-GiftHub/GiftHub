import AccountUI from "~/components/ui/Account/AccountUI";
import "./../styles/globals.css";
import SignupForm from "~/components/ui/Account/SignUpForm";
import styles from "./../styles/Account.module.css";

export default function Signup() {
  return (
    <div className={styles.fullPageWrapper}>
      <div className={styles.signUpBox}>
        <AccountUI/>
        <SignupForm/>
      </div>
    </div>
  );
}
