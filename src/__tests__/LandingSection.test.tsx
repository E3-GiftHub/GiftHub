import React from "react";
import { render, screen } from "@testing-library/react";
import LandingSection from "../components/LandingSection";
import { MemoryRouter } from "react-router-dom"; 

describe("LandingSection component", () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
        <LandingSection />
      </MemoryRouter>
    );
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

  test("renders the SIGN IN button", () => {
    const button = screen.getByRole("button", { name: /sign in/i });
    expect(button).toBeInTheDocument();
  });

  test("renders parachute images", () => {
    const parachutes = screen.getAllByAltText("parachute gift");
    expect(parachutes.length).toBe(4 + 5); // 4 parachutes + 5 clouds
  });

  test("renders main gift illustration", () => {
    const illustration = screen.getByAltText("gift-illustration");
    expect(illustration).toBeInTheDocument();
  });
});
