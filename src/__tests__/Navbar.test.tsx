import React from 'react'; 
import { render, screen, fireEvent,waitFor } from "@testing-library/react";
import Navbar from "../components/Navbar";

describe("Navbar component", () => {
  
  const mockLocation = (url: string) => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { href: url },
    });
  };

  test('renders Navbar component without crashing', () => {
    mockLocation("http://localhost:3000/#");

    render(<Navbar />);
    const logo = screen.getByAltText('Gift Hub');
    expect(logo).toBeInTheDocument();
  });

  test('renders login button when on landing page', () => {
    mockLocation("http://localhost:3000/#");

    render(<Navbar />);
    const loginButton = screen.getByText(/Login/i);
    expect(loginButton).toBeInTheDocument();
  });

  test('renders navigation links when not on landing page', () => {
    mockLocation("http://localhost:3000/home#");

    render(<Navbar />);
    const homeLink = screen.getByText(/Home/i);
    const inboxLink = screen.getByText(/Inbox/i);
    const profileButton = screen.getByRole('link', { name: /^Profile$/i });

    expect(homeLink).toBeInTheDocument();
    expect(inboxLink).toBeInTheDocument();
    expect(profileButton).toBeInTheDocument();
  });

  test('opens and closes hamburger menu', () => {
    mockLocation("http://localhost:3000/home#");

    render(<Navbar />);
    const hamburger = screen.getByLabelText('Toggle navigation menu');

    // Inițial meniul nu este deschis
    expect(screen.queryByRole('list')).not.toHaveClass('open');

    // Click pentru a deschide meniul
    fireEvent.click(hamburger);
    const navLinks = screen.getByRole('list');
    expect(navLinks.className).toMatch(/open/);

    // Click din nou pentru a închide meniul
    fireEvent.click(hamburger);
    expect(navLinks.className).not.toMatch(/open/);
  });

  test('opens and closes profile dropdown', async () => {
    mockLocation("http://localhost:3000/home#");
  
    render(<Navbar />);
    const profileButton = screen.getByText(/^Profile$/i);
  
    // Click pentru a deschide dropdown-ul
    fireEvent.click(profileButton);
  
    const editProfileLink = screen.getByText(/Edit Profile/i);
    expect(editProfileLink).toBeVisible();
  
    // Click în afara dropdown-ului
    fireEvent.mouseDown(document.body);
  
    // Așteptăm ca dropdown-ul să dispară
    await waitFor(() => {
        const profileDropdown = profileButton.parentElement;
        expect(profileDropdown).not.toHaveClass('open');
    });
  });

});
