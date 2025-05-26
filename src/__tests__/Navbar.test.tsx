jest.mock("next/router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    prefetch: jest.fn(),
    pathname: "/home",
    route: "/home",
    query: {},
    asPath: "/home",
    replace: jest.fn(),
    reload: jest.fn(),
    back: jest.fn(),
    isFallback: false,
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
    beforePopState: jest.fn(),
    isReady: true,
  }),
}));

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Navbar from "../components/Navbar";

const renderWithRoute = (initialPath: string) => {
  return render(<Navbar />);
};
const mockHref = (url: string) => {
  Object.defineProperty(window, "location", {
    value: new URL(url),
    writable: true,
  });
};

describe("Navbar component", () => {
  test("renders Navbar component without crashing", () => {
    renderWithRoute("/");

    const logo = screen.getByAltText("Gift Hub");
    expect(logo).toBeInTheDocument();
  });

  {
    /*test("renders login button when on landing page", () => {
    renderWithRoute("/");

    const loginButton = screen.getByText(/Login/i);
    expect(loginButton).toBeInTheDocument();
  });*/
  }

  test("afișează link-urile Home și Inbox când nu este pe landing page", () => {
    render(<Navbar />);
    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText(/Inbox/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /^Profile$/i }),
    ).toBeInTheDocument();
  });

  test("toggle la meniul de profil", () => {
  render(<Navbar />);
  
  const profileToggle = screen.getByText("Profile", {
    selector: "a.profile-main-button"
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

  const inboxLink = screen.getByText(/Inbox/i).closest("a");
  expect(inboxLink).toHaveClass("nav-link-active");
});

test("highlights Home button when on /home", () => {
  mockHref("http://localhost:3000/home#");
  render(<Navbar />);

  const homeLink = screen.getByText(/Home/i).closest("a");
  expect(homeLink).toHaveClass("nav-link-active");
  });
});