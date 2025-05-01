import React from "react";
import { render, screen } from "@testing-library/react";
import shortEventsMockResponse from "~/components/mock-data/shortEventsMockResponse";
import UpcomingEventsSection from "~/components/UpcomingEventsSection";

describe("UpcomingEventsSection", () => {
  beforeEach(() => {
    render(<UpcomingEventsSection />);
  });

  it("renders the section title", () => {
    expect(screen.getByText("Upcoming events")).toBeInTheDocument();
  });

  it("renders the calendar placeholder", () => {
    expect(screen.getByText("Calendar here")).toBeInTheDocument();
  });

  it("renders 2 event rows", () => {
    const displayedEvents = shortEventsMockResponse.slice(0, 2);
    displayedEvents.forEach((event) => {
      expect(screen.getByText(event.title)).toBeInTheDocument();
    });
  });

  it("renders the 'See more' button", () => {
    expect(screen.getByText("See more")).toBeInTheDocument();
  });
});
