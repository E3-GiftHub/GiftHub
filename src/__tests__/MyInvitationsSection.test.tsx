import React from "react";
import { render, screen } from "@testing-library/react";
import MyInvitationsSection from "../components/MyInvitationsSection";
import shortEventsMockResponse from "../components/mock-data/shortEventsMockResponse";

describe("MyInvitationsSection", () => {
  beforeEach(() => {
    render(<MyInvitationsSection />);
  });

  it("renders the section title", () => {
    expect(screen.getByText("My events")).toBeInTheDocument();
  });

  it("renders up to 3 event rows", () => {
    const displayedEvents = shortEventsMockResponse.slice(0, 3);
    displayedEvents.forEach((event) => {
      expect(screen.getByText(event.title)).toBeInTheDocument();
    });
  });

  it("renders the 'See more' button", () => {
    expect(screen.getByText("See more")).toBeInTheDocument();
  });

  it("renders the 'Add new event' button", () => {
    expect(
      screen.getByRole("button", { name: /add new event/i }),
    ).toBeInTheDocument();
  });
});
