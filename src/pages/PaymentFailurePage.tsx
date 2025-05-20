'use client';
import React from 'react';
import styles from '../assets/Payment.module.css';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../app/globals.css';

interface SVGIconProps {
  className?: string;
  style?: React.CSSProperties;
  width?: string | number;
  height?: string | number;
}

const FailureIcon: React.FC<SVGIconProps> = ({ className, style }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="80"
    height="80"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className || styles.icon}
    style={style || { color: '#F44336' }}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="15" y1="9" x2="9" y2="15"></line>
    <line x1="9" y1="9" x2="15" y2="15"></line>
  </svg>
);

interface PaymentFailurePageProps {
  orderId?: string;
}

const PaymentFailurePage: React.FC<PaymentFailurePageProps> = ({ orderId = "N/A" }) => {
  const handleTryAgain = (): void => {
    console.log("Navigating to checkout to try again...");
  };

  const handleContactSupport = (): void => {
    console.log("Navigating to contact support...");
  };

  return (
    <div className={styles.container}>
      <Navbar />

      <div className={styles.mainContent}>
        <div className={styles.card}>
          <div className={styles.iconContainer}>
            <FailureIcon />
          </div>
          <h2 className={styles.failureMessage}>The payment failed</h2>

          <p style={{ textAlign: 'center', margin: '20px 0', fontSize: '1.1rem' }}>
            Unfortunately, a problem occurred while processing the payment for your order.{' '}
            <span className={styles.orderId}>#{orderId}</span>.
          </p>
          <p style={{ textAlign: 'center', marginBottom: '30px' }}>
            Please try again or use a different payment method. If the problem persists, please contact support.
          </p>

          <div className={styles.buttonWrapper}>
            <button onClick={handleTryAgain} className={styles.actionButton}>
              Try Again
            </button>
            <button onClick={handleContactSupport} className={styles.actionButton}>
              Contact Support
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PaymentFailurePage;
