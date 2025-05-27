import React from "react";
import "./../styles/globals.css";
import styles from "../styles/AboutPage.module.css";
import Link from "next/link";
export default function TermsPage() {
  return (
    <div className={styles.aboutPage}>
       <nav className={styles.navbar}>
        <div className={styles.navLeft}>
          <Link href="/">
            <img src="/logo.png" alt="Gift Hub" className={styles.logo} />
          </Link>
        </div>
      </nav>
      <h1>Terms and Conditions</h1>

      <p className={styles.intro}>
        By creating an account, you agree to the processing of your personal data in accordance with Regulation (EU) 2016/679. Your data will be used exclusively to provide the service. You always have the right to access, rectify, delete, or port your data. For details, please refer to the full Privacy Policy.
      </p>

      <div className={styles.features}>
        <h2>GiftHub Terms and Conditions of Use</h2>
        <p>Effective Date: 16.05.2025</p>
        <p>Please read these Terms and Conditions of Use (&quot;Terms&quot;) carefully before using the GiftHub platform. By creating an account or using our services, you agree to be bound by these Terms. If you do not agree, you must not access or use our services.</p>
      </div>

      <div className={styles.tech}>
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing or using GiftHub, you acknowledge that you have read, understood, and agreed to be bound by these Terms and our Privacy Policy. These Terms constitute a legally binding agreement between you and GiftHub regarding your use of our platform and services.</p>
        <p>By accepting these Terms, you also consent to the processing of your personal data in accordance with the General Data Protection Regulation (GDPR) and our Privacy Policy.</p>
      </div>

      <div className={styles.features}>
        <h2>2. Description of Service</h2>
        <p>GiftHub is a peer-to-peer digital platform that enables users to organize and coordinate gift exchanges for events and occasions. GiftHub acts solely as a mediator and does not sell or distribute products directly.</p>
        <p>Financial transactions (such as pooled fundraising for joint gifts) are processed by third-party providers (e.g., Stripe). These transactions are subject to the third party&#39;s terms and conditions, which you must review and accept separately.</p>
      </div>

      <div className={styles.tech}>
        <h2>3. User Obligations</h2>
        <p>By registering and using GiftHub, you agree to:</p>
        <ul>
          <li>Provide accurate and complete information during registration and keep your profile updated.</li>
          <li>Maintain confidentiality of your login credentials. You are solely responsible for all activities conducted through your account.</li>
          <li>Use the platform legally and ethically, only for its intended purposes.</li>
          <li>Refrain from engaging in illegal activities or transmitting offensive, inappropriate, or harassing content.</li>
          <li>Respect the rights and experience of other users, maintaining civil language and behavior in all communications.</li>
          <li>Upload only content (e.g., images, descriptions) for which you have legal rights and which do not infringe the intellectual property or privacy of others.</li>
        </ul>
      </div>

      <div className={styles.features}>
        <h2>4. GiftHub&#39;s Rights and Responsibilities</h2>
        <p>GiftHub reserves the right to:</p>
        <ul>
          <li>Modify, suspend, or discontinue the platform or parts of it for maintenance, updates, or improvements. Where feasible, users will be notified in advance of planned outages.</li>
          <li>Suspend or terminate accounts for violations of these Terms, the Privacy Policy, or applicable laws. In severe cases (e.g., fraud, abuse), this may occur without prior notice.</li>
          <li>Introduce new features or modify existing ones to improve the service. If such changes affect user rights or obligations, we will update these Terms accordingly.</li>
        </ul>
        <p>We are committed to:</p>
        <ul>
          <li>Protecting user data in line with our Privacy Policy.</li>
          <li>Not claiming ownership of user-generated content, but we may use it as necessary for platform functionality (e.g., displaying messages to recipients).</li>
          <li>Sending operational communications (e.g., gift notifications, changes to features). Marketing communications will only be sent with your explicit consent.</li>
        </ul>
      </div>

      <div className={styles.tech}>
        <h2>5. Liability and Limitations</h2>
        <p>a. User Responsibility</p>
        <p>You are responsible for your interactions and communications with other users. GiftHub does not pre-screen all content or actions and cannot guarantee the behavior of other users. In case of disputes (e.g., regarding a gift that was not delivered), users must resolve the issue directly. However, we may offer support where appropriate.</p>
        <p>b. Platform Disclaimer</p>
        <p>GiftHub is provided &quot;as is&quot; and &quot;as available&quot;, without warranties of any kind. While we aim to offer a secure and functional experience, we do not guarantee:</p>
        <ul>
          <li>That the service will meet your needs or expectations.</li>
          <li>That it will be uninterrupted, timely, secure, or error-free.</li>
          <li>That any errors or vulnerabilities will be entirely absent or quickly resolved.</li>
        </ul>
        <p>To the fullest extent permitted by law, GiftHub disclaims liability for any indirect, incidental, consequential, punitive, or special damages arising from or related to your use of the platform.</p>
        <p>c. Third-Party Services</p>
        <p>GiftHub integrates with third-party providers (e.g., payment gateways, Google login). We are not responsible for the content, policies, or practices of these services. Any use of third-party services is at your own risk and subject to their terms and privacy policies.</p>
      </div>

      <div className={styles.features}>
        <h2>6. Modification of Terms</h2>
        <p>GiftHub reserves the right to update or modify these Terms at any time. If we make material changes affecting your rights or obligations, we will notify you via the platform or by email. Continued use of the service after the effective date of the revised Terms constitutes acceptance.</p>
      </div>

      <div className={styles.tech}>
        <h2>7. Contact Information</h2>
        <p>If you have any questions or concerns regarding these Terms or your use of the platform, please contact us at:</p>
        <p>📧 Email: e3getmehired@yahoo.com</p>
      </div>

      <div className={styles.features}>
        <h2>8. Governing Law</h2>
        <p>These Terms shall be governed by and interpreted in accordance with the laws of the European Union. Any disputes will be subject to the exclusive jurisdiction of the competent courts in that jurisdiction.</p>
      </div>

      <footer className={styles.footerNote}>
        © 2025 GiftHub — Built with passion by Group E3 💜
      </footer>
    </div>
  );
}


