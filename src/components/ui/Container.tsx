import React from 'react';
import styles from '../../styles/Container.module.css';

interface ContainerProps {
  children: React.ReactNode
}

const Container: React.FC<ContainerProps> = ({children}) => (
  <div className={styles.container}>
    {children}
  </div>
)

export default Container;