import React from 'react';
import styles from '../../styles/Button.module.css';

const ButtonPrimary: React.FC = () => (
  <button className={`${styles.button} ${styles['button-primary']}`}>
    SIGN IN
  </button>
)

export default ButtonPrimary;