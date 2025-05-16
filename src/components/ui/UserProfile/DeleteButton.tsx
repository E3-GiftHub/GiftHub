import React from 'react';
import styles from 'src/styles/UserProfile/Buttons/Button.module.css';

const DeleteButton: React.FC = () => (
  <button className={`${styles.button} ${styles['delete-button']}`}>
  </button>
)

export default DeleteButton;