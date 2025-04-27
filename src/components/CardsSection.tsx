import React from 'react'
import EventCard from './ui/EventCard'
import styles from './../styles/CardsSectionStyle.module.css'

const cardInfo = {
  birthday: {
    title: 'Birthday Party',
    description: `Individuals can make wishlists with specific gifts they want, making it easier for friends and family to get them something they'll truly appreciate.`,
    image: '/illustrations/birthday_party.svg',
  },
  wedding: {
    title: 'Wedding',
    description: `Couples can create a detailed wishlist with items for their new home or experiences they'd love to have. The photo/video gallery allows everyone to share memories of the special day.`,
    image: '/illustrations/wedding.svg',
  },
  babyShower: {
    title: 'Baby Shower',
    description: `Parents-to-be can create a wishlist of baby essentials, from furniture to diapers. Guests can contribute towards big-ticket items like strollers or leave cash gifts to help with expenses.`,
    image: '/illustrations/baby_shower.svg',
  },
  graduation: {
    title: 'Graduation Party',
    description: `Graduates can create a wishlist for items they need for college, their first apartment, or career-related gifts. This helps guests provide practical and appreciated gifts.`,
    image: '/illustrations/graduation_party.svg',
  },
  anniversaries: {
    title: 'Anniversaries',
    description: `Couples can create a wishlist to celebrate their milestone, whether it's for home upgrades, travel, or experiences. Guests can contribute to making the celebration even more special.`,
    image: '/illustrations/anniv.svg',
  },
  holidays: {
    title: 'Holidays',
    description: `Groups of friends or families can use the platform to organize gift exchanges, with participants creating wishlists to give others ideas.`,
    image: '/illustrations/holidays.svg',
  },
  housewarming: {
    title: 'Housewarming Party',
    description: `New homeowners can create a wishlist to furnish and decorate their space, and guests can help them make their house a home.`,
    image: '/illustrations/houseworming_party.svg',
  },
  retirement: {
    title: 'Retirement Party',
    description: `Colleagues can pool together to give a retiree a memorable gift, like a travel voucher or hobby-related equipment. The photo gallery can capture memories from their time at the company.`,
    image: '/illustrations/retirement_party.svg',
  }
}

const events = Object.keys(cardInfo)

export default function CardsSection() {
  return (
    <div className={styles['cards-container']} aria-label='cardsSection'>
      {events.map((eventKey) => {
        const { image, title, description } = cardInfo[eventKey as keyof typeof cardInfo]
        return (
          <EventCard
            key={eventKey}
            image={image}
            title={title}
            description={description}
            aria-label='eventCard'
          />
        )
      })}
    </div>
  )
}
