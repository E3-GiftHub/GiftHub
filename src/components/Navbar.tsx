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
import { useRouter } from "next/router";
import { useSession, signOut } from "next-auth/react";

const Navbar = () => {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isLandingPage, setIsLandingPage] = useState(false);
  const [activePage, setActivePage] = useState<string | null>(null);

  const profileRef = useRef<HTMLLIElement>(null);
  const router = useRouter();

  useEffect(() => {
    const updatePageState = () => {
      const { pathname, hash } = window.location;
      const isLanding =
        pathname === "/" && (hash === "" || hash === "#" || hash === undefined);
      setIsLandingPage(isLanding);

      const url = window.location.href;
      if (url.includes("/home")) setActivePage("home");
      else if (url.includes("/inbox")) setActivePage("inbox");
      else setActivePage(null);
    };

    updatePageState();
    window.addEventListener("hashchange", updatePageState);
    return () => window.removeEventListener("hashchange", updatePageState);
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

  return (
    <nav
      className={`${styles.navbar} ${
        isLandingPage ? styles["special-navbar"] : ""
      }`}
    >
      <div className={styles["navbar-left"]}>
        <Link href="/">
          <img src="/logo.png" alt="Gift Hub" className={styles.logo} />
        </Link>
      </div>

      {isLandingPage && !isLoggedIn ? (
        <div className={styles["login-wrapper"]}>
          <Link href="/api/auth/signin" className={styles["login-button"]}>
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
            className={`${styles["nav-links"]} ${menuOpen ? styles.open : ""}`}
          >
            <li>
              <Link
                href="/home#"
                className={
                  activePage === "home" ? styles["nav-link-active"] : ""
                }
              >
                <FaHome /> Home
              </Link>
            </li>
            <li>
              <Link
                href="/inbox#"
                className={
                  activePage === "inbox" ? styles["nav-link-active"] : ""
                }
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
                  <FaUserEdit /> Profile
                </Link>
                <Link
                  href="/#"
                  onClick={(e) => {
                    e.preventDefault();
                    void signOut({ callbackUrl: "/" });

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
