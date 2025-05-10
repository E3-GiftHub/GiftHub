import styles from "./../styles/Account.module.css";
import LogInForm from "~/components/ui/Account/LogInForm";
import AccountUI from "../components/ui/Account/AccountUI";

export default function Login() {
  return (
    <div className={styles.signUpBox}>
      <AccountUI />
      <LogInForm/>
    </div>
  );
}
