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
  FaExternalLinkAlt, // Asigură-te că această iconiță este importată
} from "react-icons/fa";
import styles from "./../styles/Navbar.module.css"; // Asigură-te că și acest fișier CSS există și are stilurile necesare
import { api } from "~/trpc/react";
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isLandingPage, setIsLandingPage] = useState(false);
  const [activePage, setActivePage] = useState<string | null>(null);
  const [userStripeAccountId, setUserStripeAccountId] = useState<string | null | undefined>(undefined);

  const profileRef = useRef<HTMLLIElement>(null);
  const pathname = usePathname();

  // tRPC query pentru datele utilizatorului (inclusiv stripeAccountId)
  const {
    data: currentUser,
    isLoading: isLoadingUser,
    isError: isUserQueryError,
    error: userQueryError,
    refetch: refetchUser
  } = api.user.getSelf.useQuery(
    undefined,
    {
      enabled: !isLandingPage, // Rulează doar dacă nu e landing page
      retry: false,
    }
  );

  // tRPC mutation pentru a crea link-ul de login la Stripe Dashboard
  const stripeDashboardLinkMutation = api.stripe.createDashboardLoginLink.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, '_blank'); // Deschide în tab nou
      }
    },
    onError: (error) => {
      alert(`Stripe Dashboard Error: ${error.message}`);
    },
  });

  // Handler pentru click pe butonul Stripe Dashboard
  const handleStripeDashboardClick = () => {
    stripeDashboardLinkMutation.mutate();
  };

  // useEffect pentru a actualiza userStripeAccountId la primirea datelor
  useEffect(() => {
    if (currentUser) {
      setUserStripeAccountId(currentUser.stripeAccountId ?? null);
    }
  }, [currentUser, setUserStripeAccountId]);

  // useEffect pentru a gestiona erorile de la query-ul getSelf
  useEffect(() => {
    if (isUserQueryError && userQueryError) {
      console.error("Failed to fetch user self data:", userQueryError.message);
      setUserStripeAccountId(null);
    }
  }, [isUserQueryError, userQueryError, setUserStripeAccountId]);

  // useEffect pentru a detecta pagina de landing, pagina activă și a reîncărca datele utilizatorului dacă e necesar
  useEffect(() => {
    const specialPagesHostnames = ["localhost:3000"]; // Hostname-ul tău de dev
    const specialPaths = ["/"]; // Calea pentru landing page (root)

    const isCurrentlySpecial =
      pathname !== null &&
      specialPaths.includes(pathname) &&
      specialPagesHostnames.includes(window.location.host);
    
    setIsLandingPage(isCurrentlySpecial);

    if (isCurrentlySpecial) {
      setUserStripeAccountId(null); // Resetează pe landing page
    } else {
      // Condiție pentru refetch (dacă nu e landing page)
      if (userStripeAccountId === undefined || (currentUser === undefined && !isLoadingUser && !isUserQueryError)) {
        if (!isCurrentlySpecial) { // Dublă verificare că nu suntem pe landing page înainte de refetch
            refetchUser();
        }
      }
    }

    // Detectează pagina activă
    if (pathname && pathname.includes("/home")) {
      setActivePage("home");
    } else if (pathname && pathname.includes("/inbox")) {
      setActivePage("inbox");
    } else {
      setActivePage(null);
    }
  }, [pathname, currentUser, isLoadingUser, isUserQueryError, userStripeAccountId, refetchUser, setIsLandingPage, setUserStripeAccountId, setActivePage]);

  // useEffect pentru a închide meniurile la click în afara lor (din codul vechi)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Închide meniul mobil
      if (
        !target.closest(`.${styles["nav-links"]}`) && // Dacă nu e click pe containerul linkurilor
        !target.closest(`.${styles.hamburger}`)        // Și nici pe butonul hamburger
      ) {
        setMenuOpen(false);
      }

      // Închide dropdown-ul de profil
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []); // Array de dependințe gol, se rulează o singură dată la montare

  // Calcularea vizibilității butonului Stripe
  const showStripeButton = !isLoadingUser && !!userStripeAccountId && !isLandingPage && !isUserQueryError;

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
          <a
            href="http://localhost:3000/login#" // Consideră Link from next/link
            className={styles["login-button"]}
          >
            <FaUser />
            <FaArrowRight />
            Login
          </a>
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

          {/* Overlay-ul din codul vechi, se activează când meniul e deschis */}
          {menuOpen && <div className={styles["sidebar-overlay"]} onClick={() => setMenuOpen(false)}></div>}

          <ul
            className={`${styles["nav-links"]} ${
              menuOpen ? styles.open : ""
            }`}
          >
            <li>
              <a // Consideră Link from next/link
                href="http://localhost:3000/home#"
                className={activePage === "home" ? styles["nav-link-active"] : ""}
              >
                <FaHome /> Home
              </a>
            </li>
            <li>
              <a // Consideră Link from next/link
                href="http://localhost:3000/inbox#"
                className={activePage === "inbox" ? styles["nav-link-active"] : ""}
              >
                <FaInbox /> Inbox
              </a>
            </li>

            {/* Butonul Stripe Dashboard, adăugat condiționat */}
            {showStripeButton && (
              <li>
                <button
                  onClick={handleStripeDashboardClick}
                  className={styles["nav-button-stripe"]} // Asigură-te că ai acest stil în Navbar.module.css
                  disabled={stripeDashboardLinkMutation.isPending}
                  title="Access your Stripe Dashboard"
                >
                  <FaExternalLinkAlt />
                  <span>Stripe Dashboard</span>
                </button>
              </li>
            )}
            
            <li
              ref={profileRef}
              className={`${styles["profile-dropdown"]} ${
                profileOpen ? styles.open : ""
              }`}
            >
              <a
                href="#" // Previne navigarea default
                className={styles["profile-main-button"]}
                onClick={(e) => {
                  e.preventDefault(); // Important pentru a nu schimba URL-ul
                  setProfileOpen(!profileOpen);
                }}
              >
                <FaUser /> Profile
              </a>
              <div className={styles["dropdown-content"]}>
                <a href="http://localhost:3000/profile#"> {/* Consideră Link from next/link */}
                  <FaUserEdit /> Edit Profile
                </a>
                {/* Pentru logout, probabil vrei să apelezi o funcție, nu doar un link simplu */}
                <a href="http://localhost:3000/#"> {/* Consideră Link from next/link și funcție de logout */}
                  <FaSignOutAlt /> Logout
                </a>
              </div>
            </li>
          </ul>
        </>
      )}
    </nav>
  );
};

export default Navbar;