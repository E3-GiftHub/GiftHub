import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Navbar from "../components/Navbar";
import { useRouter } from "next/router";

// Mock pentru router
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

// Mock pentru next-auth/react
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  signOut: jest.fn(),
}));

import { useSession, signOut } from "next-auth/react";

describe("Navbar", () => {
  beforeEach(() => {
    // Setare router mock
    (useRouter as jest.Mock).mockReturnValue({
      pathname: "/home",
      push: jest.fn(),
    });

    // Simulăm o sesiune activă (user logat)
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

    const profileToggle = screen.getByText("Profile");
    fireEvent.click(profileToggle);

    expect(screen.getByText(/Edit Profile/i)).toBeInTheDocument();
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();
  });

  test("click pe Logout apelează signOut și redirecționează", () => {
    render(<Navbar />);

    const profileBtn = screen.getByText("Profile");
    fireEvent.click(profileBtn);

    const logoutLink = screen.getByText(/Logout/i);
    fireEvent.click(logoutLink);

    expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/" });
  });
});
