import React from 'react';
import styles from '../../styles/Container.module.css';

enum ContainerBorderStyle {
  TOP,
  BOTTOM
}

interface ContainerProps {
  children: React.ReactNode
  borderStyle?: ContainerBorderStyle
}

const Container: React.FC<ContainerProps> = ({children, borderStyle}) => (
  <div
    className={`${styles.container} ${borderStyle === ContainerBorderStyle.TOP ? styles['container-border-top'] : styles['container-border-bottom']}`}>
    {children}
  </div>
)

export {Container, ContainerBorderStyle};