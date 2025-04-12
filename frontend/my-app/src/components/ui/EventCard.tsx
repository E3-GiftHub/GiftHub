import React from 'react'
import './../../assets/EventCardStyle.css'

type EventCardProps = {
  image: string
  title: string
  description: string
}

export default function EventCard({ image, title, description }: EventCardProps) {
  return (
    <div className='event-card'>
      <img src={image} alt={title} className='event-image' />
      <h3 className='event-title'>{title}</h3>
      <p className='event-description'>{description}</p>
    </div>
  )
}
