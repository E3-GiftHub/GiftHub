import React from 'react'
import EventCard from './ui/EventCard'
import styles from './../styles/CardsSectionStyle.module.css' 

const cardData = [
  {
    image: '/illustrations/birthday_party.svg',
    title: 'Birthday Party',
    description: 'Individuals can make wishlists with specific gifts they want, making it easier for friends and family to get them something they\'ll truly appreciate. ',
  },
  {
    image: '/illustrations/wedding.svg',
    title: 'Wedding',
    description: 'Couples can create a detailed wishlist with items for their new home or experiences they\'d love to have. The photo/video gallery allows everyone to share memories of the special day. ',
  },
  {
    image: '/illustrations/baby_shower.svg',
    title: 'Baby Shower',
    description: 'Parents-to-be can create a wishlist of baby essentials, from furniture to diapers. Guests can contribute towards big-ticket items like strollers or leave cash gifts to help with expenses.',
  },
  {
    image: '/illustrations/graduation_party.svg',
    title: 'Graduation Party',
    description: 'Graduates can create a wishlist for items they need for college, their first apartment, or career-related gifts. This helps guests provide practical and appreciated gifts.',
  },
  {
    image: '/illustrations/anniv.svg',
    title: 'Anniversaries',
    description: 'Couples can create a wishlist to celebrate their milestone, whether it\'s for home upgrades, travel, or experiences. Guests can contribute to making the celebration even more special.',
  },
  {
    image: '/illustrations/holidays.svg',
    title: 'Holidays',
    description: 'Groups of friends or families can use the platform to organize gift exchanges, with participants creating wishlists to give others ideas.',
  },
  {
    image: '/illustrations/houseworming_party.svg',
    title: 'Houseworming Party',
    description: 'New homeowners can create a wishlist to furnish and decorate their space, and guests can help them make their house a home.',
  },
  {
    image: '/illustrations/retirement_party.svg',
    title: 'Retirement Party',
    description: 'Colleagues can pool together to give a retiree a memorable gift, like a travel voucher or hobby-related equipment. The photo gallery can capture memories from their time at the company.',
  },
]

export default function CardsSection() {
  return (
    <div className={styles['cards-container']}> 
        {cardData.map((card, index) => (
        <EventCard
          key={index}
          image={card.image}
          title={card.title}
          description={card.description}
        />
      ))}
    </div>
  )
}
