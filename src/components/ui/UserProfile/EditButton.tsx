import React from 'react';
import styles from 'src/styles/UserProfile/Buttons/Button.module.css';

const EditButton: React.FC = () => (
  <button className={`${styles.button} ${styles['edit-button']}`}>
  </button>
)

export default EditButton;