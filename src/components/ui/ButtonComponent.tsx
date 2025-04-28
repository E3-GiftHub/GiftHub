import React from 'react';
import styles from '../../styles/Button.module.css'

enum ButtonStyle {
  PRIMARY,
  SECONDARY
}

interface ButtonProps {
  text: string,
  style: ButtonStyle
  onClick?: () => void,
}

const ButtonComponent: React.FC<ButtonProps> = ({text, style, onClick}) => (
  <button
    className={`${styles.button} ${style === ButtonStyle.PRIMARY ? styles['button-primary'] : styles['button-secondary']}`}
    onClick={onClick}
  >
    {text}
  </button>
)

export {ButtonStyle, ButtonComponent};