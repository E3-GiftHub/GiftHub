"use client";
import React from "react";
import styles from "../styles/Payment.module.css";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "~/styles/globals.css";
import { useRouter } from "next/router";

interface SVGIconProps {
  className?: string;
  style?: React.CSSProperties;
  width?: string | number;
  height?: string | number;
}

const SuccessIcon: React.FC<SVGIconProps> = ({ className, style }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="80"
    height="80"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className ?? styles.icon}
    style={style ?? { color: "#4CAF50" }}
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="9 12 12 15 17 10" />
  </svg>
);

interface PaymentSuccessPageProps {
  orderId?: string;
}

const PaymentSuccessPage: React.FC<PaymentSuccessPageProps> = ({
}) => {
  
  const router = useRouter();

const handleGoHome = (): void => {
  void router.push("/home");
};
  return (
    <div className={styles.container}>
      <Navbar />

      <div className={styles.mainContent}>
        <div className={styles.card}>
          <div className={styles.iconContainer}>
            <SuccessIcon />
          </div>
          <h2 className={styles.failureMessage}>Payment Successful</h2>
          <p style={{ textAlign: "center", marginBottom: "30px" }}>
            You can now view your order details or return to the homepage.
          </p>

          <div className={styles.buttonWrapper}>
            <button onClick={handleGoHome} className={styles.actionButton}>
              Go to Homepage
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PaymentSuccessPage;
