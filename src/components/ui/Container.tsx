import React from "react";
import styles from "../../styles/Container.module.css";

enum ContainerBorderStyle {
  TOP,
  BOTTOM,
}

interface SeeMoreButtonProps {
  onClick?: () => void;
}

const SeeMoreButton: React.FC<SeeMoreButtonProps> = ({ onClick }) => (
  <div className={styles["see-more-button"]}>
    
      <button onClick={onClick} className={styles["see-more-button-button"]}>
        See more
      </button>
  
  </div>
);

interface ContainerProps {
  children: React.ReactNode;
  borderStyle?: ContainerBorderStyle;
}

const Container: React.FC<ContainerProps> = ({ children, borderStyle }) => (
  <div
    className={`${styles.container} ${borderStyle === ContainerBorderStyle.TOP ? styles["container-border-top"] : styles["container-border-bottom"]}`}
  >
    {children}
  </div>
);

export { Container, SeeMoreButton, ContainerBorderStyle };
