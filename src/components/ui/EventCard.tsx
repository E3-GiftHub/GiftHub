import React from 'react'
import styles from './../../styles/EventCardStyle.module.css'

type EventCardProps = {
  image: string
  title: string
  description: string
}

export default function EventCard({ image, title, description }: EventCardProps) {
  return (
    <div className={styles['event-card']}>
      <img src={image} alt={title} className={styles['event-image']} />
      <h3 className={styles['event-title']}>{title}</h3>
      <p className={styles['event-description']}>{description}</p>
    </div>
  )
}
