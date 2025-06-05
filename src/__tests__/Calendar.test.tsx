import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Calendar from "../components/ui/Calendar";

jest.mock("date-fns", () => {
  const actual: Record<string, unknown> = jest.requireActual("date-fns");
  return {
    ...actual,
    format: jest.fn().mockImplementation((date: Date, formatStr: string): string => {
      if (formatStr === "MMMM yyyy") return "January 2024";
      if (formatStr === "d") return date.getDate().toString();
      return date.toLocaleDateString();
    }),
  };
});

interface MockQueryResult {
  data?: Array<{
    id: number;
    date: Date | null | undefined;
    title: string;
  }>;
  isLoading: boolean;
}

const mockGetEventsByMonth = jest.fn<MockQueryResult, []>();

jest.mock("~/trpc/react", () => ({
  api: {
    calendar: {
      getEventsByMonth: {
        useQuery: (): MockQueryResult => mockGetEventsByMonth(),
      },
    },
  },
}));

describe("Calendar", () => {
  const mockCurrentDate = new Date(2024, 0, 15); // January 15, 2024
  const mockSetCurrentDate = jest.fn();

  const defaultProps = {
    currentDate: mockCurrentDate,
    setCurrentDate: mockSetCurrentDate,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetEventsByMonth.mockReturnValue({
      data: [],
      isLoading: false,
    });
  });

  it("renders calendar with header and navigation", () => {
    render(<Calendar {...defaultProps} />);
    
    expect(screen.getByText("January 2024")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "<" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: ">" })).toBeInTheDocument();
  });

  it("renders day headers", () => {
    render(<Calendar {...defaultProps} />);
    
    expect(screen.getByText("Mon")).toBeInTheDocument();
    expect(screen.getByText("Tue")).toBeInTheDocument();
    expect(screen.getByText("Wed")).toBeInTheDocument();
    expect(screen.getByText("Thu")).toBeInTheDocument();
    expect(screen.getByText("Fri")).toBeInTheDocument();
    expect(screen.getByText("Sat")).toBeInTheDocument();
    expect(screen.getByText("Sun")).toBeInTheDocument();
  });

  it("shows loading state when events are loading", () => {
    mockGetEventsByMonth.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    render(<Calendar {...defaultProps} />);
    
    expect(screen.getByText("Loading events...")).toBeInTheDocument();
    expect(screen.queryByText("January 2024")).not.toBeInTheDocument();
  });

  it("navigates to previous month when left arrow clicked", () => {
    render(<Calendar {...defaultProps} />);
    
    const prevButton = screen.getByRole("button", { name: "<" });
    fireEvent.click(prevButton);
    
    expect(mockSetCurrentDate).toHaveBeenCalledWith(
      expect.any(Date) // Should be December 2023
    );
  });

  it("navigates to next month when right arrow clicked", () => {
    render(<Calendar {...defaultProps} />);
    
    const nextButton = screen.getByRole("button", { name: ">" });
    fireEvent.click(nextButton);
    
    expect(mockSetCurrentDate).toHaveBeenCalledWith(
      expect.any(Date) // Should be February 2024
    );
  });

  it("renders calendar cells with days", () => {
    render(<Calendar {...defaultProps} />);
    
    // Use getAllByText to handle multiple instances and check specific ones
    const ones = screen.getAllByText("1");
    expect(ones.length).toBeGreaterThan(0);
    
    // Check for days that should be unique in the current month
    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.getByText("31")).toBeInTheDocument();
    
    // Check that calendar body is rendered
    expect(screen.getByText("January 2024")).toBeInTheDocument();
  });

  it("handles events with valid dates", () => {
    const eventsWithDates = [
      { id: 1, date: new Date(2024, 0, 10), title: "Event 1" },
      { id: 2, date: new Date(2024, 0, 20), title: "Event 2" },
    ];

    mockGetEventsByMonth.mockReturnValue({
      data: eventsWithDates,
      isLoading: false,
    });

    render(<Calendar {...defaultProps} />);
    
    // Calendar should render without errors
    expect(screen.getByText("January 2024")).toBeInTheDocument();
  });

  it("handles events with null dates (line 100-101)", () => {
    const eventsWithNullDates = [
      { id: 1, date: new Date(2024, 0, 10), title: "Event 1" },
      { id: 2, date: null, title: "Event with null date" }, // This tests the filter
      { id: 3, date: undefined, title: "Event with undefined date" },
      { id: 4, date: new Date(2024, 0, 25), title: "Event 3" },
    ];

    mockGetEventsByMonth.mockReturnValue({
      data: eventsWithNullDates,
      isLoading: false,
    });

    render(<Calendar {...defaultProps} />);
    
    // Calendar should render without errors despite null/undefined dates
    expect(screen.getByText("January 2024")).toBeInTheDocument();
  });

  it("handles empty events array", () => {
    mockGetEventsByMonth.mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(<Calendar {...defaultProps} />);
    
    expect(screen.getByText("January 2024")).toBeInTheDocument();
  });

  it("handles undefined events data", () => {
    mockGetEventsByMonth.mockReturnValue({
      data: undefined,
      isLoading: false,
    });

    render(<Calendar {...defaultProps} />);
    
    expect(screen.getByText("January 2024")).toBeInTheDocument();
  });

  it("applies selected class to days with events", () => {
    const eventsWithDates = [
      { id: 1, date: new Date(2024, 0, 10), title: "Event 1" },
    ];

    mockGetEventsByMonth.mockReturnValue({
      data: eventsWithDates,
      isLoading: false,
    });

    render(<Calendar {...defaultProps} />);
    
    // The day with event should have selected class
    const dayElement = screen.getByText("10").closest('div');
    expect(dayElement).toHaveClass("selected");
  });

  it("applies disabled class to days outside current month", () => {
    render(<Calendar {...defaultProps} />);
    
    // Check that there are disabled days (from next month)
    const disabledDays = screen.getAllByText("1");
    const disabledDay = disabledDays.find(day => 
      day.closest('div')?.classList.contains('disabled')
    );
    expect(disabledDay).toBeTruthy();
  });
});