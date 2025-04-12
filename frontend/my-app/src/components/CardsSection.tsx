import React from 'react'
import EventCard from './ui/EventCard'
import './../assets/CardsSectionStyle.css'
import BirthdayParty from './../assets/illustrations/birthday_party.svg'
import BabyShower from './../assets/illustrations/baby_shower.svg'
import Anniversaries from './../assets/illustrations/anniv.svg'
import GraduationParty from './../assets/illustrations/graduation_party.svg'
import Holidays from './../assets/illustrations/holidays.svg' 
import HousewormingParty from './../assets/illustrations/houseworming_party.svg'
import RetirementParty from './../assets/illustrations/retirement_party.svg'
import Wedding from './../assets/illustrations/wedding.svg'

const cardData = [
  {
    image: BirthdayParty,
    title: 'Birthday Party',
    description: 'Individuals can make wishlists with specific gifts they want, making it easier for friends and family to get them something they\'ll truly appreciate. ',
  },
  {
    image: Wedding,
    title: 'Wedding',
    description: 'Couples can create a detailed wishlist with items for their new home or experiences they\'d love to have. The photo/video gallery allows everyone to share memories of the special day. ',
  },
  {
    image: BabyShower,
    title: 'Baby Shower',
    description: 'Parents-to-be can create a wishlist of baby essentials, from furniture to diapers. Guests can contribute towards big-ticket items like strollers or leave cash gifts to help with expenses.',
  },
  {
    image: GraduationParty,
    title: 'Graduation Party',
    description: 'Graduates can create a wishlist for items they need for college, their first apartment, or career-related gifts. This helps guests provide practical and appreciated gifts.',
  },
  {
    image: Anniversaries,
    title: 'Anniversaries',
    description: 'Couples can create a wishlist to celebrate their milestone, whether it\'s for home upgrades, travel, or experiences. Guests can contribute to making the celebration even more special.',
  },
  {
    image: Holidays,
    title: 'Holidays',
    description: 'Groups of friends or families can use the platform to organize gift exchanges, with participants creating wishlists to give others ideas.',
  },
  {
    image: HousewormingParty,
    title: 'Houseworming Party',
    description: 'New homeowners can create a wishlist to furnish and decorate their space, and guests can help them make their house a home.',
  },
  {
    image: RetirementParty,
    title: 'Retirement Party',
    description: 'Colleagues can pool together to give a retiree a memorable gift, like a travel voucher or hobby-related equipment. The photo gallery can capture memories from their time at the company.',
  },
]

export default function CardsSection() {
  return (
    <div className='cards-container'> 
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
