import React from 'react';
import styles from '../styles/LoadingSpinner.module.css';

const LoadingSpinner: React.FC = () => (
    <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
    </div>
);

export default LoadingSpinner;