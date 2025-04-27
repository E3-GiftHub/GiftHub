import React from 'react';
import styles from "./../styles/LandingPageStyle.module.css"
import LandingSection from '../components/LandingSection'
import Navbar from '../components/Navbar'
import CardsSection from '../components/CardsSection'
import "./../styles/globals.css"

export default function LandingPage() {
  return (
    <div className={styles['landing-page']}>
        <Navbar />
        <LandingSection />
        <CardsSection />
        <div className={styles['empty-space']}></div>
    </div>
  )
}
