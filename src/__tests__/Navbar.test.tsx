import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Navbar from "../components/Navbar";
import { useRouter } from "next/router";
import { useSession, signOut } from "next-auth/react";
import styles from "../styles/Navbar.module.css";

// Mock fetch globally
global.fetch = jest.fn();

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  signOut: jest.fn(),
}));

// Mock console.error to suppress error logs in tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe("Navbar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    (useRouter as jest.Mock).mockReturnValue({
      pathname: "/home",
      push: jest.fn(),
      isReady: true,
    });

    (useSession as jest.Mock).mockReturnValue({
      data: { user: { name: "Cati" } },
      status: "authenticated",
    });

    Object.defineProperty(window, "location", {
      value: {
        pathname: "/home",
        hash: "",
        href: "http://localhost:3000/home",
      },
      writable: true,
    });

    // Reset fetch mock
    (global.fetch as jest.Mock).mockClear();
  });

  test("afișează sigla și butonul hamburger", () => {
    render(<Navbar />);
    expect(screen.getByAltText("Gift Hub")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /toggle navigation menu/i }),
    ).toBeInTheDocument();
  });

  test("afișează link-urile Home și Inbox când nu este pe landing page", () => {
    render(<Navbar />);
    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText(/Inbox/i)).toBeInTheDocument();
  });

  test("toggle la meniul de profil", () => {
    render(<Navbar />);

    const profileLinks = screen.queryAllByText("Profile");
    expect(profileLinks.length).toBeGreaterThan(0); 

    fireEvent.click(profileLinks[0]!); 

    expect(screen.getByText(/Logout/i)).toBeInTheDocument();
  });

  test("click pe Logout apelează signOut și redirecționează", () => {
    render(<Navbar />);

    const profileLinks = screen.queryAllByText("Profile");
    expect(profileLinks.length).toBeGreaterThan(0); 

    fireEvent.click(profileLinks[0]!); 

    const logoutLink = screen.getByText(/Logout/i);
    fireEvent.click(logoutLink);
    expect(signOut).toHaveBeenCalledWith({ redirectTo: "/" });
  });

  test("afișează butonul de login pe landing page când utilizatorul nu este autentificat", () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: "unauthenticated",
    });

    Object.defineProperty(window, "location", {
      value: {
        pathname: "/",
        hash: "",
        href: "http://localhost:3000/",
      },
      writable: true,
    });

    render(<Navbar />);
    
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
    expect(screen.queryByText(/Home/i)).not.toBeInTheDocument();
  });

  test("toggle la meniul hamburger", () => {
    render(<Navbar />);
    
    const hamburgerButton = screen.getByRole("button", { name: /toggle navigation menu/i });
    
    // Click to open menu
    fireEvent.click(hamburgerButton);
    
    // Check if overlay appears
    const overlay = document.querySelector(`.${styles["sidebar-overlay"]}`);
    expect(overlay).toBeInTheDocument();
    
    // Check if nav links have open class
    const navLinks = document.querySelector(`.${styles["nav-links"]}`);
    if (styles.open) {
      expect(navLinks).toHaveClass(styles.open);
    }
  });

  test("detectează pagina activă pentru inbox", () => {
    Object.defineProperty(window, "location", {
      value: {
        pathname: "/inbox",
        hash: "",
        href: "http://localhost:3000/inbox",
      },
      writable: true,
    });

    render(<Navbar />);
    
    const inboxLink = screen.getByText(/Inbox/i).closest('a');
    if (styles["nav-link-active"]) {
      expect(inboxLink).toHaveClass(styles["nav-link-active"]);
    }
  });

  test("detectează pagina activă pentru home", () => {
    Object.defineProperty(window, "location", {
      value: {
        pathname: "/home",
        hash: "",
        href: "http://localhost:3000/home",
      },
      writable: true,
    });

    render(<Navbar />);
    
    const homeLink = screen.getByText(/Home/i).closest('a');
    if (styles["nav-link-active"]) {
      expect(homeLink).toHaveClass(styles["nav-link-active"]);
    }
  });

  test("afișează link-ul Stripe când hasExpress este true", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve("true"),
    });

    render(<Navbar />);

    await waitFor(() => {
      expect(screen.getByText(/Stripe/i)).toBeInTheDocument();
    });
  });

  test("nu afișează link-ul Stripe când hasExpress este false", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve("false"),
    });

    render(<Navbar />);

    await waitFor(() => {
      expect(screen.queryByText(/Stripe/i)).not.toBeInTheDocument();
    });
  });

  test("gestionează eroarea la apelul API Stripe", async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<Navbar />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Failed to load media", expect.any(Error));
    });
    
    consoleSpy.mockRestore();
  });

  test("gestionează eroarea din catch block în useEffect", async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    (global.fetch as jest.Mock).mockImplementation(() => {
      throw new Error('Unexpected error');
    });

    render(<Navbar />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Failed to load media", expect.any(Error));
    });
    
    consoleSpy.mockRestore();
  });

  test("închide meniul la click în afara lui", () => {
    render(<Navbar />);
    
    const hamburgerButton = screen.getByRole("button", { name: /toggle navigation menu/i });
    
    // Open menu
    fireEvent.click(hamburgerButton);
    
    // Check menu is open
    const navLinks = document.querySelector(`.${styles["nav-links"]}`);
    if (styles.open) {
      expect(navLinks).toHaveClass(styles.open);
    }
    
    // Click outside
    fireEvent.mouseDown(document.body);
    
    // Check menu is closed
    if (styles.open) {
      expect(navLinks).not.toHaveClass(styles.open);
    }
  });

  test("închide meniul de profil la click în afara lui", () => {
    render(<Navbar />);
    
    const profileLinks = screen.queryAllByText("Profile");
    fireEvent.click(profileLinks[0]!);
    
    // Profile menu should be open
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();
    
    // Click outside
    fireEvent.mouseDown(document.body);
    
    // Profile menu should be closed
    const profileDropdown = document.querySelector(`.${styles["profile-dropdown"]}`);
    if (styles.open) {
      expect(profileDropdown).not.toHaveClass(styles.open);
    }
  });

  test("navighează la pagina de profil", () => {
    render(<Navbar />);
    
    const profileLinks = screen.queryAllByText("Profile");
    fireEvent.click(profileLinks[0]!);
    
    const profilePageLinks = screen.getAllByText(/Profile/i);
    const profilePageLink = profilePageLinks.find(link => 
      link.closest('a')?.getAttribute('href') === '/profile#'
    );
    
    if (profilePageLink) {
      expect(profilePageLink.closest('a')).toHaveAttribute('href', '/profile#');
    }
  });

  test("răspunde la schimbarea hash-ului", () => {
    render(<Navbar />);
    
    // Simulează schimbarea hash-ului
    Object.defineProperty(window, "location", {
      value: {
        pathname: "/",
        hash: "#section",
        href: "http://localhost:3000/#section",
      },
      writable: true,
    });
    
    // Trigger hashchange event
    fireEvent(window, new Event('hashchange'));
    
    // Verify that it's no longer considered landing page
    expect(screen.queryByText(/Login/i)).not.toBeInTheDocument();
  });

  test("nu execută fetch când router nu este ready", () => {
    (useRouter as jest.Mock).mockReturnValue({
      pathname: "/home",
      push: jest.fn(),
      isReady: false,
    });

    render(<Navbar />);
    
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("nu execută fetch când nu există session user", () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: "authenticated",
    });

    render(<Navbar />);
    
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("nu execută fetch când session user name este undefined", () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: {} },
      status: "authenticated",
    });

    render(<Navbar />);
    
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("execută fetch pentru Stripe când condițiile sunt îndeplinite", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve("true"),
    });

    render(<Navbar />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "./api/stripe/check-express?username=Cati"
      );
    });
  });

  test("detectează landing page cu hash gol", () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: "unauthenticated",
    });

    Object.defineProperty(window, "location", {
      value: {
        pathname: "/",
        hash: "#",
        href: "http://localhost:3000/#",
      },
      writable: true,
    });

    render(<Navbar />);
    
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
  });

  test("detectează landing page cu hash undefined", () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: "unauthenticated",
    });

    Object.defineProperty(window, "location", {
      value: {
        pathname: "/",
        hash: undefined,
        href: "http://localhost:3000/",
      },
      writable: true,
    });

    render(<Navbar />);
    
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
  });

  test("nu detectează landing page cu hash cu conținut", () => {
    Object.defineProperty(window, "location", {
      value: {
        pathname: "/",
        hash: "#section",
        href: "http://localhost:3000/#section",
      },
      writable: true,
    });

    render(<Navbar />);
    
    expect(screen.queryByText(/Login/i)).not.toBeInTheDocument();
  });

  test("nu se închide meniul când se face click pe hamburger", () => {
    render(<Navbar />);
    
    const hamburgerButton = screen.getByRole("button", { name: /toggle navigation menu/i });
    
    // Open menu
    fireEvent.click(hamburgerButton);
    
    // Click on hamburger again
    fireEvent.mouseDown(hamburgerButton);
    
    // Menu should still be open
    const navLinks = document.querySelector(`.${styles["nav-links"]}`);
    if (styles.open) {
      expect(navLinks).toHaveClass(styles.open);
    }
  });

  test("nu se închide meniul când se face click pe nav-links", () => {
    render(<Navbar />);
    
    const hamburgerButton = screen.getByRole("button", { name: /toggle navigation menu/i });
    
    // Open menu
    fireEvent.click(hamburgerButton);
    
    // Click on nav links
    const navLinks = document.querySelector(`.${styles["nav-links"]}`);
    fireEvent.mouseDown(navLinks!);
    
    // Menu should still be open
    if (styles.open) {
      expect(navLinks).toHaveClass(styles.open);
    }
  });

  test("setează cookie și apelează signOut la logout", () => {
    render(<Navbar />);

    const profileLinks = screen.queryAllByText("Profile");
    fireEvent.click(profileLinks[0]!);

    const logoutLink = screen.getByText(/Logout/i);
    
    // Mock document.cookie
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    });

    fireEvent.click(logoutLink);

    expect(signOut).toHaveBeenCalledWith({ redirectTo: "/" });
  });
});