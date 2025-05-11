import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Calendar from "../components/ui/Calendar"; 
import { api } from "~/trpc/react";

jest.mock("~/trpc/react", () => ({
  api: {
    calendar: {
      getEventsByMonth: {
        useQuery: jest.fn(),
      },
    },
  },
}));

const useQueryMock = api.calendar.getEventsByMonth.useQuery as jest.Mock;

describe("Calendar component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state", () => {
    useQueryMock.mockReturnValueOnce({
      data: undefined,
      isLoading: true,
    });

    render(<Calendar />);
    expect(screen.getByText(/loading events/i)).toBeInTheDocument();
  });

  it("renders current month and days of week", () => {
    useQueryMock.mockReturnValueOnce({
      data: [],
      isLoading: false,
    });

    render(<Calendar />);


    const currentMonth = new Date().toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
    expect(screen.getByText(currentMonth)).toBeInTheDocument();


    ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].forEach((day) => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  it("renders selected event days", () => {
    const today = new Date();
    useQueryMock.mockReturnValueOnce({
      data: [{ date: today.toISOString() }],
      isLoading: false,
    });

    render(<Calendar />);

    const cell = screen.getByText(today.getDate().toString()).parentElement;
    expect(cell?.className).toMatch(/selected/);
  });

  it("renders disabled cells for days outside current month", () => {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    lastMonth.setDate(1);

    useQueryMock.mockReturnValueOnce({
      data: [{ date: lastMonth.toISOString() }],
      isLoading: false,
    });

    render(<Calendar />);

    const cell = screen
      .getAllByText("1")
      .find((el) => el.parentElement?.className.includes("disabled"));
    expect(cell).toBeDefined();
  });

  it("navigates to next and previous month", () => {
    useQueryMock.mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(<Calendar />);

    const nextButton = screen.getByRole("button", { name: ">" });
    const prevButton = screen.getByRole("button", { name: "<" });

    fireEvent.click(nextButton);
    fireEvent.click(prevButton);

    expect(screen.getByText(/^\w+ \d{4}$/)).toBeInTheDocument();
  });
});
