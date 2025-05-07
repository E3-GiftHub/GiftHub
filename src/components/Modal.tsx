import React from "react";
import styles from "../styles/Modal.module.css"; 

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button onClick={onClose} className={styles.closeButton}>✕</button>
        {title && <h2>{title}</h2>}
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
