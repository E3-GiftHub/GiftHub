import React from 'react';
import styles from '../../styles/ContainerEventTitle.module.css';

interface ContainerEventTitleProps {
  title: string;
}

const ContainerEventTitle: React.FC<ContainerEventTitleProps> = ({title}) => {
  return (
    <div className={styles['container-event-title']}>
      <img
        src="/illustrations/parachute.png"
        className={styles['event-icon']}
      />
      <span className={styles['event-title']}>{title}</span>
    </div>
  );
};

export default ContainerEventTitle;
