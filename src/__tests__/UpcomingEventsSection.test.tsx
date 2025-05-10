import React from "react";
import { render, screen, act, fireEvent } from "@testing-library/react";
import UpcomingEventsSection from "../components/UpcomingEventsSection";
import shortEventsMockResponse from "../components/mock-data/shortEventsMockResponse";
import { api } from "~/trpc/react";

jest.mock("~/trpc/react", () => ({
  api: {
    invitationPreview: {
      getRecentInvitations: {
        useQuery: jest.fn(),
      },
    },
    calendar: {
      getEventsByMonth: {
        useQuery: jest.fn(),
      },
    },
  },
}));

const useQueryMock = api.invitationPreview.getRecentInvitations
  .useQuery as jest.Mock;
const calendarQueryMock = api.calendar.getEventsByMonth.useQuery as jest.Mock;

describe("UpcomingEventsSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Set default mock return values
    useQueryMock.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });

    calendarQueryMock.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });
  });

  it("renders the loading state", () => {
    useQueryMock.mockReturnValueOnce({
      data: [],
      isLoading: true,
      isError: false,
    });
    render(<UpcomingEventsSection />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders the error state", () => {
    useQueryMock.mockReturnValueOnce({
      data: [],
      isLoading: false,
      isError: true,
    });
    render(<UpcomingEventsSection />);
    expect(screen.getByText("Failed to load events.")).toBeInTheDocument();
  });

  it("renders the section title", () => {
    useQueryMock.mockReturnValueOnce({
      data: shortEventsMockResponse,
      isLoading: false,
      isError: false,
    });
    render(<UpcomingEventsSection />);
    expect(screen.getByText("My invitations")).toBeInTheDocument();
  });

  it("renders the calendar with mocked events", () => {
    calendarQueryMock.mockReturnValueOnce({
      data: [{ date: "2025-05-10" }, { date: "2025-05-15" }],
      isLoading: false,
      isError: false,
    });
    render(<UpcomingEventsSection />);
    expect(screen.getByText(/May 2025/i)).toBeInTheDocument();
  });

  it("renders up to 2 event rows", () => {
    useQueryMock.mockReturnValueOnce({
      data: shortEventsMockResponse,
      isLoading: false,
      isError: false,
    });
    render(<UpcomingEventsSection />);
    const displayedEvents = shortEventsMockResponse.slice(0, 2);
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
    render(<UpcomingEventsSection />);
    expect(screen.getByText("See more")).toBeInTheDocument();
  });

  it("renders modal when 'See more' is clicked", async () => {
    useQueryMock.mockReturnValue({
      data: shortEventsMockResponse,
      isLoading: false,
      isError: false,
    });

    render(<UpcomingEventsSection />);

    await act(async () => {
      fireEvent.click(screen.getByText("See more"));
    });

    expect(screen.getByText("All My Invitations")).toBeInTheDocument();
  });

  it("closes the modal when the close button is clicked", async () => {
    useQueryMock.mockReturnValue({
      data: shortEventsMockResponse,
      isLoading: false,
      isError: false,
    });

    render(<UpcomingEventsSection />);

    await act(async () => {
      fireEvent.click(screen.getByText("See more"));
    });

    expect(screen.getByText("All My Invitations")).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByText("✕"));
    });

    expect(screen.queryByText("All My Invitations")).not.toBeInTheDocument();
  });
});
