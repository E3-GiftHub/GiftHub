import React from 'react'
import styles from './../styles/LandingSectionStyle.module.css'
import Button from './ui/ButtonPrimary'

export default function LandingSection() {
  return (
    <div className={styles['landing-container']}>
        <img src={'/illustrations/parachute_illustration.png'} className={styles['gifts-illustration']} alt='gift-illustration'/>
        <div className={styles['text-container']}>
            <p className={styles['title']}>GiftHub</p>
            <p className={styles['subtitle']}>Your All-in-One Gifting Solution. <br/>
            Gift Together. Celebrate Better.</p>
            <Button />
        </div>
    </div>
  )
}
