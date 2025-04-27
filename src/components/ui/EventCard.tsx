import React from 'react';
import styles from './../../styles/EventCardStyle.module.css';

type EventCardProps = {
  image: string
  title: string
  description: string
  'aria-label'?: string;
}

export default function EventCard({ image, title, description, 'aria-label': ariaLabel }: Readonly<EventCardProps>) {
  return (
    <div className={styles['event-card']}>
      <img src={image} alt={title} className={styles['event-image']} aria-label={ariaLabel} />
      <h3 className={styles['event-title']}>{title}</h3>
      <p className={styles['event-description']}>{description}</p>
    </div>
  )
}
