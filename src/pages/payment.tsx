'use client';
import React, { useState } from 'react';
import styles from '../assets/Payment.module.css';
import Image from 'next/image';
import Navbar from '../components/Navbar';

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('cash');
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
  Direct cash
</button>
        </div>

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

        <div className={styles.checkoutBtnWrapper}>
          <button className={styles.checkoutBtn}>CHECKOUT</button>
        </div>
      </div>
    </div>
  );
}