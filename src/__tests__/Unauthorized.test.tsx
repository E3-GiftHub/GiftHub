import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Unauthorized from "~/components/Unauthorized";
import { useRouter } from "next/router";

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

describe("Unauthorized component", () => {
  const pushMock = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: pushMock,
    });
    jest.clearAllMocks();
  });

  it("renders unauthorized message and home button", () => {
    render(<Unauthorized />);

    expect(
      screen.getByRole("heading", { name: /Unauthorized Access/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/You are not allowed to view this page/i),
    ).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /Home/i })).toBeInTheDocument();
  });

  it("navigates to /home# when Home button is clicked", () => {
    render(<Unauthorized />);

    const homeButton = screen.getByRole("button", { name: /Home/i });
    fireEvent.click(homeButton);

    expect(pushMock).toHaveBeenCalledWith("/home#");
  });
});
