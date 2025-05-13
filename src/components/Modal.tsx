import React from "react";
import styles from "../styles/Modal.module.css"; 
import ReactDOM from "react-dom";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button onClick={onClose} className={styles.closeButton}>✕</button>
        {title && <h2 className={styles.eventsSectionTitle}>{title}</h2>}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
