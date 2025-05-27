import React from "react";
import "./../styles/globals.css";
import styles from "../styles/AboutPage.module.css";
import Link from "next/link";

const PrivacyPolicyPage: React.FC = () => {
  const contactEmail = "contact@gifthub.eu";

  return (
    
    
    <div className={styles.aboutPage}>
      <nav className={styles.navbar}>
        <div className={styles.navLeft}>
          <Link href="/">
            <img src="/logo.png" alt="Gift Hub" className={styles.logo} />
          </Link>
        </div>
      </nav>
      <h1>Privacy Policy</h1>
      <p className={styles.intro}>Last Updated: May 27, 2025</p>

      <div className={styles.features}>
        <h2>1. Introduction</h2>
        <p>
          Welcome to GiftHub! We are committed to protecting the privacy of your personal data. This Privacy Policy explains what personal data we collect, how we use and share it, your rights regarding your data, and the security measures we take. This policy is drafted in accordance with the General Data Protection Regulation (GDPR) (EU) 2016/679 and applicable national law. By using the GiftHub platform, you agree to the practices described in this policy.
        </p>
      </div>

      <div className={styles.tech}>
        <h2>2. Personal Data We Collect</h2>
        <p>When you use GiftHub, we may collect the following categories of personal data about you:</p>
        <ul>
          <li><strong>Identification Data:</strong> Name, surname, email address.</li>
          <li><strong>Authentication Data:</strong> Login information (e.g., encrypted password, authentication tokens). If you choose to register or log in using third-party services (like Google or Facebook), we may collect the ID associated with those accounts, as permitted by you and those services.</li>
          <li><strong>Financial Data (for Event Creators):</strong> For the purpose of creating a Stripe Express account, we will use your registered email address. Stripe may collect further information directly from you as required to operate your Express account, such as bank account details for payouts. GiftHub does not store your full bank account details.</li>
          <li><strong>Transaction Data:</strong> Information related to events you create or participate in, contributions made or received (processed via Stripe).</li>
          <li><strong>Technical Information:</strong> IP address, browser type and version, operating system, cookie identifiers, and activity logs within the application.</li>
          <li><strong>Application Usage Data:</strong> Preferences set in your account, history of actions within the application, and any other information you voluntarily provide within the platform (e.g., gift descriptions, messages).</li>
        </ul>
      </div>

      <div className={styles.features}>
        <h2>3. Purposes of Data Processing</h2>
        <p>We use the collected data strictly for legitimate purposes, such as:</p>
        <ul>
          <li><strong>Providing GiftHub Services:</strong> To enable account creation, event organization, participation in events, facilitating gift exchanges, and processing contributions.</li>
          <li><strong>Payment Processing (via Stripe Connect):</strong> When an event creator initiates an event, they consent to GiftHub creating a Stripe Express account on their behalf using their registered email address. This Stripe account is necessary to receive and manage funds related to their event. GiftHub acts as a platform to facilitate these transactions and does not hold or directly control the funds. The Stripe Express account provides the event creator with the ability to receive funds, transfer funds, and connect their external bank accounts for payouts.</li>
          <li><strong>Improving User Experience:</strong> To personalize and enhance your experience on our platform, and to develop new features and functionalities.</li>
          <li><strong>Communication:</strong> To send you service-related notifications, updates about events you are involved in, and responses to your inquiries.</li>
          <li><strong>Security and Fraud Prevention:</strong> To protect the security and integrity of our platform and our users.</li>
          <li><strong>Legal Compliance:</strong> To comply with applicable legal obligations and enforce our terms.</li>
        </ul>
      </div>

      <div className={styles.tech}>
        <h2>4. Legal Basis for Processing</h2>
        <p>We process your data only on the basis of a legal basis permitted by the GDPR, primarily:</p>
        <ul>
          <li><strong>Your Explicit Consent:</strong> For certain processing activities, such as creating your account, creating a Stripe Express account on your behalf when you create an event, or sending marketing communications (where applicable and with separate consent). You provide this consent, for example, by agreeing to this Privacy Policy and our Terms and Conditions during registration.</li>
          <li><strong>Performance of a Contract:</strong> To fulfill our contractual obligations to you when you use our services as described in our Terms and Conditions.</li>
          <li><strong>Legitimate Interests:</strong> For purposes such as improving our services, security, and fraud prevention, provided these interests are not overridden by your data protection rights.</li>
          <li><strong>Legal Obligations:</strong> To comply with our legal and regulatory responsibilities.</li>
        </ul>
      </div>

      <div className={styles.features}>
        <h2>5. Sharing Data with Third Parties</h2>
        <p>We adhere to the principle of data minimization and will not share your personal data with third parties unless necessary and safe. Key third parties include:</p>
        <ul>
          <li><strong>Stripe, Inc. (&quot;Stripe&quot;):</strong> For payment processing and account services for event creators. As mentioned, when you create an event, you authorize us to create a Stripe Express account for you using your email. Stripe will process your financial data (such as bank account details for payouts) in accordance with their own Privacy Policy and Terms of Service. GiftHub acts as a middleman service and does not hold any of the funds that go into our platform accounts; all financial transactions related to events are handled through Stripe. The Stripe Express account created will have the ability to transfer, receive, and connect external bank accounts. We encourage you to review Stripe&apos;s policies.</li>
          <li><strong>Service Providers:</strong> We may use third-party service providers for hosting, data analytics, customer support, and email delivery. These providers are contractually bound to protect your data and only use it for the purposes we specify.</li>
          <li><strong>Legal Authorities:</strong> If required by law or to protect our rights, we may disclose your information to legal authorities or in response to valid legal requests.</li>
        </ul>
        <p>We ensure that any third parties with whom we share your data comply with GDPR and have adequate security measures in place through Data Processing Agreements (DPAs) where applicable.</p>
      </div>

      <div className={styles.tech}>
        <h2>6. Your Rights Regarding Personal Data</h2>
        <p>According to the GDPR, you have a series of rights that GiftHub respects:</p>
        <ul>
          <li><strong>Right of Access:</strong> You can request confirmation that we are processing data about you and access to that data.</li>
          <li><strong>Right to Rectification:</strong> You can request correction of inaccurate or incomplete personal data.</li>
          <li><strong>Right to Erasure (&quot;Right to be Forgotten&quot;):</strong> You can request the deletion of your personal data under certain conditions.</li>
          <li><strong>Right to Restriction of Processing:</strong> You can request that we limit the processing of your personal data under certain conditions.</li>
          <li><strong>Right to Data Portability:</strong> You can request to receive your personal data in a structured, commonly used, and machine-readable format, and to transmit it to another controller.</li>
          <li><strong>Right to Object:</strong> You can object to the processing of your personal data under certain conditions, particularly for direct marketing purposes.</li>
          <li><strong>Right to Withdraw Consent:</strong> Where processing is based on consent, you have the right to withdraw your consent at any time.</li>
        </ul>
        <p>These rights can often be exercised directly from your GiftHub account settings (e.g., viewing profile data, requesting data download, or account deletion). For other requests or if you need assistance, please contact us at <a href={`mailto:${contactEmail}`}>{contactEmail}</a>. We will respond to your requests without undue delay, within one month at most (this term may be extended according to the law if the request is complex, but we will inform you if necessary).</p>
      </div>

      <div className={styles.features}>
        <h2>7. Data Storage Period</h2>
        <p>We store your personal data only for the time necessary to fulfill the stated purposes for which it was collected, or as required by law.</p>
        <ul>
          <li><strong>Account Data (name, email, profile):</strong> Kept as long as you have an active account on GiftHub.</li>
          <li><strong>System Logs and Technical Data (IP, login activity, etc.):</strong> Usually kept for a shorter period for security and troubleshooting purposes.</li>
          <li><strong>Transaction Data (e.g., history of gifts, contributions):</strong> May be kept for a reasonable period even after account deletion, for internal records, to resolve disputes, and to comply with legal obligations (e.g., financial record-keeping).</li>
        </ul>
        <p>Upon account deletion, your personal information will be permanently and irreversibly deleted or anonymized from our active systems, except for data that must be retained according to legal obligations.</p>
      </div>

      <div className={styles.tech}>
        <h2>8. Data Security Measures</h2>
        <p>Protecting your data is a priority for us. We have implemented appropriate technical and organizational measures to ensure the integrity, confidentiality, and availability of your information. These measures include:</p>
        <ul>
          <li><strong>HTTPS Encryption:</strong> All communications and data transfers within the GiftHub application are secured via HTTPS (TLS).</li>
          <li><strong>Secure Password Storage:</strong> User passwords are stored hashed and salted using strong algorithms (e.g., bcrypt or Argon2).</li>
          <li><strong>Regular Backups:</strong> Databases and other critical information are backed up periodically to prevent data loss.</li>
          <li><strong>Access Controls:</strong> We implement role-based access controls to ensure that only authorized personnel have access to personal data, and only to the extent necessary for their roles.</li>
        </ul>
      </div>

      <div className={styles.features}>
        <h2>9. Notification of Security Breaches</h2>
        <p>If we become aware of a security breach that has compromised your personal data and is likely to result in a high risk to your rights and freedoms, we are committed to complying with legal notification obligations. This includes notifying the relevant supervisory authority (e.g., ANSPDCP in Romania, or your local equivalent) within 72 hours of discovery, where feasible, and informing affected users without undue delay, explaining the nature of the breach and the steps to take.</p>
      </div>

      <div className={styles.tech}>
        <h2>10. Cookies and Similar Technologies</h2>
        <p>The GiftHub platform uses cookies and similar technologies to provide a better user experience, essential functionalities, and for analytics. We will provide a cookie consent banner on your first visit, allowing you to manage your preferences for non-essential cookies. For more detailed information, please refer to our Cookie Policy (if separate) or a dedicated section within our Terms and Conditions.</p>
      </div>

      <div className={styles.features}>
        <h2>11. Children&apos;s Privacy</h2>
        <p>GiftHub is not intended for use by individuals under the age of 16 (or a higher age if stipulated by local law for consent to data processing). We do not knowingly collect personal data from children. If we become aware that we have inadvertently collected personal data from a child, we will take steps to delete such information promptly.</p>
      </div>

      <div className={styles.tech}>
        <h2>12. Changes to This Privacy Policy</h2>
        <p>We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any significant changes by posting the new policy on our platform and updating the &quot;Last Updated&quot; date. We encourage you to review this Privacy Policy periodically.</p>
      </div>

      <div className={styles.features}>
        <h2>13. Contact Us</h2>
        <p>If you have any questions, concerns, or requests regarding this Privacy Policy or our data protection practices, please contact us at:</p>
        <p>Email: <a href={`mailto:${contactEmail}`}>{contactEmail}</a></p>
      </div>

      <footer className={styles.footerNote}>
        © 2025 GiftHub — Built with passion by Group E3 💜
      </footer>
    </div>
  );
};

export default PrivacyPolicyPage;