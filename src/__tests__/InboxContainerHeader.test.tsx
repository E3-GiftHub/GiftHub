import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import InboxContainerHeader from "../components/ui/InboxContainerHeader";

describe("InboxContainerHeader", () => {
  const defaultProps = {
    activeTab: "All",
    onTabChange: jest.fn(),
    unreadCount: 3,
    onOpenMobileFilter: jest.fn(),
  };

  beforeAll(() => {
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 390 });
    window.dispatchEvent(new Event("resize"));
  });

  it("renders mobile view when width <= 390", () => {
    render(<InboxContainerHeader {...defaultProps} />);

    const filterButton = screen.getAllByRole("button").find(btn =>
      btn.className.includes("filterButton")
    );
    expect(filterButton).toBeDefined();
  });

  it("calls onOpenMobileFilter when filter button clicked", () => {
    render(<InboxContainerHeader {...defaultProps} />);
    const filterButton = screen.getAllByRole("button").find(btn =>
      btn.className.includes("filterButton")
    );
    fireEvent.click(filterButton!);
    expect(defaultProps.onOpenMobileFilter).toHaveBeenCalled();
  });
});
