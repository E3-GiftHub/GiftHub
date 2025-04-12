"use client"

import { useState, useEffect } from "react"
import { FaHome, FaInbox, FaUser, FaSignOutAlt, FaUserEdit, FaBars } from "react-icons/fa"
import styles from "./../styles/Navbar.module.css"

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest(".nav-links") && !target.closest(".hamburger")) {
        setMenuOpen(false)
      }
      if (!target.closest(".profile-dropdown")) {
        setProfileOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <nav className={styles["navbar"]}>
      <div className={styles["navbar-left"]}>
        <img src="/logo.png" alt="Gift Hub" className={styles["logo"]} />
      </div>

      <div className={styles["hamburger"]} onClick={() => setMenuOpen(!menuOpen)}>
        <FaBars />
      </div>

      {menuOpen && <div className={styles["sidebar-overlay"]}></div>}

      <ul className={`${styles['nav-links']} ${menuOpen ? styles.open : ''}`}>
        <li>
          <a href="#">
            <FaHome /> Home
          </a>
        </li>
        <li>
          <a href="#">
            <FaInbox /> Inbox
          </a>
        </li>
        <li className={`${styles['profile-dropdown']} ${profileOpen ? styles.open : ''}`}>
          <a
            href="#"
            className={styles["profile-main-button"]}
            onClick={(e) => {
              e.preventDefault()
              setProfileOpen(!profileOpen)
            }}
          >
            <FaUser /> Profile
          </a>
          <div className={styles["dropdown-content"]}>
            <a href="#">
              <FaUserEdit /> Edit Profile
            </a>
            <a href="#">
              <FaSignOutAlt /> Logout
            </a>
          </div>
        </li>
      </ul>
    </nav>
  )
}

export default Navbar
