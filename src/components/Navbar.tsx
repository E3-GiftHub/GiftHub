"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  FaHome,
  FaInbox,
  FaUser,
  FaArrowRight,
  FaSignOutAlt,
  FaUserEdit,
  FaBars,
} from "react-icons/fa";
import styles from "./../styles/Navbar.module.css";
import Link from "next/link";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isLandingPage, setIsLandingPage] = useState(false);
  const [activePage, setActivePage] = useState<string | null>(null);

  const profileRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const specialPages = ["https://gifthub-five.vercel.app/", "/","/#"," http://localhost:3000/#", "http://localhost:3000/"];

    const checkSpecialPage = () => {
      const isSpecial = specialPages.includes(window.location.href);
      setIsLandingPage(isSpecial);
    };

    const detectActivePage = () => {
      const url = window.location.href;
      if (url.includes("/home")) setActivePage("home");
      else if (url.includes("/inbox")) setActivePage("inbox");
      else setActivePage(null);
    };

    checkSpecialPage();
    detectActivePage();

    window.addEventListener("hashchange", () => {
      checkSpecialPage();
      detectActivePage();
    });

    return () => {
      window.removeEventListener("hashchange", checkSpecialPage);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (
        !target.closest(`.${styles["nav-links"]}`) &&
        !target.closest(`.${styles.hamburger}`)
      ) {
        setMenuOpen(false);
      }

      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try{
      document.cookie = `session_auth1=; path=/; max-age=0; ${
        process.env.NODE_ENV === "production" ? "secure; samesite=lax" : ""
      }`;

      document.cookie = `session_auth2=; path=/; max-age=0; ${
        process.env.NODE_ENV === "production" ? "secure; samesite=lax" : ""
      }`;


      window.location.href = "http://localhost:3000/";
    }catch(err){
      console.error("Failure: ", err);
    }

  };

  return (
    <nav
      className={`${styles.navbar} ${
        isLandingPage ? styles["special-navbar"] : ""
      }`}
    >
      <div className={styles["navbar-left"]}>
        <img src="/logo.png" alt="Gift Hub" className={styles.logo} />
      </div>

      {isLandingPage ? (
        <div className={styles["login-wrapper"]}>
          <Link
            href="/login#"
            className={styles["login-button"]}
          >
            <FaUser />
            <FaArrowRight />
            Login
          </Link>
        </div>
      ) : (
        <>
          <button
            className={styles.hamburger}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
          >
            <FaBars />
          </button>

          {menuOpen && <div className={styles["sidebar-overlay"]}></div>}

          <ul
            className={`${styles["nav-links"]} ${
              menuOpen ? styles.open : ""
            }`}
          >
            <li>
              <Link
                href="/home#"
                className={activePage === "home" ? styles["nav-link-active"] : ""}
              >
                <FaHome /> Home
              </Link>
            </li>
            <li>
              <Link
                href="/inbox#"
                className={activePage === "inbox" ? styles["nav-link-active"] : ""}
              >
                <FaInbox /> Inbox
              </Link>
            </li>
            <li
              ref={profileRef}
              className={`${styles["profile-dropdown"]} ${
                profileOpen ? styles.open : ""
              }`}
            >
              <Link
                href="#"
                className={styles["profile-main-button"]}
                onClick={(e) => {
                  e.preventDefault();
                  setProfileOpen(!profileOpen);
                }}
              >
                <FaUser /> Profile
              </Link>
              <div className={styles["dropdown-content"]}>
                <Link href="/profile#">
                  <FaUserEdit /> Edit Profile
                </Link>
                <Link href="/#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLogout();
                  }}
                >
                  <FaSignOutAlt /> Logout
                </Link>
              </div>
            </li>
          </ul>
        </>
      )}
    </nav>
  );
};

export default Navbar;