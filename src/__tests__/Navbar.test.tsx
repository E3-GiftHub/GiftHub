import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Navbar from "../components/Navbar";
import { MemoryRouter } from "react-router-dom";

const renderWithRoute = (initialPath: string) => {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Navbar />
    </MemoryRouter>
  );
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

  {/*test("renders login button when on landing page", () => {
    renderWithRoute("/");

    const loginButton = screen.getByText(/Login/i);
    expect(loginButton).toBeInTheDocument();
  });*/}

  test("renders navigation links when not on landing page", () => {
    renderWithRoute("/home");

    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText(/Inbox/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^Profile$/i })).toBeInTheDocument();
  });

  test("opens and closes hamburger menu", () => {
    renderWithRoute("/home");

    const hamburger = screen.getByLabelText("Toggle navigation menu");
    const navList = screen.getByRole("list");

    expect(navList.className).not.toMatch(/open/);

    fireEvent.click(hamburger);
    expect(navList.className).toMatch(/open/);

    fireEvent.click(hamburger);
    expect(navList.className).not.toMatch(/open/);
  });

  test("opens and closes profile dropdown", async () => {
    renderWithRoute("/home");

    const profileButton = screen.getByRole("link", { name: /^Profile$/i });
    fireEvent.click(profileButton);

    const editProfileLink = screen.getByText(/Edit Profile/i);
    expect(editProfileLink).toBeVisible();

    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      const profileDropdown = profileButton.parentElement;
      expect(profileDropdown).not.toHaveClass("open");
    });
  });
});

test("highlights Inbox button when on /inbox", () => {
  mockHref("http://localhost:3000/inbox#");
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