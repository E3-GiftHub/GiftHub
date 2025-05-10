import React from "react";
import { render, screen } from "@testing-library/react";
import LandingSection from "../components/LandingSection";
import { useRouter } from "next/router";

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

describe("LandingSection component", () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
    });

    render(<LandingSection />);
  });

  test("renders the GiftHub title and subtitle", () => {
    expect(screen.getByText("GiftHub")).toBeInTheDocument();
    expect(
      screen.getByText(/Your All-in-One Gifting Solution/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Gift Together. Celebrate Better./i)
    ).toBeInTheDocument();
  });

  test("renders the SIGN UP button", () => {
    const button = screen.getByRole("button", { name: /sign up/i });
    expect(button).toBeInTheDocument();
  });

  test("renders parachute images", () => {
    const parachutes = screen.getAllByAltText("parachute gift");
    expect(parachutes.length).toBe(9); 
  });

  test("renders main gift illustration", () => {
    const illustration = screen.getByAltText("gift-illustration");
    expect(illustration).toBeInTheDocument();
  });
});
