import React from "react";
import styles from "../../styles/CustomContainer.module.css";

interface CustomContainerProps {
  children: React.ReactNode;
  className?: string;
}

const CustomContainer: React.FC<CustomContainerProps> = ({ children, className }) => {
  return (
    <div className={`${styles.container} ${className ?? ""}`}>
      {children}
    </div>
  );
};

export default CustomContainer;
