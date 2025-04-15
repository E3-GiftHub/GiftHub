import React from 'react';
import '../../assets/Button.css';

enum ButtonStyle {
  PRIMARY,
  SECONDARY
}

interface ButtonProps {
  onClick: () => void,
  text: string,
  style: ButtonStyle
}

const ButtonComponent: React.FC<ButtonProps> = ({onClick, text, style}) => (
  <button className={`button ${style === ButtonStyle.PRIMARY ? 'button-primary' : 'button-secondary'}`}
          onClick={onClick}>
    {text}
  </button>
)

export {ButtonStyle, ButtonComponent};