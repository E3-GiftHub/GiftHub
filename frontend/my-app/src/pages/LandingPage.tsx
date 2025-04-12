import React from 'react'
import "./../assets/LandingPageStyle.css"
import LandingSection from '../components/LandingSection'
import Navbar from '../components/Navbar'
import CardsSection from '../components/CardsSection'

export default function LandingPage() {
  return (
    <div className='landing-page'>
        <Navbar />
        <LandingSection />
        <CardsSection />
        <div className='empty-space'></div>
    </div>
  )
}
