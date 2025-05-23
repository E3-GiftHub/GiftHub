import React from "react";
import { render, screen } from "@testing-library/react";
import Footer from "../components/Footer";
import "@testing-library/jest-dom";

describe("Footer component", () => {
  beforeEach(() => {
    render(<Footer />);
  });

  test("renders 'Follow us' text", () => {
    const followText = screen.getByText(/Follow us/i);
    expect(followText).toBeInTheDocument();
  });

  test("renders LinkedIn icon with correct link", () => {
    const linkedinLink = screen.getByRole("link", {
      name: /linkedin/i,
    });
    expect(linkedinLink).toHaveAttribute("href", expect.stringContaining("linkedin.com"));
    expect(linkedinLink).toHaveAttribute("target", "_blank");
  });


  test("renders footer links correctly", () => {
    expect(screen.getByText(/Privacy Policy/i)).toBeInTheDocument();
    expect(screen.getByText(/Terms and Conditions/i)).toBeInTheDocument();
    expect(screen.getByText(/About us/i)).toBeInTheDocument();
    expect(screen.getByText(/Contact us/i)).toBeInTheDocument();
  });

  test("renders copyright message", () => {
    const copyright = screen.getByText(/© 2025 GiftHub. All rights reserved./i);
    expect(copyright).toBeInTheDocument();
  });
});
