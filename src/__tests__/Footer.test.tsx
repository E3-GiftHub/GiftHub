import React from "react";
import { render, screen } from "@testing-library/react";
import Footer from "../components/Footer";
import "@testing-library/jest-dom";

const mockLocation = {
  pathname: "/",
  hash: "",
};

Object.defineProperty(window, "location", {
  value: mockLocation,
  writable: true,
});

describe("Footer component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocation.pathname = "/";
    mockLocation.hash = "";
  });

  test("renders 'Follow us' text", () => {
    render(<Footer />);
    const followText = screen.getByText(/Follow us/i);
    expect(followText).toBeInTheDocument();
  });

  test("renders LinkedIn icon with correct link", () => {
    render(<Footer />);
    const linkedinLink = screen.getByRole("link", {
      name: /linkedin/i,
    });
    expect(linkedinLink).toHaveAttribute("href", expect.stringContaining("linkedin.com"));
    expect(linkedinLink).toHaveAttribute("target", "_blank");
  });




  test("renders footer links correctly", () => {
    render(<Footer />);
    expect(screen.getByText(/Privacy Policy/i)).toBeInTheDocument();
    expect(screen.getByText(/Terms and Conditions/i)).toBeInTheDocument();
    expect(screen.getByText(/About us/i)).toBeInTheDocument();
    expect(screen.getByText(/Contact us/i)).toBeInTheDocument();
  });

  test("renders copyright message", () => {
    render(<Footer />);
    const copyright = screen.getByText(/© 2025 GiftHub. All rights reserved./i);
    expect(copyright).toBeInTheDocument();
  });

  test("applies landing page styles when on landing page", () => {
    mockLocation.pathname = "/";
    mockLocation.hash = "";
    
    render(<Footer />);
    
    const footer = screen.getByRole("contentinfo");
    expect(footer).toHaveClass("footerLanding");
  });

  test("applies landing page styles when on landing page with empty hash", () => {
    mockLocation.pathname = "/";
    mockLocation.hash = "#";
    
    render(<Footer />);
    
    const footer = screen.getByRole("contentinfo");
    expect(footer).toHaveClass("footerLanding");
  });

  test("does not apply landing page styles when not on landing page", () => {
    mockLocation.pathname = "/events";
    mockLocation.hash = "";
    
    render(<Footer />);
    
    const footer = screen.getByRole("contentinfo");
    expect(footer).not.toHaveClass("footerLanding");
  });

  test("does not apply landing page styles when on landing page with hash", () => {
    mockLocation.pathname = "/";
    mockLocation.hash = "#section1";
    
    render(<Footer />);
    
    const footer = screen.getByRole("contentinfo");
    expect(footer).not.toHaveClass("footerLanding");
  });

  test("handles hashchange events", () => {
    mockLocation.pathname = "/";
    mockLocation.hash = "";
    
    render(<Footer />);
    
    mockLocation.hash = "#test";
    const hashChangeEvent = new Event("hashchange");
    window.dispatchEvent(hashChangeEvent);

  });

  test("handles popstate events", () => {
    mockLocation.pathname = "/";
    mockLocation.hash = "";
    
    render(<Footer />);
    
    mockLocation.pathname = "/about";
    const popstateEvent = new Event("popstate");
    window.dispatchEvent(popstateEvent);
    
  });
});
