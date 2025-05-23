import React, { useState } from 'react';
import styles from '../styles/contribution.module.css';
import type { ContributionProps } from '../models/ContributionData.ts';


const predefinedAmounts: string[][] = [
  ['7.4', '74', '747', '7474'],
  ['744', '740', '7400', '704']
];

const Contribution: React.FC<ContributionProps> = ({ wishlist, pay }) => {
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedAmount, setSelectedAmount] = useState<string | null>(null);

  const handleAmountSelect = (amount: string) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if(value === '' || /^\d*\.?\d*$/.test(value))
      setCustomAmount(value);
    if(value === '' || /^\d*\.?\d*$/.test(value))
      setSelectedAmount(null);
  };

  const getSelectedValue = () => {
    if(customAmount)
      return customAmount;
    return selectedAmount;
  };

  const handlePayClick = () => {
    const amount = getSelectedValue();
    if(!amount) {
      alert('Please select or enter an amount');
      return;
    }
    pay();
  };

  return (
    <div className={styles.contributionContainer}>
      <div className={styles.contributionHeader}>
        <p className={styles.contributionLabel}>Contribution</p>
      </div>
      <div className={styles.amountsGrid}>
        {predefinedAmounts.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className={styles.amountRow}>
            {row.map((amount) => (
              <button
                key={amount}
                className={`${styles.amountButton} ${selectedAmount === amount ? styles.selected : ''}`}
                onClick={() => handleAmountSelect(amount)}
              >
                {amount}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className={styles.customAmountContainer}>
        <input
          type="text"
          placeholder="Other amount..."
          className={styles.customAmountInput}
          value={customAmount}
          onChange={handleCustomAmountChange}
          aria-label="Custom amount"
        />
      </div>
      <div className={styles.actionButtons}>
        <button 
          className={styles.wishlistButton} 
          onClick={wishlist}
        >
          Go to the wishlist
        </button>
        <button 
          className={styles.payButton} 
          onClick={handlePayClick}
          disabled={!getSelectedValue()}
        >
          Pay now
        </button>
      </div>
    </div>
  );
};

export default Contribution;