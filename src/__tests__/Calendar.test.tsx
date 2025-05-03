import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Calendar from "../components/ui/Calendar";
import { format, addMonths, subMonths } from "date-fns";

describe("Calendar component", () => {
  beforeEach(() => {
    jest.useFakeTimers(); // pentru date fixe
    jest.setSystemTime(new Date(2025, 3, 1)); // 1 aprilie 2025
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders current month and year", () => {
    render(<Calendar />);
    expect(screen.getByText("April 2025")).toBeInTheDocument();
  });

  it("highlights preselected dates (8 and 23 April 2025)", () => {
    render(<Calendar />);
    const selectedDates = [8, 23];
    selectedDates.forEach((day) => {
      const el = screen.getByText(day.toString());
      expect(el.parentElement).toHaveClass("selected");
    });
  });

  it("clicking '>' navigates to the next month", () => {
    render(<Calendar />);
    const nextButton = screen.getByText(">");
    const currentMonth = format(new Date(2025, 3, 1), "MMMM yyyy"); // April 2025

    fireEvent.click(nextButton);

    const nextMonth = format(addMonths(new Date(2025, 3, 1), 1), "MMMM yyyy");
    expect(screen.getByText(nextMonth)).toBeInTheDocument();
    expect(screen.queryByText(currentMonth)).not.toBeInTheDocument();
  });

  it("clicking '<' navigates to the previous month", () => {
    render(<Calendar />);
    const prevButton = screen.getByText("<");
    const currentMonth = format(new Date(2025, 3, 1), "MMMM yyyy"); // April 2025

    fireEvent.click(prevButton);

    const prevMonth = format(subMonths(new Date(2025, 3, 1), 1), "MMMM yyyy");
    expect(screen.getByText(prevMonth)).toBeInTheDocument();
    expect(screen.queryByText(currentMonth)).not.toBeInTheDocument();
  });

  it("renders all days of the week", () => {
    render(<Calendar />);
    ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].forEach((day) => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  it("renders all date cells for April 2025", () => {
    render(<Calendar />);
    const daysInApril = 30; // Aprilie are 30 de zile
    for (let day = 1; day <= daysInApril; day++) {
      expect(screen.getAllByText(day.toString()).length).toBeGreaterThan(0);
    }
  });
});