import styles from "./../styles/Account.module.css";
import LoginForm from "~/components/ui/Account/LoginForm";
import AccountUI from "../components/ui/Account/AccountUI";

export default function Login() {
  return (
    <div className={styles.signUpBox}>
      <AccountUI />
      <LoginForm/>
    </div>
  );
}
