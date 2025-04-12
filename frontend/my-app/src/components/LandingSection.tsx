import React from 'react'
import './../assets/LandingSectionStyle.css'
import ParachuteIllustration from "./../assets/illustrations/parachute_illustration.png"

export default function LandingSection() {
  return (
    <div className='landing-container'>
        <img src={ParachuteIllustration} className='gifts-illustration' alt='gift-illustration'/>
        <div className='text-container'>
            <p className='title'>GiftHub</p>
            <p className='subtitle'>Your All-in-One Gifting Solution. <br/>
            Gift Together. Celebrate Better.</p>
            <button className={"button button-primary"}>
              SIGN IN
            </button>
        </div>
    </div>
  )
}
