import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Navbar from "../components/Navbar";
import { useRouter } from "next/router";

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

describe("Navbar", () => {
  beforeEach(() => {
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

    const profileToggle = screen.getByText("Profile", {
      selector: "a.profile-main-button",
    });

    fireEvent.click(profileToggle);

    expect(screen.getByText(/Edit Profile/i)).toBeInTheDocument();
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();
  });

  test("click pe Logout apelează handlerul și redirecționează", () => {
    Object.defineProperty(window.location, "href", {
      writable: true,
      value: "",
    });

    render(<Navbar />);

    const profileBtn = screen.getByText("Profile", {
      selector: "a.profile-main-button",
    });
    fireEvent.click(profileBtn);

    const logoutLink = screen.getByText(/Logout/i);
    fireEvent.click(logoutLink);

    expect(window.location.href).toBe("/");
  });
});



});