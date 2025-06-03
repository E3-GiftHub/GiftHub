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
  FaExternalLinkAlt,
} from "react-icons/fa";
import styles from "./../styles/Navbar.module.css";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession, signOut } from "next-auth/react";
import { api } from "~/trpc/react";

const Navbar = () => {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isLandingPage, setIsLandingPage] = useState(false);
  const [activePage, setActivePage] = useState<string | null>(null);
  const [userStripeAccountId, setUserStripeAccountId] = useState<
    string | null | undefined
  >(undefined);

  const profileRef = useRef<HTMLLIElement>(null);
  const router = useRouter();

  const {
    data: currentUser,
    isLoading: isLoadingUser,
    isError: isUserQueryError,
    error: userQueryError,
    refetch: refetchUser,
  } = api.user.getSelf.useQuery(undefined, {
    enabled: isLoggedIn && !isLandingPage,
    retry: false,
  });

  const stripeDashboardLinkMutation =
    api.stripe.createDashboardLoginLink.useMutation({
      onSuccess: (data) => {
        if (data.url) {
          window.open(data.url, "_blank");
        }
      },
      onError: (error) => {
        alert(`Stripe Dashboard Error: ${error.message}`);
      },
    });

  const handleStripeDashboardClick = () => {
    stripeDashboardLinkMutation.mutate();
  };

  useEffect(() => {
    if (currentUser) {
      setUserStripeAccountId(currentUser.stripeConnectId ?? null);
    } else if (!isLoggedIn || isLandingPage) {
      setUserStripeAccountId(null);
    }
  }, [currentUser, isLoggedIn, isLandingPage, setUserStripeAccountId]);

  useEffect(() => {
    if (isUserQueryError && userQueryError) {
      console.error("Failed to fetch user self data:", userQueryError.message);
      setUserStripeAccountId(null);
    }
  }, [isUserQueryError, userQueryError, setUserStripeAccountId]);

  useEffect(() => {
    if (isLoggedIn && !isLandingPage) {
      if (
        userStripeAccountId === undefined &&
        !isLoadingUser &&
        !isUserQueryError &&
        !currentUser
      ) {
        refetchUser();
      }
    } else {
      if (isLandingPage || !isLoggedIn) {
        setUserStripeAccountId(null);
      }
    }
  }, [
    isLoggedIn,
    isLandingPage,
    userStripeAccountId,
    currentUser,
    isLoadingUser,
    isUserQueryError,
    refetchUser,
    setUserStripeAccountId,
  ]);

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
    router.events?.on("routeChangeComplete", updatePageState);
    return () => {
      window.removeEventListener("hashchange", updatePageState);
      router.events?.off("routeChangeComplete", updatePageState);
    };
  }, [router.events]);

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

  const showStripeButton =
    isLoggedIn &&
    !isLoadingUser &&
    !!userStripeAccountId &&
    !isLandingPage &&
    !isUserQueryError;

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

      {!isLoggedIn ? (
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
            {showStripeButton && (
              <li>
                <button
                  onClick={handleStripeDashboardClick}
                  className={styles["nav-button-stripe"]}
                  disabled={stripeDashboardLinkMutation.isPending}
                  title="Access your Stripe Dashboard"
                >
                  <FaExternalLinkAlt />
                  <span>Stripe Dashboard</span>
                </button>
              </li>
            )}
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
                    document.cookie = "persistent-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; max-age=0";
                    void signOut({
                      redirectTo: "/"
                    });

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
