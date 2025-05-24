import React from 'react';
import styles from '../../styles/Button.module.css';

const ButtonPrimary: React.FC = () => (
  <button className={`${styles.button} ${styles['button-secondary']}`}>
    Create event
  </button>
)

export default ButtonPrimary;