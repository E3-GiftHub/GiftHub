import React from "react";
import { render, screen } from "@testing-library/react";
import MyEventsSection from "../components/MyEventsSection";
import shortEventsMockResponse from "../components/mock-data/shortEventsMockResponse";
import { api } from "~/trpc/react";

jest.mock("~/trpc/react", () => ({
  api: {
    eventPreview: {
      getUpcomingEvents: {
        useQuery: jest.fn(),
      },
    },
  },
}));

const useQueryMock = api.eventPreview.getUpcomingEvents.useQuery as jest.Mock;

describe("MyEventsSection", () => {
  it("renders the loading state", () => {
    useQueryMock.mockReturnValueOnce({
      data: undefined,
      isLoading: true,
      isError: false,
    });
    render(<MyEventsSection />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders the error state", () => {
    useQueryMock.mockReturnValueOnce({
      data: undefined,
      isLoading: false,
      isError: true,
    });
    render(<MyEventsSection />);
    expect(screen.getByText("Failed to load events.")).toBeInTheDocument();
  });

  it("renders the section title", () => {
    useQueryMock.mockReturnValueOnce({
      data: shortEventsMockResponse,
      isLoading: false,
      isError: false,
    });
    render(<MyEventsSection />);
    expect(screen.getByText("My events")).toBeInTheDocument();
  });

  it("renders up to 3 event rows", () => {
    useQueryMock.mockReturnValueOnce({
      data: shortEventsMockResponse,
      isLoading: false,
      isError: false,
    });
    render(<MyEventsSection />);
    const displayedEvents = shortEventsMockResponse.slice(0, 3);
    displayedEvents.forEach((event) => {
      expect(screen.getByText(event.title)).toBeInTheDocument();
    });
  });

  it("renders the 'See more' button", () => {
    useQueryMock.mockReturnValueOnce({
      data: shortEventsMockResponse,
      isLoading: false,
      isError: false,
    });
    render(<MyEventsSection />);
    expect(screen.getByText("See more")).toBeInTheDocument();
  });

  it("renders the 'Add new event' button", () => {
    useQueryMock.mockReturnValueOnce({
      data: shortEventsMockResponse,
      isLoading: false,
      isError: false,
    });
    render(<MyEventsSection />);
    expect(
      screen.getByRole("button", { name: /add new event/i }),
    ).toBeInTheDocument();
  });
});
