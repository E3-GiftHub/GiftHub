import React from 'react';
import styles from '../../styles/CloudsBackground.module.css';  // Importing the styles

const CloudsBackground: React.FC = () => {
  return (
    <div className={styles["cloud-background"]}> {/* String access to class */}
      <div className={`${styles.cloud} ${styles["cloud-left"]}`} style={{left: '30px', top: '100px'}}/>
      <div className={`${styles.cloud} ${styles["cloud-left"]}`} style={{right: '-50px', top: '300px'}}/>
      <div className={`${styles.cloud} ${styles["cloud-right"]}`} style={{left: '-60px', top: '500px'}}/>
      <div className={`${styles.cloud} ${styles["cloud-right"]}`} style={{right: '50px', top: '700px'}}/>
    </div>
  );
};

export default CloudsBackground;
