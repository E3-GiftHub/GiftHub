'use client';
import React, { useState } from 'react';
import styles from '../assets/Payment.module.css';
import Image from 'next/image';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../app/globals.css';

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('cash');
  const [contributionAmount, setContributionAmount] = useState('');
  const [progress, setProgress] = useState<{ total: number; goal: number } | null>(null);

React.useEffect(() => {
  const fetchProgress = async () => {
    try {
      const res = await fetch("/api/payment/progress");
      const data = await res.json();
      setProgress(data);
    } catch (err) {
      console.error("Failed to fetch progress", err);
    }
  };

  fetchProgress();
}, []);

  return (
    <div className={styles.container}>
      <Navbar />

      <div className={styles.card}>
        <h2 className={styles.orderId}>Order id #14385683458738543</h2>

        <div className={styles.paymentSectionAlt}>
          <span>Payment Method:</span>
          <button
  className={paymentMethod === 'card' ? styles.active : styles.inactive}
  onClick={() => setPaymentMethod('card')}
>
  Card
</button>
<button
  className={paymentMethod === 'cash' ? styles.active : styles.inactive}
  onClick={() => setPaymentMethod('cash')}
>
  Direct contribution
</button>
        </div>
        {paymentMethod === 'cash' && (
  <div style={{ marginTop: '20px' }}>
    <label style={{ marginRight: '10px' }}>Contribution Amount (EUR):</label>
    <input
      type="number"
      value={contributionAmount}
      onChange={(e) => setContributionAmount(e.target.value)}
      placeholder="Enter amount"
      className={styles.contributionInput}
      min="1"
    />
  </div>
)}


        <div className={styles.tableHeader}>
          <span>Event</span>
          <span>Contribution Amount</span>
        </div>

        <div className={styles.eventRowAlt}>
          <Image src="/cake.png" alt="Birthday Cake" width={100} height={100} className={styles.image} />
          <div className={styles.eventDetails}>
            <span>Giga Chad Birthday Party</span>
            <span>Event Number 43858</span>
          </div>
          <span className={styles.amountAlt}>100 lei/euro</span>
        </div>
        {progress && (
  <div style={{ marginTop: "20px" }}>
    <p style={{ marginBottom: "8px" }}>
      €{progress.total} raised out of €{progress.goal}
    </p>
    <div style={{
      width: "100%",
      backgroundColor: "#333",
      borderRadius: "8px",
      overflow: "hidden",
      height: "16px",
    }}>
      <div style={{
        width: `${(progress.total / progress.goal) * 100}%`,
        backgroundColor: "#8a2be2",
        height: "100%",
      }} />
    </div>
  </div>
)}


        <div className={styles.checkoutBtnWrapper}>
<button
  className={styles.checkoutBtn}
  onClick={async () => {
    const endpoint =
      paymentMethod === 'card' ? '/api/payment/direct' : '/api/payment/contribute';

    const body =
      paymentMethod === 'cash'
        ? { amount: Number(contributionAmount) }
        : {};

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert('Failed to start checkout.');
    }
  }}
>
  CHECKOUT
</button>


        </div>
      </div>
      <Footer />
    </div>
  );
}