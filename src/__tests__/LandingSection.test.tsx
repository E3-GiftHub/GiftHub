import React from "react";
import { render, screen } from "@testing-library/react";
import LandingSection from "../components/LandingSection";
import { useRouter } from "next/router";

// Mocks
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

import { useSession } from "next-auth/react";

describe("LandingSection component", () => {
  beforeEach(() => {
    // router mock
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
    });

    // simulăm un utilizator neautentificat
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: "unauthenticated",
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

  test("renders the SIGN UP button when user is unauthenticated", () => {
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
