import React from 'react'
import styles from 'src/styles/UserProfile/UserProfile.module.css'
import EditButton from "~/components/ui/UserProfile/EditButton";
import DeleteButton from "~/components/ui/UserProfile/DeleteButton";
// import Button from './ui/ButtonPrimary'

export default function UserProfileUI() {
  return (
    <div className={styles['user-profile']}>
        <img src={'public/UserImages/Containers/Container.svg'} alt='main-container' className={styles['main-container']} />
        <img src={'public/UserImages/default_pfp.svg'} alt='user-pfp' className={styles['user-pfp']} />
        <img src={'public/UserImages/buttons/change_pfp.svg'} alt='change-pfp' className={styles['change-pfp']} />
        <img src={'public/UserImages/buttons/delete.svg'} alt='delete-button' className={styles['delete-button']} />
        <img src={'public/UserImages/buttons/edit.svg'} alt='edit-button' className={styles['edit-button']} />
        <img src={'public/UserImages/buttons/report.svg'} alt='report-button' className={styles['report-button']} />
        {/*<img src={'/illustrations/cloud.png'} alt='parachute gift' className={styles['cloud3']} />*/}
        {/*<img src={'/illustrations/cloud.png'} alt='parachute gift' className={styles['cloud4']} />*/}
        {/*<img src={'/illustrations/cloud.png'} alt='parachute gift' className={styles['cloud5']} />*/}
      
        <div className={styles['user-credentials']}>
            <p className={styles.username}>user</p>
            <p className={styles.email}>user_email@gmail.com </p>
            <EditButton/>
            <DeleteButton/>
        </div>
    </div>
  )
}
