import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import MobileFilterMenu from "../components/ui/MobileFilterMenu";

// ✅ Mock stiluri CSS
jest.mock("../../styles/MobileFilterMenu.module.css", () => ({
  overlay: "overlay",
  menu: "menu",
  menuItem: "menuItem",
  active: "active",
}));

describe("MobileFilterMenu", () => {
  const baseProps = {
    visible: true,
    activeTab: "All",
    onSelect: jest.fn(),
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not render if visible is false", () => {
    render(<MobileFilterMenu {...baseProps} visible={false} />);
    expect(screen.queryByText("All")).not.toBeInTheDocument();
  });

  it("renders menu and all tabs if visible is true", () => {
    render(<MobileFilterMenu {...baseProps} />);
    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getByText("My events")).toBeInTheDocument();
    expect(screen.getByText("Invitations")).toBeInTheDocument();
  });

  it("calls onSelect and onClose when a tab is clicked", () => {
    render(<MobileFilterMenu {...baseProps} />);
    fireEvent.click(screen.getByText("My events"));

    expect(baseProps.onSelect).toHaveBeenCalledWith("My events");
    expect(baseProps.onClose).toHaveBeenCalled();
  });

  it("calls onClose when overlay is clicked", () => {
    render(<MobileFilterMenu {...baseProps} />);
    fireEvent.click(screen.getByRole("presentation")); // default pentru div fără rol

    // dacă nu merge, identifică overlay-ul prin clasă:
    const overlay = screen.getByText("All").parentElement?.previousSibling as HTMLElement;
    fireEvent.click(overlay);
    expect(baseProps.onClose).toHaveBeenCalled();
  });
});
